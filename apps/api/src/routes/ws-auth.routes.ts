import { Router } from "express";
import {  verifyAccessToken } from "../utils/jwt.js";
import { getAccessTokenFromRequest } from "../utils/cookies.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const router = Router();

/**
 * POST /api/ws-auth/token
 * Returns a short-lived JWT for WebSocket authentication.
 * Reads the access_token from the httpOnly cookie, verifies it,
 * then issues a new short-lived token that the WebSocket server accepts.
 */
router.post("/token", (req, res) => {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Missing or expired session -" });
  }

  try {
    const payload = verifyAccessToken(token);
    const wsToken = jwt.sign(
      { userId: payload.sub, role: "ws" },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );
    res.json({ token: wsToken });
  } catch (error) {
    console.error("WS token generation failed:", error);
    res.status(500).json({ error: "Failed to generate WebSocket token" });
  }
});

export default router;