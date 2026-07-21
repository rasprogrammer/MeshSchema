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

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): JwtPayload & { sub: string } =>
  jwt.verify(token, env.jwt.refreshSecret) as JwtPayload & { sub: string };
