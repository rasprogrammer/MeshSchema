import rateLimit from "express-rate-limit";

/**
 * Throttles auth endpoints (login/register/2FA) to slow down credential
 * stuffing and brute-force TOTP guessing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many attempts, please try again later" } },
});
