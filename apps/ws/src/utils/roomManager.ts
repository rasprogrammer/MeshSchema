import { WebSocket } from "ws";
import type { CollabUser, ServerMessage } from "@repo/types";

interface ConnectionState {
  user: CollabUser;
  roomId: string | null;
}

/** roomId → set of sockets in that room */
const rooms = new Map<string, Set<WebSocket>>();

/** Per-connection state, keyed by the live socket instance */
const connectionState = new Map<WebSocket, ConnectionState>();

const CURSOR_COLORS = [
  "#f97316",
  "#22d3ee",
  "#a3e635",
  "#f472b6",
  "#818cf8",
  "#facc15",
  "#34d399",
  "#fb7185",
];

/** Deterministic color from a userId so a given user always gets the same one. */
export function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]!;
}

export function registerConnection(socket: WebSocket, user: CollabUser): void {
  connectionState.set(socket, { user, roomId: null });
}

export function getConnectionState(socket: WebSocket): ConnectionState | undefined {
  return connectionState.get(socket);
}

export function joinRoom(socket: WebSocket, roomId: string): void {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add(socket);
  const state = connectionState.get(socket);
  if (state) state.roomId = roomId;
}

export function leaveRoom(socket: WebSocket, roomId: string): void {
  rooms.get(roomId)?.delete(socket);
  if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);
  const state = connectionState.get(socket);
  if (state && state.roomId === roomId) state.roomId = null;
}

export function removeConnection(socket: WebSocket): void {
  const state = connectionState.get(socket);
  if (state?.roomId) leaveRoom(socket, state.roomId);
  connectionState.delete(socket);
}

/** Returns CollabUser[] for every *other* socket currently in the room. */
export function peersInRoom(roomId: string, excludeSocket?: WebSocket): CollabUser[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  const peers: CollabUser[] = [];
  for (const client of room) {
    if (client === excludeSocket) continue;
    const state = connectionState.get(client);
    if (state) peers.push(state.user);
  }
  return peers;
}

export function broadcastToRoom(
  roomId: string,
  message: ServerMessage,
  excludeSocket?: WebSocket
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const client of room) {
    if (client === excludeSocket) continue;
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}