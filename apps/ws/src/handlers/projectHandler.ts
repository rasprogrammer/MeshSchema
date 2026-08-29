import type { WebSocket } from "ws";
import type { ClientMessage, ProjectJoinedMessage, ProjectLeftMessage } from "@repo/types";
import {
  broadcastToRoom,
  colorForUser,
  getConnectionState,
  joinRoom,
  leaveRoom,
  peersInRoom,
} from "../utils/roomManager";

export function handleProjectJoin(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "project:join" }>
): void {
  const state = getConnectionState(socket);
  if (!state) return;

  const collabUser = { ...state.user, color: colorForUser(state.user.id) };
  state.user = collabUser;

  const peers = peersInRoom(message.roomId, socket);
  joinRoom(socket, message.roomId);

  socket.send(
    JSON.stringify({
      type: "project:joined",
      self: collabUser,
      peers,
    } satisfies ProjectJoinedMessage)
  );

  broadcastToRoom(
    message.roomId,
    { type: "presence:join", user: collabUser },
    socket
  );
}

export function handleProjectLeave(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "project:leave" }>
): void {
  const state = getConnectionState(socket);
  if (!state) return;

  leaveRoom(socket, message.roomId);
  broadcastToRoom(
    message.roomId,
    { type: "presence:leave", userId: state.user.id },
    socket
  );
}

/** Called on socket close — cleans up whichever room the connection was in. */
export function handleDisconnect(socket: WebSocket): void {
  const state = getConnectionState(socket);
  if (!state?.roomId) return;
  broadcastToRoom(
    state.roomId,
    { type: "presence:leave", userId: state.user.id },
    socket
  );
}