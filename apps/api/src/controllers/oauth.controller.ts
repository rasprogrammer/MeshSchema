import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { setAuthCookies } from "../utils/cookies";
import { env } from "../config/env";

/**
 * Shared handler for the end of any passport OAuth strategy callback.
 * `req.user` was populated by passport's verify callback (findOrCreateOAuthUser).
 * We issue our own first-party session cookies and redirect back into the SPA —
 * the OAuth provider's tokens never reach the browser.
 */
export const oauthController = {
  callback: asyncHandler(async (req: Request, res: Response) => {
    const oauthUser = req.user as unknown as { id: string; email: string; name: string };
    const { tokens } = await authService.loginOAuthUser(oauthUser);
    setAuthCookies(res, tokens);
    res.redirect(`${env.frontendUrl}/dashboard`);
  }),
};
