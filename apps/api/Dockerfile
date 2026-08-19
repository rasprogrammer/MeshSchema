# Build context is the MONOREPO ROOT: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json* turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/ws/package.json apps/ws/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
RUN npm ci

FROM deps AS build
COPY . .
RUN npx turbo run build --filter=@repo/api...

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/database/dist ./packages/database/dist
COPY --from=build /repo/packages/database/package.json ./packages/database/package.json
COPY --from=build /repo/packages/database/prisma ./packages/database/prisma
COPY --from=build /repo/packages/database/prisma.config.ts ./packages/database/prisma.config.ts
COPY --from=build /repo/packages/types/dist ./packages/types/dist
COPY --from=build /repo/packages/types/package.json ./packages/types/package.json
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/apps/api/tsconfig.json ./apps/api/tsconfig.json

WORKDIR /repo/apps/api
ENV TS_NODE_BASEURL=./dist
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.ts && node --require tsconfig-paths/register dist/server.js"]
