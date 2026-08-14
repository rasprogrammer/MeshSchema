#!/bin/sh
set -e

# Wait for database to be ready with retries
echo "Waiting for database to be ready..."
until DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy --schema=/repo/packages/database/prisma/schema.prisma; do
  echo "Database not ready, retrying in 5 seconds..."
  sleep 5
done

echo "Database migrations applied successfully"
exec node dist/server.js
