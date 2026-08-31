import { Request, Response } from "express";
import { profileService } from "@/services/profile.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { BadRequestError, UnauthorizedError } from "@/utils/AppError";

export const profileController = {
    profileUpdate: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError("user Id not found");
        }
        const result = await profileService.update(userId, req.body);
        res.status(200).json(result);
    }),

    updateAvatar: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError("user Id not found");
        }
        if (!req.file) {
            throw new BadRequestError("No avatar file uploaded");
        }
        const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
        const result = await profileService.updateAvatar(userId, avatarUrl);
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