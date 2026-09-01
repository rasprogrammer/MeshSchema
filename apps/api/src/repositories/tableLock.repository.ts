import { prisma, TableLock } from "@/config/prisma";

export const tableLockRepository = {
  listActiveByProject(projectId: string): Promise<TableLock[]> {
    return prisma.tableLock.findMany({
      where: { projectId, expiresAt: { gt: new Date() } },
    });
  },

  findActive(projectId: string, tableName: string): Promise<TableLock | null> {
    return prisma.tableLock.findFirst({
      where: { projectId, tableName, expiresAt: { gt: new Date() } },
    });
  },

  upsert(projectId: string, tableName: string, userId: string, expiresAt: Date): Promise<TableLock> {
    return prisma.tableLock.upsert({
      where: { projectId_tableName: { projectId, tableName } },
      update: { userId, acquiredAt: new Date(), expiresAt },
      create: { projectId, tableName, userId, expiresAt },
    });
  },

  release(projectId: string, tableName: string): Promise<TableLock | null> {
    return prisma.tableLock
      .delete({ where: { projectId_tableName: { projectId, tableName } } })
      .catch(() => null);
  },

  releaseAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.tableLock.deleteMany({ where: { userId } });
  },

  /** Sweeps rows past their TTL — locks are also treated as expired at read time, this just keeps the table small. */
  deleteExpired(): Promise<{ count: number }> {
    return prisma.tableLock.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  },
};
