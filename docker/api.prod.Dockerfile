# Base
FROM oven/bun:1-debian AS base

WORKDIR /repo

COPY package.json bun.lock turbo.json ./

COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/database/package.json ./packages/database/
COPY packages/backend-common/package.json ./packages/backend-common/

COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY packages/ ./packages
COPY apps/api ./apps/api

RUN bun run build --filter=@repo/api

ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "run", "apps/api/src/server.ts"]