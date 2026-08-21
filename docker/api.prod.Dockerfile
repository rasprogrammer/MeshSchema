# Base
FROM oven/bun:1-debian AS base

WORKDIR /repo

# Dependencies
FROM base AS deps

COPY package.json bun.lock turbo.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/ws/package.json apps/ws/package.json

COPY packages/database/package.json packages/database/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN bun install --frozen-lockfile


# Builder
FROM base AS builder

COPY --from=deps /repo ./
COPY . .

RUN bun turbo run build --filter=@repo/api


# Production
FROM oven/bun:1-debian AS runner

WORKDIR /app

COPY --from=builder /repo/apps/api ./apps/api
COPY --from=builder /repo/packages ./packages
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/package.json ./package.json

ENV PORT=4000
EXPOSE 4000

CMD ["bun", "run", "apps/api/src/server.ts"]