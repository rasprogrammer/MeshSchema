import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { tableLockService } from "@/services/tableLock.service";

export const tableLockController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const locks = await tableLockService.list(req.params.id!, req.user!.id);
    res.status(200).json({ locks });
  }),

  acquire: asyncHandler(async (req: Request, res: Response) => {
    const lock = await tableLockService.acquire(req.params.id!, req.params.tableName!, req.user!.id);
    res.status(200).json({ lock });
  }),

  release: asyncHandler(async (req: Request, res: Response) => {
    await tableLockService.release(req.params.id!, req.params.tableName!, req.user!.id);
    res.status(204).send();
  }),
};
