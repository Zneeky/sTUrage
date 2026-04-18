#!/bin/sh
set -e

cd /app
echo "Installing dependencies..."
npm ci
cd /app/apps/frontend
exec npm run dev -- --host 0.0.0.0
