import { CookieOptions, Response } from "express";
import { env } from "../config/env";
import { AuthTokens } from "../types";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: "/",
};

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15m, mirrors JWT_ACCESS_EXPIRES_IN default
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7d, mirrors JWT_REFRESH_EXPIRES_IN default

/**
 * Sets both the access and refresh tokens as httpOnly cookies.
 * This replaces returning tokens in the JSON body (which was vulnerable to
 * XSS-based token theft when tokens were persisted to localStorage).
 */
export function setAuthCookies(res: Response, tokens: AuthTokens): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
}

export function getAccessTokenFromRequest(req: { cookies?: Record<string, string>; headers: any }): string | undefined {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;

  // Backward-compatible fallback for non-browser clients (e.g. CLI/mobile) that
  // can't rely on cookies and still send a Bearer header.
  const header = req.headers?.authorization as string | undefined;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return undefined;
}

export function getRefreshTokenFromRequest(req: { cookies?: Record<string, string>; body?: any }): string | undefined {
  return req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
}

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE };
