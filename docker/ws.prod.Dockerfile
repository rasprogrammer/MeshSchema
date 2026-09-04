# Use official Bun image
FROM oven/bun:1-debian

WORKDIR /app

# Copy all workspace configuration and source files
COPY package.json bun.lock turbo.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

# Install all dependencies across the monorepo
RUN bun install

# Build the specific workspace app (change @repo/ws to your app's name)
RUN bun turbo run build --filter=@repo/ws

# Expose port and run the app
ENV NODE_ENV=production
EXPOSE 4001

CMD ["bun", "run", "apps/ws/src/server.ts"]