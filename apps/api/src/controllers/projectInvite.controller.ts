import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { projectInviteService } from "@/services/projectInvite.service";
import { UnauthorizedError } from "@/utils/AppError";

export const projectInviteController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const invite = await projectInviteService.create(req.params.id!, req.user!.id, req.body);
    res.status(201).json({ invite });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const invites = await projectInviteService.list(req.params.id!, req.user!.id);
    res.status(200).json({ invites });
  }),

  revoke: asyncHandler(async (req: Request, res: Response) => {
    await projectInviteService.revoke(req.params.id!, req.params.inviteId!, req.user!.id);
    res.status(204).send();
  }),

  accept: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const result = await projectInviteService.accept(req.params.token!, req.user);
    res.status(200).json(result);
  }),
};
