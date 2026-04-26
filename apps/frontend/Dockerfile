FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

# ── Development ────────────────────────────────────────────
FROM base AS development
COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY . .
WORKDIR /app/apps/frontend
EXPOSE 5173
ENTRYPOINT ["/docker-entrypoint.sh"]

# ── Builder ────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npm run build --workspace=apps/frontend

# ── Production ─────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
