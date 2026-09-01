import { prisma } from "@repo/database";

const LOCK_TTL_MS = 2 * 60 * 1000;

export async function acquireLock(projectId: string, tableName: string, userId: string) {
  const existing = await prisma.tableLock.findFirst({
    where: { projectId, tableName, expiresAt: { gt: new Date() } },
  });
  if (existing && existing.userId !== userId) {
    return { ok: false as const, heldBy: existing.userId };
  }

  await prisma.tableLock.upsert({
    where: { projectId_tableName: { projectId, tableName } },
    update: { userId, acquiredAt: new Date(), expiresAt: new Date(Date.now() + LOCK_TTL_MS) },
    create: { projectId, tableName, userId, expiresAt: new Date(Date.now() + LOCK_TTL_MS) },
  });
  return { ok: true as const };
}

export async function releaseLock(projectId: string, tableName: string, userId: string) {
  const existing = await prisma.tableLock.findFirst({ where: { projectId, tableName } });
  if (!existing || existing.userId !== userId) return false;
  await prisma.tableLock.delete({ where: { projectId_tableName: { projectId, tableName } } });
  return true;
}

/** Called on disconnect — releases every lock the user held anywhere, returning what was freed for broadcasting. */
export async function releaseAllLocksForUser(userId: string) {
  const locks = await prisma.tableLock.findMany({ where: { userId } });
  if (locks.length === 0) return [];
  await prisma.tableLock.deleteMany({ where: { userId } });
  return locks.map((l) => ({ projectId: l.projectId, tableName: l.tableName }));
}

export async function findActiveLock(projectId: string, tableName: string) {
  return prisma.tableLock.findFirst({
    where: { projectId, tableName, expiresAt: { gt: new Date() } },
  });
}
