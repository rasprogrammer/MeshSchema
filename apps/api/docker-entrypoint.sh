#!/bin/sh
set -e

# Wait for database to be ready with retries
echo "Waiting for database to be ready..."
until DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.ts; do
  echo "Database not ready, retrying in 5 seconds..."
  sleep 5
done

echo "Database migrations applied successfully"
# Register tsconfig-paths with explicit config
node -e "
const tsconfigPaths = require('tsconfig-paths');
const path = require('path');
tsconfigPaths.register({
  baseUrl: path.resolve(__dirname, 'dist'),
  paths: {
    '@/*': ['*']
  }
});
require('./dist/server.js');
"
