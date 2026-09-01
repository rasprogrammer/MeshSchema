import { prisma, ProjectMember, ProjectRole } from "@/config/prisma";

export const projectMemberRepository = {
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  listByProject(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { joinedAt: "asc" },
    });
  },

  upsert(projectId: string, userId: string, role: ProjectRole): Promise<ProjectMember> {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });
  },

  remove(projectId: string, userId: string): Promise<ProjectMember> {
    return prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },
};
