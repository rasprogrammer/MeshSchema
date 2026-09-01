import { Project, ProjectRole } from "@/config/prisma";
import { projectRepository } from "@/repositories/project.repository";
import { projectMemberRepository } from "@/repositories/projectMember.repository";
import { ForbiddenError, NotFoundError } from "@/utils/AppError";

/** Higher number = more privileged. Used to compare a member's role against a required minimum. */
const ROLE_RANK: Record<ProjectRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export async function getEffectiveRole(projectId: string, userId: string): Promise<ProjectRole | null> {
  const project = await projectRepository.findById(projectId);
  if (!project || project.deletedAt) return null;
  if (project.ownerId === userId) return "OWNER";

  const membership = await projectMemberRepository.findByProjectAndUser(projectId, userId);
  return membership?.role ?? null;
}

/**
 * Resolves the project and the caller's role, enforcing a minimum role.
 * Throws NotFoundError if the project doesn't exist or the caller has no
 * access at all (so non-members can't probe for a project's existence),
 * and ForbiddenError if they have access but below `minRole`.
 */
export async function requireProjectRole(
  projectId: string,
  userId: string,
  minRole: ProjectRole
): Promise<{ project: Project; role: ProjectRole }> {
  const project = await projectRepository.findById(projectId);
  if (!project || project.deletedAt) {
    throw new NotFoundError("Project not found");
  }

  const role: ProjectRole | null =
    project.ownerId === userId
      ? "OWNER"
      : ((await projectMemberRepository.findByProjectAndUser(projectId, userId))?.role ?? null);

  if (!role) {
    throw new NotFoundError("Project not found");
  }

  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return { project, role };
}

export const projectAccessService = { getEffectiveRole, requireProjectRole };
