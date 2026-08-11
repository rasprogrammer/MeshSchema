import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signTwoFactorTempToken,
  verifyTwoFactorTempToken,
} from "./jwt";

describe("access tokens", () => {
  it("round-trips sub/email", () => {
    const token = signAccessToken({ sub: "user-1", email: "a@b.com" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("a@b.com");
  });

  it("rejects a garbage token", () => {
    expect(() => verifyAccessToken("not-a-real-token")).toThrow();
  });
});

describe("refresh tokens", () => {
  it("round-trips sub", () => {
    const token = signRefreshToken({ sub: "user-2" });
    expect(verifyRefreshToken(token).sub).toBe("user-2");
  });

  it("an access token cannot be verified as a refresh token (different secret)", () => {
    const access = signAccessToken({ sub: "user-3", email: "x@y.com" });
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});

describe("2FA temp tokens", () => {
  it("round-trips sub and is accepted by verifyTwoFactorTempToken", () => {
    const token = signTwoFactorTempToken({ sub: "user-4" });
    expect(verifyTwoFactorTempToken(token).sub).toBe("user-4");
  });

  it("CRITICAL: a 2FA temp token must never be usable as a real access token", () => {
    // This is the exact vulnerability class the 2FA flow is meant to close:
    // a leaked/short-lived pending token must not grant a full session.
    const tempToken = signTwoFactorTempToken({ sub: "user-5" });
    expect(() => verifyAccessToken(tempToken)).toThrow();
  });

  it("a real access token must never be usable as a 2FA temp token", () => {
    const accessToken = signAccessToken({ sub: "user-6", email: "x@y.com" });
    expect(() => verifyTwoFactorTempToken(accessToken)).toThrow();
  });
});
