import { Request, Response } from "express";
import { profileService } from "@/services/profile.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { UnauthorizedError } from "@/utils/AppError";

export const profileController = {
    profileUpdate: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError("user Id not found");
        }
        const result = await profileService.update(userId, req.body);
        res.status(200).json(result);
    }),

    updatePassword: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError("User not found");
        }
        const result = await profileService.updatePassword(userId, req.body);
        res.status(200).json(result);
    })
};