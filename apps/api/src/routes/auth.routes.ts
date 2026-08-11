import { Router } from "express";
import passport from "../config/passport";
import { authController } from "../controllers/auth.controller";
import { oauthController } from "../controllers/oauth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { authRateLimiter } from "../middlewares/rateLimiter";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  twoFactorVerifyLoginSchema,
  twoFactorCodeSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post(
  "/2fa/login-verify",
  authRateLimiter,
  validate({ body: twoFactorVerifyLoginSchema }),
  authController.verifyTwoFactorLogin
);
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

// Authenticated 2FA management
router.post("/2fa/setup", requireAuth, authController.setupTwoFactor);
router.post("/2fa/confirm", requireAuth, validate({ body: twoFactorCodeSchema }), authController.confirmTwoFactor);
router.post("/2fa/disable", requireAuth, validate({ body: twoFactorCodeSchema }), authController.disableTwoFactor);

// OAuth (Google / GitHub) — stateless, session: false, since we issue our own JWT cookies
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=oauth" }),
  oauthController.callback
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login?error=oauth" }),
  oauthController.callback
);

export default router;
