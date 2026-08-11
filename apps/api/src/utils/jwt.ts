import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

export const signAccessToken = (payload: { sub: string; email: string }): string =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn as any });

export const signRefreshToken = (payload: { sub: string }): string =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn as any });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
  // Defense in depth: a 2FA temp token is signed with the same secret (to
  // avoid provisioning a third JWT secret) but carries `aud: "2fa-pending"`.
  // Real access tokens never set `aud`, so explicitly refuse any token that
  // does — otherwise a leaked temp token could be replayed as a full session.
  if (payload.aud) {
    throw new Error("Token is not a valid access token");
  }
  return payload;
};

export const verifyRefreshToken = (token: string): JwtPayload & { sub: string } =>
  jwt.verify(token, env.jwt.refreshSecret) as JwtPayload & { sub: string };

/**
 * Short-lived token issued after a correct password but before a successful
 * TOTP challenge. It only ever authorizes the /auth/2fa/login-verify route —
 * it is never accepted by requireAuth — so a leaked temp token can't be used
 * to bypass the second factor.
 */
export const signTwoFactorTempToken = (payload: { sub: string }): string =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: "5m", audience: "2fa-pending" });

export const verifyTwoFactorTempToken = (token: string): JwtPayload & { sub: string } =>
  jwt.verify(token, env.jwt.accessSecret, { audience: "2fa-pending" }) as JwtPayload & { sub: string };
