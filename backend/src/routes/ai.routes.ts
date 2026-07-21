import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  aiGenerateSchema,
  aiImproveSchema,
  aiExplainSchema,
  aiDetectIssuesSchema,
} from "../validators/ai.validator";

const router = Router();

router.use(requireAuth);

router.post("/generate", validate({ body: aiGenerateSchema }), aiController.generate);
router.post("/improve", validate({ body: aiImproveSchema }), aiController.improve);
router.post("/explain", validate({ body: aiExplainSchema }), aiController.explain);
router.post("/detect-issues", validate({ body: aiDetectIssuesSchema }), aiController.detectIssues);

export default router;
