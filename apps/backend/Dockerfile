FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci && apk add --no-cache openssl

# ── Development ────────────────────────────────────────────
FROM base AS development
COPY apps/backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY . .
WORKDIR /app/apps/backend
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# ── Builder ────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma && \
    npm run build --workspace=apps/backend

# ── Production ─────────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/apps/backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
