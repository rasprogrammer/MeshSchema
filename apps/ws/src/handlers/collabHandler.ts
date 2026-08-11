import type { WebSocket } from "ws";
import type { ClientMessage } from "@repo/types";
import { broadcastToRoom, getConnectionState } from "../utils/roomManager";

export function handleCursorMove(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "cursor:move" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.projectId) return;
  broadcastToRoom(
    state.projectId,
    { type: "cursor:move", user: state.user, position: message.position },
    socket
  );
}

/**
 * Broadcasts a live DBML edit to peers so the diagram/editor can update
 * without waiting for the debounced autosave round-trip. Last-write-wins —
 * an acceptable tradeoff for the small, mostly-sequential edits typical of
 * schema design today. A CRDT/OT layer (Yjs) is tracked as a Tier 2 item in
 * docs/requirements-master.md §7 and would replace this handler's broadcast
 * with a document-merge step instead of a raw text pass-through.
 */
export function handleSchemaEdit(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "schema:edit" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.projectId) return;
  broadcastToRoom(
    state.projectId,
    { type: "schema:edit", dbml: message.dbml, userId: state.user.id },
    socket
  );
}
