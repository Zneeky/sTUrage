#!/bin/sh
set -e

if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
else
  echo "Pushing database schema..."
  npx prisma db push
fi

exec "$@"
