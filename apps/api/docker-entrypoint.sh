#!/bin/sh
set -e
npx prisma migrate deploy --schema=/repo/packages/database/prisma/schema.prisma
exec node dist/server.js
