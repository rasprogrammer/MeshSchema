import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Single shared Prisma client for every app in the monorepo (apps/api,
 * apps/ws). Each process gets its own instance (module scope), but the
 * connection URL, adapter config, and generated types live in exactly one
 * place instead of being duplicated per app.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
