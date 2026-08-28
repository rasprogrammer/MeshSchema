import { verifyAccessToken } from "@repo/backend-common";
import { env } from "../config/env";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Verifies a WebSocket connection's access token using the same secret and
 * payload shape as apps/api. Purely stateless — ws never signs, rotates, or
 * checks refresh tokens; that stays exclusively apps/api's responsibility.
 * A user who logged out keeps their existing access token valid until it
 * naturally expires (mirrors apps/api's own requireAuth behavior).
 */
export function authenticateConnection(token: string | null): AuthenticatedUser | null {
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token, env.jwtAccessSecret);
    if (!payload.sub || !payload.email) return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}