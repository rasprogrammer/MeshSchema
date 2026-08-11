/**
 * Re-exports the shared Prisma client from @repo/database. Kept as a local
 * module (instead of updating every repository's import path) so this was
 * a small, mechanical change during the monorepo migration — the client,
 * schema, and generated types now live in exactly one place for both
 * apps/api and apps/ws to share.
 */
export { prisma } from "@repo/database";
export type * from "@repo/database";
