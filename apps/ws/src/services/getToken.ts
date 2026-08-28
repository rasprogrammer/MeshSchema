import type { IncomingMessage } from "http";
import { getAccessToken } from "../utils/cookies";

/**
 * The WebSocket handshake is a plain HTTP GET, so the browser attaches the
 * httpOnly `access_token` cookie automatically, same as any same-site REST
 * call to apps/api. A `?token=` query param is kept as a fallback for
 * clients that can't set cookies (CLI tools, tests) — never relied on by
 * the browser app.
 */
export function getToken(request: IncomingMessage): string | null {
  const cookieToken = getAccessToken(request.headers);
  if (cookieToken) return cookieToken;

  const url = request.url || "";
  const queryString = url.split("?")[1];
  if (!queryString) return null;

  return new URLSearchParams(queryString).get("token");
}
