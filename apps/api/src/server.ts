import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();
const httpServer = createServer(app);

httpServer.listen(env.port, () => {
  logger.info(`Schema Designer API listening on http://localhost:${env.port}`);
});
