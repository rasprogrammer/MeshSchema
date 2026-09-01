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
  roomId: string;
  /** Real project id, so the server can enforce project roles and table locks for this connection. */
  projectId?: string;
}

export interface ProjectLeaveMessage {
  type: "project:leave";
  roomId: string;
}

export interface CursorMoveMessage {
  type: "cursor:move";
  position: CursorPosition;
}

export interface SchemaEditMessage {
  type: "schema:edit";
  dbml: string;
  /** If the edit is scoped to a single table, the server checks it isn't locked by someone else. */
  tableName?: string;
}

export interface TableLockAcquireMessage {
  type: "table:lock";
  tableName: string;
}

export interface TableLockReleaseMessage {
  type: "table:unlock";
  tableName: string;
}

export interface DiagramMoveMessage {
  type: "diagram:move";
  changes: any[];
}

export interface SessionClosedMessage {
  type: "session:closed";
}

export type ClientMessage =
  | ProjectJoinMessage
  | ProjectLeaveMessage
  | CursorMoveMessage
  | SchemaEditMessage
  | DiagramMoveMessage
  | SessionClosedMessage
  | TableLockAcquireMessage
  | TableLockReleaseMessage;

// ---- Server -> Client ---------------------------------------------------

export interface ProjectJoinedMessage {
  type: "project:joined";
  self: CollabUser;
  peers: CollabUser[];
}

export interface ProjectLeftMessage {
  type: "project:left";
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

export interface DiagramMoveBroadcastMessage {
  type: "diagram:move";
  changes: any[];
  userId: string;
}

export interface SessionClosedBroadcastMessage {
  type: "session:closed";
}

/** Sent privately (not broadcast) to the sender when their edit is rejected server-side. */
export interface SchemaEditRejectedMessage {
  type: "schema:edit_rejected";
  reason: string;
}

export interface TableLockedMessage {
  type: "table:locked";
  tableName: string;
  userId: string;
}

export interface TableUnlockedMessage {
  type: "table:unlocked";
  tableName: string;
}

/** Sent privately (not broadcast) to the requester when a lock can't be acquired. */
export interface TableLockDeniedMessage {
  type: "table:lock_denied";
  tableName: string;
  reason: string;
}

export type ServerMessage =
  | ProjectJoinedMessage
  | ProjectLeftMessage
  | ProjectJoinErrorMessage
  | PresenceJoinMessage
  | PresenceLeaveMessage
  | CursorBroadcastMessage
  | SchemaEditBroadcastMessage
  | DiagramMoveBroadcastMessage
  | SessionClosedBroadcastMessage
  | SchemaEditRejectedMessage
  | TableLockedMessage
  | TableUnlockedMessage
  | TableLockDeniedMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  return (
    type === "project:join" ||
    type === "project:leave" ||
    type === "cursor:move" ||
    type === "schema:edit" ||
    type === "diagram:move" ||
    type === "session:closed" ||
    type === "table:lock" ||
    type === "table:unlock"
  );
}
