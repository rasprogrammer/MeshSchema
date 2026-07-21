import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

/**
 * Protects a route by requiring a valid `Authorization: Bearer <token>` header.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
