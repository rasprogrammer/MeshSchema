import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Schema Designer";

// otplib defaults (30s step, 6 digits, SHA1) match Google Authenticator / Authy.
// Allow a 1-step window on either side to tolerate clock drift.
authenticator.options = { window: 1 };

export const totpService = {
  generateSecret(): string {
    return authenticator.generateSecret();
  },

  async generateQrCodeDataUrl(email: string, secret: string): Promise<string> {
    const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
    return QRCode.toDataURL(otpauthUrl);
  },

  verify(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  },
};
