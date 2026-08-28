import { Router } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import projectRoutes from "./project.routes";
import aiRoutes from "./ai.routes";
import wsAuthRoutes from "./ws-auth.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/projects", projectRoutes);
router.use("/ai", aiRoutes);
router.use("/ws-auth", wsAuthRoutes);

export default router;
