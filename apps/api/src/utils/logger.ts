import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "../config/env";

export const logger = pino({
  level: env.isProd ? "info" : "debug",
  transport: env.isProd ? undefined : { target: "pino-pretty", options: { colorize: true } },
});

/** Express request-logging middleware, replaces morgan. */
export const httpLogger = pinoHttp({ logger });
