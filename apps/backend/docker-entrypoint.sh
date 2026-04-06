#!/bin/sh
set -e

echo "Waiting for database connection..."
until npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; do
  echo "  database not ready, retrying in 2s..."
  sleep 2
done
echo "Database ready."

if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
else
  echo "Pushing database schema..."
  npx prisma db push
fi

exec "$@"
