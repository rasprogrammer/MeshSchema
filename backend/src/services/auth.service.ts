import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { ConflictError, UnauthorizedError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { AuthTokens } from "../types";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function publicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email };
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

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

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

  async logout(refreshToken: string) {
    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (stored && !stored.revoked) {
      await refreshTokenRepository.revoke(refreshToken);
    }
  },
};
