import { Request, Response } from "express";
import { aiService } from "../services/ai.service";
import { asyncHandler } from "../utils/asyncHandler";

export const aiController = {
  generate: asyncHandler(async (req: Request, res: Response) => {
    const result = await aiService.generateSchema(req.body.prompt);
    res.status(200).json(result);
  }),

  improve: asyncHandler(async (req: Request, res: Response) => {
    const result = await aiService.improveSchema(req.body.dbml, req.body.instructions);
    res.status(200).json(result);
  }),

  explain: asyncHandler(async (req: Request, res: Response) => {
    const result = await aiService.explainSchema(req.body.dbml);
    res.status(200).json(result);
  }),

  detectIssues: asyncHandler(async (req: Request, res: Response) => {
    const result = await aiService.detectIssues(req.body.dbml);
    res.status(200).json(result);
  }),
};
