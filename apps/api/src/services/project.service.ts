import { hashPassword } from "@/utils/password";
import { projectRepository } from "../repositories/project.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { CreateProjectInput, createWithStarterTemplateInput, UpdateProjectInput } from "../validators/project.validator";

async function getOwnedProjectOrThrow(projectId: string, userId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError("Project not found");
  if (project.ownerId !== userId) throw new ForbiddenError("You do not have access to this project");
  return project;
}

export const projectService = {
  list(ownerId: string) {
    return projectRepository.findAllByOwner(ownerId);
  },

  async getById(projectId: string, userId: string) {
    return getOwnedProjectOrThrow(projectId, userId);
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
    await getOwnedProjectOrThrow(projectId, userId);
    return projectRepository.update(projectId, input);
  },

  async delete(projectId: string, userId: string) {
    await getOwnedProjectOrThrow(projectId, userId);
    await projectRepository.delete(projectId);
  },

  assertOwnership: getOwnedProjectOrThrow,
};
