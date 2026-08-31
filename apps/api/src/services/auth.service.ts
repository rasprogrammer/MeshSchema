import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signTwoFactorTempToken,
  verifyTwoFactorTempToken,
} from "../utils/jwt";
import { ConflictError, UnauthorizedError, BadRequestError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { AuthTokens } from "../types";
import { totpService } from "./totp.service";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function publicUser(user: { id: string; name: string; email: string; twoFactorEnabled?: boolean; avatarUrl?: string | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    twoFactorEnabled: !!user.twoFactorEnabled,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

async function issueTokens(user: { id: string; email: string }): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  await refreshTokenRepository.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const tokens = await issueTokens(user);
    return { user: publicUser(user), tokens };
  },

  /**
   * Password-based login. If the account has TOTP 2FA enabled, this does NOT
   * issue a session — it returns a short-lived `twoFactorToken` that must be
   * exchanged via `verifyTwoFactorLogin` for the real session tokens.
   */
  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.twoFactorEnabled) {
      return {
        twoFactorRequired: true as const,
        twoFactorToken: signTwoFactorTempToken({ sub: user.id }),
      };
    }

    const tokens = await issueTokens(user);
    return { twoFactorRequired: false as const, user: publicUser(user), tokens };
  },

  async verifyTwoFactorLogin(twoFactorToken: string, code: string) {
    let payload;
    try {
      payload = verifyTwoFactorTempToken(twoFactorToken);
    } catch {
      throw new UnauthorizedError("Two-factor challenge has expired, please log in again");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedError("Two-factor authentication is not enabled for this account");
    }

    const valid = totpService.verify(code, user.twoFactorSecret);
    if (!valid) {
      throw new UnauthorizedError("Invalid authentication code");
    }

    const tokens = await issueTokens(user);
    return { user: publicUser(user), tokens };
  },

  /** Used by OAuth callback routes — no password/2FA involved. */
  async loginOAuthUser(user: { id: string; email: string; name: string; twoFactorEnabled?: boolean }) {
    const tokens = await issueTokens(user);
    return { user: publicUser(user), tokens };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token has been revoked or expired");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    // Rotate: revoke the old token and issue a new pair.
    await refreshTokenRepository.revoke(refreshToken);
    const tokens = await issueTokens(user);
    return { user: publicUser(user), tokens };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (stored && !stored.revoked) {
      await refreshTokenRepository.revoke(refreshToken);
    }
  },

  // --- TOTP-based 2FA management (requires an authenticated session) ---

  async setupTwoFactor(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError("User no longer exists");

    const secret = totpService.generateSecret();
    await userRepository.setTwoFactorSecret(userId, secret);
    const qrCodeDataUrl = await totpService.generateQrCodeDataUrl(user.email, secret);
    return { secret, qrCodeDataUrl };
  },

  async confirmTwoFactor(userId: string, code: string) {
    const user = await userRepository.findById(userId);
    if (!user?.twoFactorSecret) {
      throw new BadRequestError("Call /auth/2fa/setup first to generate a secret");
    }

    const valid = totpService.verify(code, user.twoFactorSecret);
    if (!valid) {
      throw new UnauthorizedError("Invalid authentication code");
    }

    await userRepository.setTwoFactorEnabled(userId, true);
    return { enabled: true };
  },

  async disableTwoFactor(userId: string, code: string) {
    const user = await userRepository.findById(userId);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestError("Two-factor authentication is not enabled");
    }

    const valid = totpService.verify(code, user.twoFactorSecret);
    if (!valid) {
      throw new UnauthorizedError("Invalid authentication code");
    }

    await userRepository.setTwoFactorEnabled(userId, false);
    await userRepository.setTwoFactorSecret(userId, null);
    return { enabled: false };
  },
};
