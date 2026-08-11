import cookie from "cookie";
import type { IncomingMessage } from "http";

/**
 * The WebSocket handshake is a plain HTTP GET request, so the browser
 * attaches the httpOnly `access_token` cookie automatically — exactly like
 * any same-site `fetch`/axios call. This keeps the token out of the URL
 * (no logging/proxy exposure) and matches the REST API's auth model, so
 * there's exactly one place a token can leak from instead of two.
 *
 * A `?token=` query param is accepted as a fallback for tooling that can't
 * set cookies (local scripts, tests) — never relied on by the browser app.
 */
export function getToken(request: IncomingMessage): string {
  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const parsed = cookie.parse(cookieHeader);
    if (parsed.access_token) return parsed.access_token;
  }

  const url = request.url;
  if (url) {
    const [, queryString] = url.split("?");
    if (queryString) {
      const fromQuery = new URLSearchParams(queryString).get("token");
      if (fromQuery) return fromQuery;
    }
  }

  return "";
}
