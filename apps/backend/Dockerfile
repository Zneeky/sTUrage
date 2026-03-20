FROM node:20-alpine AS base
WORKDIR /app

# Copy root manifest + lockfile and all workspace manifests
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace deps (hoisted to /app/node_modules)
RUN npm ci

FROM base AS development
COPY . .
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma && \
    npm run build --workspace=apps/backend

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
