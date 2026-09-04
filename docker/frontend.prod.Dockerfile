# Base 
FROM oven/bun:1-debian AS base

WORKDIR /repo

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY package.json bun.lock turbo.json ./

COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/web/package.json ./apps/web/

RUN bun install

COPY packages/ ./packages
COPY apps/web ./apps/web

RUN bun run build --filter=@repo/web

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start:frontend"]
