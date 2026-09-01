import { projectMemberRepository } from "@/repositories/projectMember.repository";
import { requireProjectRole } from "./projectAccess.service";
import { ForbiddenError, NotFoundError } from "@/utils/AppError";
import { ProjectRole } from "@/config/prisma";

export const projectMemberService = {
  async list(projectId: string, userId: string) {
    await requireProjectRole(projectId, userId, "VIEWER");
    return projectMemberRepository.listByProject(projectId);
  },

  async updateRole(projectId: string, targetUserId: string, role: ProjectRole, userId: string) {
    await requireProjectRole(projectId, userId, "OWNER");
    const member = await projectMemberRepository.findByProjectAndUser(projectId, targetUserId);
    if (!member) throw new NotFoundError("Member not found");
    return projectMemberRepository.upsert(projectId, targetUserId, role);
  },

  async remove(projectId: string, targetUserId: string, userId: string) {
    const { project } = await requireProjectRole(projectId, userId, "OWNER");
    if (project.ownerId === targetUserId) throw new ForbiddenError("The project owner cannot be removed");
    const member = await projectMemberRepository.findByProjectAndUser(projectId, targetUserId);
    if (!member) throw new NotFoundError("Member not found");
    await projectMemberRepository.remove(projectId, targetUserId);
  },
};
