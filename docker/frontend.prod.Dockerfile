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

# Build-time public env vars baked into the Next.js bundle
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY --from=deps /repo ./
COPY . .

RUN bun turbo run build --filter=@repo/web

# ── Production image ──────────────────────────────────────────────────
FROM oven/bun:1-debian AS runner

WORKDIR /app

# Next.js standalone output is self-contained
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static      ./.next/static
COPY --from=builder /repo/apps/web/public            ./public

# Non-root user for least-privilege execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextuser && \
    chown -R nextuser:nodejs /app

USER nextuser

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "apps/web/server.js"]
