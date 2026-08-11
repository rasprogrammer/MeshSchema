import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { getAccessTokenFromRequest } from "../utils/cookies";

/**
 * Protects a route by requiring a valid access token, read from the
 * `access_token` httpOnly cookie (falling back to a Bearer header for
 * non-browser clients, e.g. CLI or mobile integrations).
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    throw new UnauthorizedError("Missing or expired session");
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
