import type { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { isClientMessage } from "@repo/types";
import { authenticateConnection } from "../services/auth";
import { getToken } from "../services/getToken";
import { logger } from "../utils/logger";
import { registerConnection, removeConnection } from "../utils/roomManager";
import { handleProjectJoin, handleProjectLeave, handleDisconnect } from "./roomHandler";
import { handleCursorMove, handleSchemaEdit } from "./collabHandler";

export function setupWebSocketServer(wss: WebSocketServer): void {
  wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    const token = getToken(request);
    const user = authenticateConnection(token);

    if (!user) {
      logger.warn("Unauthorized WebSocket connection attempt — closing");
      socket.close(4001, "Unauthorized");
      return;
    }

    registerConnection(socket, { id: user.id, email: user.email, color: "#94a3b8" });
    logger.info({ userId: user.id }, "WebSocket connection authenticated");

    socket.on("message", (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        logger.warn("Received non-JSON message; ignoring");
        return;
      }

      if (!isClientMessage(parsed)) {
        logger.warn({ parsed }, "Received message with unknown/invalid type; ignoring");
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
          handleSchemaEdit(socket, parsed);
          break;
      }
    });

    socket.on("close", () => {
      logger.info({ userId: user.id }, "WebSocket disconnected");
      handleDisconnect(socket);
      removeConnection(socket);
    });

    socket.on("error", (error) => {
      logger.error({ error, userId: user.id }, "WebSocket error");
    });
  });
}
