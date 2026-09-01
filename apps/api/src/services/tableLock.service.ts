import { tableLockRepository } from "@/repositories/tableLock.repository";
import { requireProjectRole } from "./projectAccess.service";
import { ConflictError, ForbiddenError, NotFoundError } from "@/utils/AppError";

export const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes, refreshed by client heartbeat while editing

export const tableLockService = {
  async list(projectId: string, userId: string) {
    await requireProjectRole(projectId, userId, "VIEWER");
    return tableLockRepository.listActiveByProject(projectId);
  },

  /** Acquires (or refreshes, if already held by the same user) a checkout lock on a table. */
  async acquire(projectId: string, tableName: string, userId: string) {
    await requireProjectRole(projectId, userId, "EDITOR");

    const existing = await tableLockRepository.findActive(projectId, tableName);
    if (existing && existing.userId !== userId) {
      throw new ConflictError(`"${tableName}" is currently being edited by another user`);
    }

    return tableLockRepository.upsert(projectId, tableName, userId, new Date(Date.now() + LOCK_TTL_MS));
  },

  async release(projectId: string, tableName: string, userId: string) {
    const { role } = await requireProjectRole(projectId, userId, "VIEWER");
    const existing = await tableLockRepository.findActive(projectId, tableName);
    if (!existing) throw new NotFoundError("No active lock on this table");
    if (existing.userId !== userId && role !== "OWNER") {
      throw new ForbiddenError("Only the lock holder or the project owner can release this lock");
    }
    await tableLockRepository.release(projectId, tableName);
  },
};
