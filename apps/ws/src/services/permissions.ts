import { prisma, ProjectRole } from "@repo/database";

/**
 * Live (uncached) role lookup — every call hits the DB so a permission
 * downgrade takes effect on a connected client's very next message, not
 * just at their next reconnect.
 */
export async function getProjectRole(projectId: string, userId: string): Promise<ProjectRole | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.deletedAt) return null;
  if (project.ownerId === userId) return "OWNER";

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return member?.role ?? null;
}

const ROLE_RANK: Record<ProjectRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export function hasAtLeastRole(role: ProjectRole | null, minRole: ProjectRole): boolean {
  return !!role && ROLE_RANK[role] >= ROLE_RANK[minRole];
}
