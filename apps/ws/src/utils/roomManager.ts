import { WebSocket } from "ws";
import type { CollabUser, ServerMessage } from "@repo/types";

interface ConnectionState {
  user: CollabUser;
  projectId: string | null;
}

/** projectId -> room */
const rooms = new Map<string, Set<WebSocket>>();
/** Per-connection state, keyed by the live socket instance. */
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

export function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]!;
}

export function registerConnection(socket: WebSocket, user: CollabUser): void {
  connectionState.set(socket, { user, projectId: null });
}

export function getConnectionState(socket: WebSocket): ConnectionState | undefined {
  return connectionState.get(socket);
}

export function joinRoom(socket: WebSocket, projectId: string): void {
  if (!rooms.has(projectId)) rooms.set(projectId, new Set());
  rooms.get(projectId)!.add(socket);
  const state = connectionState.get(socket);
  if (state) state.projectId = projectId;
}

export function leaveRoom(socket: WebSocket, projectId: string): void {
  rooms.get(projectId)?.delete(socket);
  if (rooms.get(projectId)?.size === 0) rooms.delete(projectId);
  const state = connectionState.get(socket);
  if (state && state.projectId === projectId) state.projectId = null;
}

export function removeConnection(socket: WebSocket): void {
  const state = connectionState.get(socket);
  if (state?.projectId) leaveRoom(socket, state.projectId);
  connectionState.delete(socket);
}

export function peersInRoom(projectId: string, excludeSocket?: WebSocket): CollabUser[] {
  const room = rooms.get(projectId);
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
  projectId: string,
  message: ServerMessage,
  excludeSocket?: WebSocket
): void {
  const room = rooms.get(projectId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const client of room) {
    if (client === excludeSocket) continue;
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
