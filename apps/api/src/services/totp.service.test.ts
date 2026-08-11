import { describe, it, expect } from "vitest";
import { authenticator } from "otplib";
import { totpService } from "./totp.service";

describe("totpService", () => {
  it("generates a base32 secret", () => {
    const secret = totpService.generateSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });

  it("verifies a code generated from the same secret", () => {
    const secret = totpService.generateSecret();
    const code = authenticator.generate(secret);
    expect(totpService.verify(code, secret)).toBe(true);
  });

  it("rejects an incorrect code", () => {
    const secret = totpService.generateSecret();
    expect(totpService.verify("000000", secret)).toBe(false);
  });

  it("rejects a code generated from a different secret", () => {
    const secretA = totpService.generateSecret();
    const secretB = totpService.generateSecret();
    const codeFromB = authenticator.generate(secretB);
    expect(totpService.verify(codeFromB, secretA)).toBe(false);
  });

  it("produces a scannable QR code data URL", async () => {
    const secret = totpService.generateSecret();
    const dataUrl = await totpService.generateQrCodeDataUrl("user@example.com", secret);
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
