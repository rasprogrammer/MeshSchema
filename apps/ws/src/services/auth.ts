import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Verifies a WebSocket connection's access token. Mirrors apps/api's
 * `verifyAccessToken` exactly, including the defense-in-depth check that
 * rejects a leaked 2FA-pending temp token (it shares the access-token
 * secret but carries `aud: "2fa-pending"`) from ever being accepted as a
 * real session here.
 */
export function authenticateConnection(token: string): AuthenticatedUser | null {
  if (!token) {
    logger.warn("[authenticateConnection] No token provided");
    return null;
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as JwtPayload & {
      sub: string;
      email: string;
    };

    if (payload.aud) {
      logger.warn("[authenticateConnection] Rejected non-access token (aud set)");
      return null;
    }

    if (!payload.sub || !payload.email) {
      logger.warn("[authenticateConnection] Token missing sub/email");
      return null;
    }

    return { id: payload.sub, email: payload.email };
  } catch (error) {
    logger.warn({ error }, "[authenticateConnection] JWT verification failed");
    return null;
  }
}
