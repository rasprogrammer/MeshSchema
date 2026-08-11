import type { ClientMessage, ServerMessage } from "@repo/types";

type Listener = (message: ServerMessage) => void;

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001").replace(/\/$/, "");

const RECONNECT_BASE_DELAY_MS = 500;
const RECONNECT_MAX_DELAY_MS = 8_000;

/**
 * A single shared, auto-reconnecting native WebSocket connection for the
 * whole app — replaces the previous socket.io-client instance.
 *
 * Auth is via the httpOnly `access_token` cookie: the WebSocket handshake
 * is a plain HTTP GET, so same-site browsers attach the cookie
 * automatically, exactly like axios's `withCredentials: true` did for the
 * old socket.io connection. No token handling in the client at all.
 */
class CollabSocket {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private connectionListeners = new Set<(connected: boolean) => void>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.shouldReconnect = true;
    this.open();
  }

  private open(): void {
    const socket = new WebSocket(WS_URL);
    this.socket = socket;

    socket.addEventListener("open", () => {
      this.reconnectAttempt = 0;
      this.connectionListeners.forEach((cb) => cb(true));
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        this.listeners.forEach((cb) => cb(message));
      } catch {
        // Ignore malformed frames rather than crashing the session.
      }
    });

    socket.addEventListener("close", () => {
      this.connectionListeners.forEach((cb) => cb(false));
      if (this.shouldReconnect) this.scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      socket.close();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_DELAY_MS
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) this.open();
    }, delay);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
  }

  get connected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  send(message: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  onConnectionChange(cb: (connected: boolean) => void): () => void {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }
}

let instance: CollabSocket | null = null;

/** Lazily creates the single shared collab WebSocket connection for the app. */
export function getCollabSocket(): CollabSocket {
  if (!instance) instance = new CollabSocket();
  return instance;
}
