import { Request, Response } from "express";
import { aiService } from "../services/ai.service";
import { asyncHandler } from "../utils/asyncHandler";

function startSse(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

function sendSseEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export const aiController = {
  /**
   * SSE stream of raw DBML text deltas, ending with a `done` event containing
   * the final validated `{ dbml }`. The frontend renders the streaming text
   * live, then shows a diff-preview (current vs. proposed) once `done` fires
   * — the user explicitly accepts or rejects before anything is applied.
   */
  generateStream: asyncHandler(async (req: Request, res: Response) => {
    startSse(res);
    try {
      const result = await aiService.streamGenerateSchema(req.body.prompt, (chunk) =>
        sendSseEvent(res, "delta", { chunk })
      );
      sendSseEvent(res, "done", result);
    } catch (err: any) {
      sendSseEvent(res, "error", { message: err?.message ?? "AI generation failed" });
    } finally {
      res.end();
    }
  }),

  improveStream: asyncHandler(async (req: Request, res: Response) => {
    startSse(res);
    try {
      const result = await aiService.streamImproveSchema(req.body.dbml, req.body.instructions, (chunk) =>
        sendSseEvent(res, "delta", { chunk })
      );
      sendSseEvent(res, "done", result);
    } catch (err: any) {
      sendSseEvent(res, "error", { message: err?.message ?? "AI improve failed" });
    } finally {
      res.end();
    }
  }),

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
