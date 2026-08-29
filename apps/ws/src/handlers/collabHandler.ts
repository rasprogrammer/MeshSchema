import type { WebSocket } from "ws";
import type { ClientMessage } from "@repo/types";
import { broadcastToRoom, getConnectionState } from "../utils/roomManager";

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

export function handleSchemaEdit(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "schema:edit" }>
): void {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;
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
