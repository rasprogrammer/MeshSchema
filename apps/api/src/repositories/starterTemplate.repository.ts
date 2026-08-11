import { prisma, StarterTemplateSchema } from "@/config/prisma";


export const starterTemplateRepository = {

    findAll(): Promise<StarterTemplateSchema[] | null> {
        return prisma.starterTemplateSchema.findMany();
    },

    findById(Id: string): Promise<StarterTemplateSchema | null> {
        return prisma.starterTemplateSchema.findUnique({ where: { id: Id }});
    }
};