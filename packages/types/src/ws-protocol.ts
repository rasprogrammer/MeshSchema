import type { CollabUser, CursorPosition } from "./collab";

/**
 * The WebSocket wire protocol between apps/web and apps/ws.
 *
 * Replaces the old Socket.io event-name/ack model with a single `type`
 * discriminated union sent as JSON over a plain `ws` connection. Auth is a
 * short-lived access token passed as a query param on the connection URL
 * (`ws://host?token=...`), verified once at connection time — there is no
 * per-message re-auth, matching how the previous Socket.io middleware only
 * ran once per handshake.
 */

// ---- Client -> Server -------------------------------------------------

export interface ProjectJoinMessage {
  type: "project:join";
  projectId: string;
}

export interface ProjectLeaveMessage {
  type: "project:leave";
  projectId: string;
}

export interface CursorMoveMessage {
  type: "cursor:move";
  position: CursorPosition;
}

export interface SchemaEditMessage {
  type: "schema:edit";
  dbml: string;
}

export type ClientMessage =
  | ProjectJoinMessage
  | ProjectLeaveMessage
  | CursorMoveMessage
  | SchemaEditMessage;

// ---- Server -> Client ---------------------------------------------------

export interface ProjectJoinedMessage {
  type: "project:joined";
  self: CollabUser;
  peers: CollabUser[];
}

export interface ProjectJoinErrorMessage {
  type: "project:join_error";
  error: string;
}

export interface PresenceJoinMessage {
  type: "presence:join";
  user: CollabUser;
}

export interface PresenceLeaveMessage {
  type: "presence:leave";
  userId: string;
}

export interface CursorBroadcastMessage {
  type: "cursor:move";
  user: CollabUser;
  position: CursorPosition;
}

export interface SchemaEditBroadcastMessage {
  type: "schema:edit";
  dbml: string;
  userId: string;
}

export type ServerMessage =
  | ProjectJoinedMessage
  | ProjectJoinErrorMessage
  | PresenceJoinMessage
  | PresenceLeaveMessage
  | CursorBroadcastMessage
  | SchemaEditBroadcastMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  return (
    type === "project:join" ||
    type === "project:leave" ||
    type === "cursor:move" ||
    type === "schema:edit"
  );
}
