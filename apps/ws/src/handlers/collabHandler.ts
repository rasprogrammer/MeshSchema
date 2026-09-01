import type { WebSocket } from "ws";
import type { ClientMessage } from "@repo/types";
import { broadcastToRoom, getConnectionState, sendTo } from "../utils/roomManager";
import { getProjectRole, hasAtLeastRole } from "../services/permissions";
import { findActiveLock } from "../services/locks";

export function handleCursorMove(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "cursor:move" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;
  broadcastToRoom(
    state.roomId,
    { type: "cursor:move", user: state.user, position: message.position },
    socket
  );
}

/**
 * Re-checks the sender's role against the DB on every edit (no caching) so a
 * permission downgrade rejects the very next edit from an already-connected
 * client, not just future connections. If the edit is scoped to a table
 * that's checked out by someone else, it's rejected too.
 */
export async function handleSchemaEdit(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "schema:edit" }>
): Promise<void> {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;

  if (state.projectId) {
    const role = await getProjectRole(state.projectId, state.user.id);
    if (!hasAtLeastRole(role, "EDITOR")) {
      sendTo(socket, { type: "schema:edit_rejected", reason: "You no longer have edit access to this project" });
      return;
    }

    if (message.tableName) {
      const lock = await findActiveLock(state.projectId, message.tableName);
      if (lock && lock.userId !== state.user.id) {
        sendTo(socket, { type: "schema:edit_rejected", reason: `"${message.tableName}" is locked by another user` });
        return;
      }
    }
  }

  broadcastToRoom(
    state.roomId,
    { type: "schema:edit", dbml: message.dbml, userId: state.user.id },
    socket
  );
}

export function handleDiagramMove(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "diagram:move" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;
  broadcastToRoom(
    state.roomId,
    { type: "diagram:move", changes: message.changes, userId: state.user.id },
    socket
  );
}

export function handleSessionClosed(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "session:closed" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;
  broadcastToRoom(
    state.roomId,
    { type: "session:closed" },
    socket
  );
}
