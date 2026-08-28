import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken as sharedVerifyAccessToken, AccessTokenPayload } from "@repo/backend-common";
import { env } from "../config/env";

export type { AccessTokenPayload };

export const signAccessToken = (payload: { sub: string; email: string }): string =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn as any });

export const signRefreshToken = (payload: { sub: string }): string =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn as any });

// Delegates to @repo/backend-common so every service that needs to verify an
// api-issued access token (e.g. the websocket server) shares this exact logic.
export const verifyAccessToken = (token: string): AccessTokenPayload =>
  sharedVerifyAccessToken(token, env.jwt.accessSecret);

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
