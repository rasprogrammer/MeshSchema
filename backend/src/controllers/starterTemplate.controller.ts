import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { starterTemplateRepository } from "@/repositories/starterTemplate.repository";
import { staterTemplateService } from "@/services/starterTemplate.service";


export const starterTemplateController = {
    list: asyncHandler(async (req: Request, res: Response) => {
        const starterTemplates = await staterTemplateService.list();
        res.status(200).json({ starterTemplates });
    })
};