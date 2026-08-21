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

RUN bun turbo run build --filter=@repo/web 


# Production 
FROM oven/bun:1-debian AS runner

WORKDIR /app

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./.next/static
COPY --from=builder /repo/apps/web/public ./public


ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["bun", "run", "apps/web/server.js"]
