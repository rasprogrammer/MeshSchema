# ── Base ─────────────────────────────────────────────────────────────
FROM oven/bun:1-debian AS base

WORKDIR /repo

# ── Dependencies ──────────────────────────────────────────────────────
FROM base AS deps

# Copy manifests only — avoids busting this layer when source changes
COPY package.json bun.lock turbo.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/ws/package.json  apps/ws/package.json

COPY packages/backend-common/package.json packages/backend-common/package.json
COPY packages/database/package.json       packages/database/package.json
COPY packages/types/package.json          packages/types/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN bun install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /repo ./
COPY . .

# Build only the ws app (and its workspace dependencies)
RUN bun turbo run build --filter=@repo/ws

# ── Production image ──────────────────────────────────────────────────
FROM oven/bun:1-debian AS runner

WORKDIR /app

# Copy only what the ws server needs at runtime
COPY --from=builder /repo/apps/ws          ./apps/ws
COPY --from=builder /repo/packages         ./packages
COPY --from=builder /repo/node_modules     ./node_modules
COPY --from=builder /repo/package.json     ./package.json

# Non-root user for least-privilege execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 wsuser && \
    chown -R wsuser:nodejs /app

USER wsuser

ENV PORT=4001
ENV NODE_ENV=production
EXPOSE 4001

# Health-check against the /health HTTP endpoint the WS server exposes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:4001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "apps/ws/src/server.ts"]

