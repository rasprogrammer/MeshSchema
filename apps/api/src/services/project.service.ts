import { hashPassword } from "@/utils/password";
import { projectRepository, ProjectListOptions } from "../repositories/project.repository";
import { schemaRepository } from "../repositories/schema.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { requireProjectRole } from "./projectAccess.service";
import { CreateProjectInput, createWithStarterTemplateInput, UpdateProjectInput } from "../validators/project.validator";

async function getOwnedProjectOrThrow(projectId: string, userId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project || project.deletedAt) throw new NotFoundError("Project not found");
  if (project.ownerId !== userId) throw new ForbiddenError("You do not have access to this project");
  return project;
}

export const projectService = {
  list(userId: string, options: ProjectListOptions) {
    return projectRepository.findAccessible(userId, options);
  },

  trash(ownerId: string) {
    return projectRepository.findTrash(ownerId);
  },

  async getById(projectId: string, userId: string) {
    const { project, role } = await requireProjectRole(projectId, userId, "VIEWER");
    return { ...project, role };
  },

  async create(ownerId: string, input: CreateProjectInput) {
    const isPrivate = input.isPrivate ?? false;
    const password = isPrivate ? input.password : undefined;
    const hashedPassword = password ? await hashPassword(password) : undefined;
    return projectRepository.create({ ...input, ownerId, isPrivate, password: hashedPassword });
  },

  createWithStarterTemplate(ownerId: string, input: createWithStarterTemplateInput) {
    return projectRepository.createWithStarterTemplate({ ...input, ownerId });
  },

  async update(projectId: string, userId: string, input: UpdateProjectInput) {
    await requireProjectRole(projectId, userId, "OWNER");
    return projectRepository.update(projectId, input);
  },

  /** Soft delete — moves the project into the trash view instead of destroying data. */
  async delete(projectId: string, userId: string) {
    await requireProjectRole(projectId, userId, "OWNER");
    await projectRepository.softDelete(projectId);
  },

  async restore(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project || !project.deletedAt) throw new NotFoundError("Project not found in trash");
    if (project.ownerId !== userId) throw new ForbiddenError("You do not have access to this project");
    return projectRepository.restore(projectId);
  },

  /** Permanently deletes a project — only allowed once it's already in the trash. */
  async purge(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project || !project.deletedAt) throw new NotFoundError("Project not found in trash");
    if (project.ownerId !== userId) throw new ForbiddenError("You do not have access to this project");
    await projectRepository.delete(projectId);
  },

  async duplicate(projectId: string, userId: string) {
    const { project } = await requireProjectRole(projectId, userId, "VIEWER");
    const schema = await schemaRepository.findByProjectId(projectId);
    return projectRepository.duplicate(project, schema?.dbml ?? "", userId, `${project.name} (copy)`);
  },

  async toggleFavorite(projectId: string, userId: string) {
    await requireProjectRole(projectId, userId, "VIEWER");
    const isFavorite = await projectRepository.toggleFavorite(projectId, userId);
    return { isFavorite };
  },

  assertOwnership: getOwnedProjectOrThrow,
};

