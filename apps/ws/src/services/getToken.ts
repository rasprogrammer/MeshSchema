import type { IncomingMessage } from "http";
import { getAccessToken } from "../utils/cookies";

/**
 * Extracts the access token from a WebSocket handshake request.
 *
 * Primary: httpOnly `access_token` cookie (set by apps/api) — the browser
 * sends it automatically on the upgrade GET so the token never appears in
 * the URL or JS.
 *
 * Fallback: `?token=` query param for non-browser clients (CLI, tests).
 */
export function getToken(request: IncomingMessage): string {
  const cookieToken = getAccessToken(request.headers);
  if (cookieToken) return cookieToken;

  const url = request.url || "";
  const queryString = url.split("?")[1];
  if (queryString) {
    const fromQuery = new URLSearchParams(queryString).get("token");
    if (fromQuery) return fromQuery;
  }

  return "";
}
