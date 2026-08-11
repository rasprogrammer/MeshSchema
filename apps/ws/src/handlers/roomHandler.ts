import type { WebSocket } from "ws";
import { prisma } from "@repo/database";
import type {
  ClientMessage,
  ProjectJoinedMessage,
  ProjectJoinErrorMessage,
} from "@repo/types";
import { logger } from "../utils/logger";
import {
  broadcastToRoom,
  colorForUser,
  getConnectionState,
  joinRoom,
  leaveRoom,
  peersInRoom,
} from "../utils/roomManager";

function send(socket: WebSocket, message: ProjectJoinedMessage | ProjectJoinErrorMessage) {
  socket.send(JSON.stringify(message));
}

export async function handleProjectJoin(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "project:join" }>
): Promise<void> {
  const state = getConnectionState(socket);
  if (!state) return;

  const project = await prisma.project.findUnique({ where: { id: message.projectId } });
  if (!project || project.ownerId !== state.user.id) {
    send(socket, { type: "project:join_error", error: "Not authorized for this project" });
    logger.warn(
      { userId: state.user.id, projectId: message.projectId },
      "Rejected unauthorized project:join"
    );
    return;
  }

  const collabUser = { ...state.user, color: colorForUser(state.user.id) };
  state.user = collabUser;

  const peers = peersInRoom(message.projectId, socket);
  joinRoom(socket, message.projectId);

  send(socket, { type: "project:joined", self: collabUser, peers });
  broadcastToRoom(message.projectId, { type: "presence:join", user: collabUser }, socket);
  logger.info({ userId: state.user.id, projectId: message.projectId }, "User joined project room");
}

export function handleProjectLeave(
  socket: WebSocket,
  message: Extract<ClientMessage, { type: "project:leave" }>
): void {
  const state = getConnectionState(socket);
  if (!state) return;

  leaveRoom(socket, message.projectId);
  broadcastToRoom(message.projectId, { type: "presence:leave", userId: state.user.id }, socket);
  logger.info({ userId: state.user.id, projectId: message.projectId }, "User left project room");
}

/** Called on socket close — cleans up whichever room the connection was in. */
export function handleDisconnect(socket: WebSocket): void {
  const state = getConnectionState(socket);
  if (!state?.projectId) return;
  broadcastToRoom(state.projectId, { type: "presence:leave", userId: state.user.id }, socket);
}
