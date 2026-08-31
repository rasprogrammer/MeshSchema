import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { setAuthCookies, clearAuthCookies, getRefreshTokenFromRequest } from "../utils/cookies";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setAuthCookies(res, result.tokens);
    res.status(201).json({ user: result.user });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    if (result.twoFactorRequired) {
      // No cookies yet — the session is only established after the TOTP check.
      res.status(200).json({ twoFactorRequired: true, twoFactorToken: result.twoFactorToken });
      return;
    }
    setAuthCookies(res, result.tokens);
    res.status(200).json({ twoFactorRequired: false, user: result.user });
  }),

  verifyTwoFactorLogin: asyncHandler(async (req: Request, res: Response) => {
    const { twoFactorToken, code } = req.body;
    const result = await authService.verifyTwoFactorLogin(twoFactorToken, code);
    setAuthCookies(res, result.tokens);
    res.status(200).json({ user: result.user });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      res.status(401).json({ error: { message: "Missing refresh token" } });
      return;
    }
    const result = await authService.refresh(refreshToken);
    setAuthCookies(res, result.tokens);
    res.status(200).json({ user: result.user });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    await authService.logout(refreshToken);
    clearAuthCookies(res);
    res.status(204).send();
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ user });
  }),

  // --- 2FA management (authenticated) ---
  setupTwoFactor: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.setupTwoFactor(req.user!.id);
    res.status(200).json(result);
  }),

  confirmTwoFactor: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.confirmTwoFactor(req.user!.id, req.body.code);
    res.status(200).json(result);
  }),

  disableTwoFactor: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.disableTwoFactor(req.user!.id, req.body.code);
    res.status(200).json(result);
  }),
};
