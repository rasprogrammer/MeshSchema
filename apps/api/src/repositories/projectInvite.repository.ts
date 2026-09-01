import { prisma, ProjectInvite, ProjectRole } from "@/config/prisma";

export const projectInviteRepository = {
  create(data: { projectId: string; email: string; role: ProjectRole; token: string; invitedBy: string; expiresAt: Date }): Promise<ProjectInvite> {
    return prisma.projectInvite.create({ data });
  },

  listPendingByProject(projectId: string): Promise<ProjectInvite[]> {
    return prisma.projectInvite.findMany({
      where: { projectId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  },

  findByToken(token: string): Promise<ProjectInvite | null> {
    return prisma.projectInvite.findUnique({ where: { token } });
  },

  findById(id: string): Promise<ProjectInvite | null> {
    return prisma.projectInvite.findUnique({ where: { id } });
  },

  markAccepted(id: string): Promise<ProjectInvite> {
    return prisma.projectInvite.update({ where: { id }, data: { status: "ACCEPTED" } });
  },

  revoke(id: string): Promise<ProjectInvite> {
    return prisma.projectInvite.update({ where: { id }, data: { status: "REVOKED" } });
  },
};
