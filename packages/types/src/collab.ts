/**
 * Shared collaboration domain types — used by both the WebSocket server
 * (apps/ws) and the frontend (apps/web) so the two sides can never drift
 * apart on the shape of a presence/cursor payload.
 */

export interface CollabUser {
  id: string;
  email: string;
  name?: string;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
}
