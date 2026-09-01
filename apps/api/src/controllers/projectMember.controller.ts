import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { projectMemberService } from "@/services/projectMember.service";

export const projectMemberController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const members = await projectMemberService.list(req.params.id!, req.user!.id);
    res.status(200).json({ members });
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const member = await projectMemberService.updateRole(req.params.id!, req.params.userId!, req.body.role, req.user!.id);
    res.status(200).json({ member });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await projectMemberService.remove(req.params.id!, req.params.userId!, req.user!.id);
    res.status(204).send();
  }),
};
