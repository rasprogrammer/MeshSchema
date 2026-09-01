import type { WebSocket } from "ws";
import type { ClientMessage, ProjectJoinedMessage, ProjectJoinErrorMessage, ProjectLeftMessage } from "@repo/types";
import {
  broadcastToRoom,
  colorForUser,
  getConnectionState,
  joinRoom,
  leaveRoom,
  peersInRoom,
  sendTo,
} from "../utils/roomManager";
import { getProjectRole } from "../services/permissions";
import { releaseAllLocksForUser } from "../services/locks";

export async function handleProjectJoin(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "project:join" }>
): Promise<void> {
  const state = getConnectionState(socket);
  if (!state) return;

  // If the client tells us which real project this session belongs to, verify
  // access up front so an unauthorized user can't even join the room.
  if (message.projectId) {
    const role = await getProjectRole(message.projectId, state.user.id);
    if (!role) {
      sendTo(socket, { type: "project:join_error", error: "You do not have access to this project" } satisfies ProjectJoinErrorMessage);
      return;
    }
    state.projectId = message.projectId;
  }

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

/** Called on socket close — cleans up whichever room the connection was in, and releases any table locks it held. */
export async function handleDisconnect(socket: WebSocket): Promise<void> {
  const state = getConnectionState(socket);
  if (!state) return;

  if (state.roomId) {
    broadcastToRoom(
      state.roomId,
      { type: "presence:leave", userId: state.user.id },
      socket
    );

    const released = await releaseAllLocksForUser(state.user.id);
    for (const lock of released) {
      broadcastToRoom(state.roomId, { type: "table:unlocked", tableName: lock.tableName });
    }
  }
}