import { BadRequestError } from "@/utils/AppError";
import { prisma, StarterTemplateSchema, Prisma } from "../config/prisma";
import { Project } from "../config/prisma";
import { starterTemplateRepository } from "./starterTemplate.repository";

export interface ProjectListOptions {
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  favoritesOnly?: boolean;
}

export const projectRepository = {
  /** Owned + member projects (excluding soft-deleted), with dashboard search/sort/favorite support. */
  async findAccessible(userId: string, options: ProjectListOptions = {}) {
    const { search, sort = "updatedAt", order = "desc", favoritesOnly = false } = options;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      OR: [{ ownerId: userId }, { projectMembers: { some: { userId } } }],
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(favoritesOnly ? { favorites: { some: { userId } } } : {}),
    };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { [sort]: order },
      include: { favorites: { where: { userId }, select: { id: true } } },
    });

    return projects.map(({ favorites, ...project }) => ({ ...project, isFavorite: favorites.length > 0 }));
  },

  findTrash(ownerId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { ownerId, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  findAllByOwner(ownerId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { ownerId, deletedAt: null },
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

  /** Clones a project's metadata + latest schema DBML into a brand new project owned by `ownerId`. */
  duplicate(source: Project, dbml: string, ownerId: string, name: string): Promise<Project> {
    return prisma.project.create({
      data: {
        name,
        description: source.description,
        ownerId,
        forkedFromId: source.id,
        schema: { create: { dbml } },
      },
    });
  },

  update(id: string, data: { name?: string; description?: string; isPrivate?: boolean; password?: string }): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  },

  softDelete(id: string): Promise<Project> {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  restore(id: string): Promise<Project> {
    return prisma.project.update({ where: { id }, data: { deletedAt: null } });
  },

  /** Permanent delete — only meant to be called on already soft-deleted projects (trash purge). */
  delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } });
  },

  async toggleFavorite(projectId: string, userId: string): Promise<boolean> {
    const existing = await prisma.projectFavorite.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (existing) {
      await prisma.projectFavorite.delete({ where: { id: existing.id } });
      return false;
    }

    await prisma.projectFavorite.create({ data: { projectId, userId } });
    return true;
  },
};

