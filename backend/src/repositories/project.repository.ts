import { prisma } from "../config/prisma";
import { Project } from "@prisma/client";

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

  create(data: { name: string; description?: string; ownerId: string }): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        schema: { create: { dbml: "" } },
      },
    });
  },

  update(id: string, data: { name?: string; description?: string }): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } });
  },
};
