import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { isClientMessage } from "@repo/types";
import { authenticateConnection } from "./services/auth";
import { getToken } from "./services/getToken";
import { handleProjectJoin, handleProjectLeave, handleDisconnect } from "./handlers/projectHandler";
import { handleCursorMove, handleSchemaEdit, handleDiagramMove, handleSessionClosed } from "./handlers/collabHandler";
import { handleTableLock, handleTableUnlock } from "./handlers/tableLockHandler";
import { registerConnection, removeConnection } from "./utils/roomManager";
import { colorForUser } from "./utils/roomManager";
import { env } from "./config/env";

// ── HTTP server (health-check on the same port as WS upgrades) ──────

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// ── WebSocket server ────────────────────────────────────────────────

interface HeartbeatSocket extends WebSocket {
  isAlive?: boolean;
}

const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: ({ origin }, callback) => {
    // Best-effort origin allowlist — real auth is per-connection via the
    // access-token cookie. This is defense-in-depth, not the primary guard.
    if (!origin || origin === env.corsOrigin) {
      callback(true);
      return;
    }
    console.warn(`Rejected WebSocket upgrade from disallowed origin: ${origin}`);
    callback(false, 403, "Forbidden origin");
  },
});

// ── Connection handler ──────────────────────────────────────────────

wss.on("connection", (socket: HeartbeatSocket, request) => {
  // Authenticate via cookie / query param
  const token = getToken(request);
  const user = authenticateConnection(token);

  if (!user) {
    console.warn("Unauthorized WebSocket connection attempt — closing");
    socket.close(4001, "Unauthorized");
    return;
  }

  // Register this connection with the room manager
  registerConnection(socket, {
    id: user.id,
    email: user.email,
    color: colorForUser(user.id),
  });

  console.log(`User connected: ${user.id}`);

  // Heartbeat
  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  // ── Message router ──────────────────────────────────────────────
  socket.on("message", (raw) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      console.warn("Received non-JSON message; ignoring");
      return;
    }

    if (!isClientMessage(parsed)) {
      console.warn("Received message with unknown/invalid type; ignoring");
      return;
    }

    switch (parsed.type) {
      case "project:join":
        void handleProjectJoin(socket, parsed);
        break;
      case "project:leave":
        handleProjectLeave(socket, parsed);
        break;
      case "cursor:move":
        handleCursorMove(socket, parsed);
        break;
      case "schema:edit":
        void handleSchemaEdit(socket, parsed);
        break;
      case "diagram:move":
        handleDiagramMove(socket, parsed);
        break;
      case "session:closed":
        handleSessionClosed(socket, parsed);
        break;
      case "table:lock":
        void handleTableLock(socket, parsed);
        break;
      case "table:unlock":
        void handleTableUnlock(socket, parsed);
        break;
    }
  });

  socket.on("close", () => {
    console.log(`User disconnected: ${user.id}`);
    void handleDisconnect(socket);
    removeConnection(socket);
  });

  socket.on("error", (error) => {
    console.error(`WebSocket error for user ${user.id}:`, error);
  });
});

// ── Heartbeat: reap dead connections every 30 s ─────────────────────

const heartbeat = setInterval(() => {
  wss.clients.forEach((socket) => {
    const client = socket as HeartbeatSocket;
    if (client.isAlive === false) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.ping();
  });
}, 30_000);

wss.on("close", () => clearInterval(heartbeat));

// ── Start ───────────────────────────────────────────────────────────

httpServer.listen(env.port, () => {
  console.log(`WebSocket server listening on ws://localhost:${env.port}`);
});

// ── Graceful shutdown ───────────────────────────────────────────────

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  clearInterval(heartbeat);
  wss.clients.forEach((socket) => socket.close(1001, "Server shutting down"));
  wss.close(() => {
    httpServer.close(() => process.exit(0));
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));