import type { WebSocket } from "ws";
import type { ClientMessage } from "@repo/types";
import { broadcastToRoom, getConnectionState, sendTo } from "../utils/roomManager";
import { getProjectRole, hasAtLeastRole } from "../services/permissions";
import { acquireLock, releaseLock } from "../services/locks";

export async function handleTableLock(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "table:lock" }>
): Promise<void> {
  const state = getConnectionState(socket);
  if (!state?.roomId || !state.projectId) return;

  const role = await getProjectRole(state.projectId, state.user.id);
  if (!hasAtLeastRole(role, "EDITOR")) {
    sendTo(socket, { type: "table:lock_denied", tableName: message.tableName, reason: "You do not have edit access to this project" });
    return;
  }

  const result = await acquireLock(state.projectId, message.tableName, state.user.id);
  if (!result.ok) {
    sendTo(socket, { type: "table:lock_denied", tableName: message.tableName, reason: "This table is already checked out by another user" });
    return;
  }

  broadcastToRoom(state.roomId, { type: "table:locked", tableName: message.tableName, userId: state.user.id });
}

export async function handleTableUnlock(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "table:unlock" }>
): Promise<void> {
  const state = getConnectionState(socket);
  if (!state?.roomId || !state.projectId) return;

  const released = await releaseLock(state.projectId, message.tableName, state.user.id);
  if (released) {
    broadcastToRoom(state.roomId, { type: "table:unlocked", tableName: message.tableName });
  }
}
