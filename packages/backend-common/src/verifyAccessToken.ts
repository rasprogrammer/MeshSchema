import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

/**
 * Verifies an api-issued access token. Shared by every service that only
 * needs to confirm "who is this user" (e.g. the websocket server) so the
 * signing/refresh/2FA-issuing logic stays owned exclusively by the api service.
 *
 * Throws on invalid/expired tokens. Also rejects a 2FA-pending temp token
 * (signed with the same secret but carrying `aud: "2fa-pending"`) so a leaked
 * temp token can never be replayed as a full session.
 */
export const verifyAccessToken = (token: string, secret: string): AccessTokenPayload => {
  const payload = jwt.verify(token, secret) as AccessTokenPayload;

  // Reject 2FA temp tokens — they should only be accepted by the
  // dedicated /auth/2fa/login-verify endpoint, never as a full session.
  if (payload.aud === "2fa-pending") {
    throw new Error("2FA-pending tokens cannot be used as access tokens");
  }

  if (!payload.sub || !payload.email) {
    throw new Error("Token is not a valid access token");
  }

  return payload;
};

