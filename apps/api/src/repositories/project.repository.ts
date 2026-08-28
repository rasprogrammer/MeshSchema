import { BadRequestError } from "@/utils/AppError";
import { prisma, StarterTemplateSchema } from "../config/prisma";
import { Project } from "../config/prisma";
import { starterTemplateRepository } from "./starterTemplate.repository";

export const projectRepository = {
  findAllByOwner(ownerId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  },

  create(data: { name: string; description?: string; ownerId: string; isPrivate: boolean; password?: string }): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        schema: { create: { dbml: "" } },
      },
    });
  },

  async createWithStarterTemplate(data: { templateId: string, name: string; description?: string; ownerId: string; }): Promise<Project> { 
    const starterTemplate: StarterTemplateSchema | null = await starterTemplateRepository.findById(data.templateId);
    
    if (!starterTemplate) {
      throw new BadRequestError("Template not exists");
    }

    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        schema: {
          create: { dbml: starterTemplate.dbml }
        }
      }
    })

  },

  update(id: string, data: { name?: string; description?: string; isPrivate?: boolean; password?: string }): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } });
  },
};
