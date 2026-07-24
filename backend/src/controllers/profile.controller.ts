import { Request, Response } from "express";
import { profileService } from "@/services/profile.service";
import { asyncHandler } from "@/utils/asyncHandler";

export const profileController = {
    profileUpdate: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user?.id) {
            throw new Error("");
        }
        const result = await profileService.update(req.user.id, req.body);
        res.status(200).json(result);
    })
};