import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { setupWebSocketServer } from "./handlers/wsHandler";

interface HeartbeatSocket extends WebSocket {
  isAlive?: boolean;
}

/**
 * Plain HTTP server so we can respond to a health-check GET (used by
 * docker-compose / load balancers) on the same port the WebSocket upgrades
 * happen on, without needing a second process.
 */
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: ({ origin }, callback) => {
    // Best-effort origin allowlist. Real auth still happens per-connection
    // via the access-token cookie/query param in getToken.ts — this is a
    // defense-in-depth layer, not the primary guard, since `Origin` can be
    // absent for non-browser clients.
    if (!origin || origin === env.corsOrigin) {
      callback(true);
      return;
    }
    logger.warn({ origin }, "Rejected WebSocket upgrade from disallowed origin");
    callback(false, 403, "Forbidden origin");
  },
});

setupWebSocketServer(wss);

// Dead-connection reaping: a client that vanishes without a clean TCP close
// (phone sleep, network drop) never fires `close`, so without a heartbeat
// its room slot and presence entry would leak forever.
wss.on("connection", (socket: HeartbeatSocket) => {
  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });
});

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

httpServer.listen(env.port, () => {
  logger.info(`WebSocket server listening on ws://localhost:${env.port}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, closing WebSocket server`);
  clearInterval(heartbeat);
  wss.clients.forEach((socket) => socket.close(1001, "Server shutting down"));
  wss.close(() => {
    httpServer.close(() => process.exit(0));
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
