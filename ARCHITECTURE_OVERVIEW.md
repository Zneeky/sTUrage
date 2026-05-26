# STURage — Architecture Overview

> **System:** Система за складова наличност (University Warehouse Inventory Management System)  
> **Document purpose:** Technical reference for onboarding, thesis writing, presentations, and future refactoring.  
> **Repository root:** `c:\Users\arkan\Desktop\Work\sTUrage`

---

## Architecture Summary

STURage is a **client–server monorepo** composed of three workspaces managed with npm workspaces:

| Workspace | Path | Role |
|---|---|---|
| `apps/backend` | Node.js / Express REST API | Business logic, persistence, auth |
| `apps/frontend` | Vue 3 SPA (Quasar) | User interface |
| `packages/shared` | TypeScript types | Shared contracts between layers |

The system is **not** microservice-based. It is a **modular monolith on the backend** (one Express process, multiple route modules) paired with a **component-based SPA on the frontend**. All three workspaces are developed, tested, and deployed together from this single repository.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend–Backend Connection](#4-frontendbacend-connection)
5. [Build and Run Process](#5-build-and-run-process)
6. [Docker and Deployment](#6-docker-and-deployment)
7. [Database and Persistence](#7-database-and-persistence)
8. [Key Technical Details and Interesting Facts](#8-key-technical-details-and-interesting-facts)
9. [Diagrams](#9-diagrams)
10. [Final Summary](#10-final-summary)

---

## 1. High-Level Architecture

### System type

**Client–server monorepo** with a shared-types package.

```
npm workspaces
├── apps/backend        ← Express REST API (port 3000)
├── apps/frontend       ← Vue 3 SPA (port 5173)
└── packages/shared     ← @sturage/shared TypeScript types
```

The frontend communicates with the backend exclusively through a versioned HTTP REST API under the `/api` prefix. There is no server-side rendering, no GraphQL, and no direct database access from the frontend.

### Role of each major folder

| Folder | Description |
|---|---|
| `apps/backend/src/` | Express application source: routes, controllers, services, middleware, utilities |
| `apps/backend/prisma/` | Prisma schema (single source of truth for DB), migrations, and seed script |
| `apps/frontend/src/` | Vue 3 application source: views, components, stores, router, API clients, layouts |
| `packages/shared/src/` | TypeScript types and enums shared between backend and frontend (`Role`, `MovementType`, `ApiResponse`, `PaginatedResponse`, `ApiError`) |
| `docs/` | Architecture notes, API contract, wireframes, security and DevOps docs |
| `.github/workflows/` | GitHub Actions CI pipeline |

---

## 2. Frontend Architecture

### Framework and tooling

| Item | Value |
|---|---|
| Framework | Vue 3 (`^3.4.27`) |
| Build tool | Vite (`^5.3.1`) |
| Language | TypeScript 5 |
| UI component library | Quasar v2 (`^2.19.3`) with Material icons via `@quasar/extras` |
| State management | Pinia (`^2.1.7`) |
| Router | Vue Router 4 (`^4.3.2`) |
| HTTP client | Axios (`^1.7.2`) |
| Dev server port | 5173 |

### Directory structure

```
apps/frontend/src/
├── main.ts              App entry: creates Pinia, Router, mounts Quasar
├── App.vue              Root component (renders RouterView)
├── api/                 Axios-based API client modules (one per resource)
│   ├── client.ts        Axios instance + request/response interceptors
│   ├── auth.api.ts
│   ├── products.api.ts
│   ├── categories.api.ts
│   ├── suppliers.api.ts
│   ├── warehouses.api.ts
│   ├── stockMovements.api.ts
│   ├── notifications.api.ts
│   ├── users.api.ts
│   └── reports.api.ts
├── stores/              Pinia stores (one per domain)
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── products.ts
│   ├── movements.ts
│   ├── notifications.ts
│   └── users.ts
├── router/
│   └── index.ts         All routes, navigation guards, lazy-loaded views
├── layouts/
│   ├── AppLayout.vue    Main shell: AppHeader + NavSidebar + page slot
│   └── AuthLayout.vue   Centered gradient layout (login screen)
├── views/               One .vue file per screen
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── ProductsView.vue
│   ├── ProductDetailView.vue
│   ├── CategoriesView.vue
│   ├── SuppliersView.vue
│   ├── StockMovementsView.vue
│   ├── ReportsView.vue
│   ├── NotificationsView.vue
│   └── UsersView.vue
└── components/          Reusable UI components
    ├── AppHeader.vue
    ├── NavSidebar.vue
    ├── KpiCard.vue
    ├── StockBadge.vue
    ├── MovementTypeBadge.vue
    ├── MovementsTable.vue
    ├── NotificationBell.vue
    ├── NotificationItem.vue
    ├── ProductFormDialog.vue
    ├── CategoryFormDialog.vue
    ├── SupplierFormDialog.vue
    ├── UserFormDialog.vue
    └── MovementFormDialog.vue
```

### Routing (`src/router/index.ts`)

Vue Router 4 with hash-free history mode. Every route carries meta fields that drive access control:

| Meta field | Type | Effect |
|---|---|---|
| `layout` | `'AppLayout' \| 'AuthLayout'` | Which layout shell to render |
| `public` | `boolean` | Bypass auth guard when `true` |
| `adminOnly` | `boolean` | Restrict to `ADMIN` role |

**Navigation guard logic:**
1. If `!authenticated && !meta.public` → redirect to `/login`
2. If `authenticated && path === /login` → redirect to `/dashboard`
3. If `meta.adminOnly && role !== 'ADMIN'` → redirect to `/dashboard`

**Defined routes:**

| Path | View | Notes |
|---|---|---|
| `/login` | `LoginView` | public, `AuthLayout` |
| `/dashboard` | `DashboardView` | `AppLayout` |
| `/products` | `ProductsView` | `AppLayout` |
| `/products/:id` | `ProductDetailView` | `AppLayout` |
| `/categories` | `CategoriesView` | `AppLayout` |
| `/suppliers` | `SuppliersView` | `AppLayout` |
| `/stock-movements` | `StockMovementsView` | `AppLayout` |
| `/reports` | `ReportsView` | `AppLayout` |
| `/notifications` | `NotificationsView` | `AppLayout` |
| `/users` | `UsersView` | `AppLayout`, `adminOnly` |

### State management (`src/stores/`)

Each Pinia store owns one domain:

| Store | Responsibilities |
|---|---|
| `auth.ts` | JWT token, authenticated user, login/logout actions; persists to `localStorage` |
| `dashboard.ts` | KPI totals, recent movements, low-stock items (parallel API calls on mount) |
| `products.ts` | Product list with server-side pagination, search, category/supplier filters |
| `movements.ts` | Stock movement list with type, product, and date-range filters |
| `notifications.ts` | Notification list, unread count, toast delivery for new arrivals |
| `users.ts` | User list and audit log (admin-only views) |

### API layer (`src/api/`)

`client.ts` is the single Axios instance:
- `baseURL`: `/api` (proxied by Vite dev server; resolved by Nginx in production)
- **Request interceptor:** reads token from `localStorage`, adds `Authorization: Bearer <token>`
- **Response interceptor:** on `401` → clears token, calls `authStore.logout()`, redirects to `/login`

Each `*.api.ts` module calls `client.ts` and returns typed responses. No raw `fetch` calls exist anywhere in the frontend.

### UI library and styling

- **Quasar v2** provides the full component library: tables, dialogs, forms, buttons, badges, notifications, layout primitives.
- **Brand palette** (defined in `main.ts`): primary `#1565C0`, secondary `#0288D1`, accent `#00ACC1`, dark `#1A2035`.
- **CSS variables:** `--stu-bg` for page background; applied in `AppLayout.vue`.
- **No custom CSS framework** (Tailwind, Bootstrap, etc.) is used alongside Quasar.

### Important configuration files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite plugins, `@` path alias, dev proxy `/api → backend`, port 5173 |
| `tsconfig.json` | Extends `@vue/tsconfig/tsconfig.dom.json`, path aliases |
| `package.json` | Dependencies, `dev` / `build` / `lint` / `test` scripts |

---

## 3. Backend Architecture

### Framework and tooling

| Item | Value |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js (`^4.19.2`) |
| Language | TypeScript 5 |
| ORM | Prisma 5 (`^5.14.0`) |
| Database | PostgreSQL 16 |
| Validation | Zod (`^4.3.6`) + express-validator (`^7.1.0`) |
| Logging | Winston (`^3.19.0`) + Morgan (`^1.10.0`) |
| Security | Helmet (`^8.1.0`), express-rate-limit (`^7.3.1`), cors (`^2.8.5`) |
| Auth | `jsonwebtoken` (`^9.0.2`) + `bcryptjs` (`^2.4.3`) |
| Reporting | `exceljs` (`^4.4.0`), `pdfkit` (`^0.18.0`) |
| Email | `nodemailer` (`^8.0.6`) |
| Port | 3000 |

### Directory structure

```
apps/backend/src/
├── index.ts             Server entry: reads PORT, calls app.listen()
├── app.ts               Express setup: Helmet, CORS, Morgan, JSON body parsing,
│                        route mounting at /api, errorHandler, notFound handler
├── controllers/         One controller per resource (handles HTTP in/out)
│   ├── auth.controller.ts
│   ├── products.controller.ts
│   ├── categories.controller.ts
│   ├── suppliers.controller.ts
│   ├── warehouses.controller.ts
│   ├── stockMovements.controller.ts
│   ├── notifications.controller.ts
│   ├── reports.controller.ts
│   └── users.controller.ts
├── routes/              Express Router instances (one per resource)
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── category.routes.ts
│   ├── supplier.routes.ts
│   ├── warehouse.routes.ts
│   ├── stockMovement.routes.ts
│   ├── notifications.routes.ts
│   ├── reports.routes.ts
│   └── users.routes.ts
├── middleware/
│   ├── auth.ts          authenticate() and authorize(...roles)
│   ├── rateLimiter.ts   authLimiter (10 min / 30 failed)
│   ├── audit.middleware.ts  AuditLog writer on POST/PUT/PATCH/DELETE
│   └── errorHandler.ts  Zod → 422, Prisma → 409/404/400, JWT → 401, 5xx
├── services/
│   ├── notification.service.ts  checkLowStock(), SSE broadcast, email trigger
│   ├── sseClients.ts            in-memory SSE client registry
│   ├── email.service.ts         sendLowStockEmail() via Nodemailer
│   └── report.service.ts        Excel/PDF report generation
└── utils/
    ├── logger.ts         Winston logger (console + file)
    ├── prisma.ts         Singleton PrismaClient
    └── tokenBlacklist.ts In-memory JWT blacklist with TTL cleanup
```

### Route and endpoint surface

All routes are mounted at `/api` in `app.ts`.

#### Auth (`auth.routes.ts`)

| Method | Path | Auth | Roles | Handler |
|---|---|---|---|---|
| POST | `/api/auth/register` | authLimiter | — | `register` |
| POST | `/api/auth/login` | authLimiter | — | `login` |
| POST | `/api/auth/logout` | authenticate | any | `logout` |
| GET | `/api/auth/me` | authenticate | any | `me` |

#### Products (`product.routes.ts`)

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/api/products` | authenticate | any |
| GET | `/api/products/:id` | authenticate | any |
| POST | `/api/products` | authenticate | ADMIN, MANAGER |
| PUT | `/api/products/:id` | authenticate | ADMIN, MANAGER |
| DELETE | `/api/products/:id` | authenticate | ADMIN |

#### Categories, Suppliers, Warehouses

Same pattern as Products (GET any, POST/PUT ADMIN+MANAGER, DELETE ADMIN).

#### Stock Movements (`stockMovement.routes.ts`)

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/api/stock-movements` | authenticate | any |
| GET | `/api/stock-movements/:id` | authenticate | any |
| POST | `/api/stock-movements` | authenticate | ADMIN, MANAGER, OPERATOR |

#### Notifications (`notifications.routes.ts`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/notifications/stream` | token in query param | Server-Sent Events (SSE) |
| GET | `/api/notifications` | authenticate | list |
| PATCH | `/api/notifications/read-all` | authenticate | bulk mark read |
| PATCH | `/api/notifications/:id/read` | authenticate | single mark read |
| DELETE | `/api/notifications/:id` | authenticate | delete |

#### Reports (`reports.routes.ts`)

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/api/reports/current-stock` | authenticate | ADMIN, MANAGER |
| GET | `/api/reports/movement` | authenticate | ADMIN, MANAGER |
| GET | `/api/reports/low-stock` | authenticate | ADMIN, MANAGER |

#### Users (`users.routes.ts`)

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/api/users` | authenticate | ADMIN |
| GET | `/api/users/audit-log` | authenticate | ADMIN |
| GET | `/api/users/:id` | authenticate | ADMIN |
| POST | `/api/users` | authenticate + auditLog | ADMIN |
| PUT | `/api/users/:id` | authenticate + auditLog | ADMIN |
| PATCH | `/api/users/:id/deactivate` | authenticate + auditLog | ADMIN |

#### Health

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | — | No rate limit, no auth; returns 200 |

### Authentication and authorization (`src/middleware/auth.ts`)

```
Request
  └── authenticate()
        ├── Extract Bearer token from Authorization header
        ├── Check tokenBlacklist (logout support)
        ├── jwt.verify() with JWT_SECRET
        └── Attach { id, email, role } to req.user
  └── authorize(...roles)
        └── Check req.user.role ∈ allowed roles → 403 if not
```

### Business logic organization

There is no formal service layer for CRUD operations — logic lives in controllers, which call `prisma` directly. The service layer exists for:
- **Notification service:** low-stock threshold evaluation + SSE broadcast + email
- **Email service:** Nodemailer wrapper
- **Report service:** ExcelJS / PDFKit document generation

This is a deliberate simplification appropriate for a university-scope project. For a production system, controllers would delegate to dedicated service classes.

### Error handling (`src/middleware/errorHandler.ts`)

| Error type | HTTP status | Notes |
|---|---|---|
| `ZodError` | 422 | Field-level validation details |
| Prisma `P2002` | 409 | Unique constraint violation |
| Prisma `P2025` | 404 | Record not found |
| Prisma `P2003` | 400 | Foreign key constraint failure |
| `JsonWebTokenError` / `TokenExpiredError` | 401 | Auth failure |
| Unknown 5xx | 500 | Logged to Winston, generic message to client |

---

## 4. Frontend–Backend Connection

### Request flow overview

```
Browser (Vue SPA)
  │
  ├── Pinia store action (e.g., products.fetchProducts())
  │     │
  │     └── products.api.ts → axios client (src/api/client.ts)
  │           │
  │           ├── Request interceptor: adds Authorization: Bearer <token>
  │           │
  │           └── HTTP GET /api/products?page=1&limit=20&search=...
  │                 │
  │                 └── Vite proxy (/api → http://localhost:3000)
  │                       │
  │                       └── Express router → authenticate() → controller → Prisma → PostgreSQL
  │
  └── Response interceptor:
        ├── 2xx  → return data
        └── 401  → clear token, router.push('/login')
```

### Key frontend-to-backend mappings

| Frontend file | API call | Backend endpoint |
|---|---|---|
| `api/auth.api.ts` | `login()` | POST `/api/auth/login` |
| `api/auth.api.ts` | `me()` | GET `/api/auth/me` |
| `api/products.api.ts` | `listProducts()` | GET `/api/products` |
| `api/products.api.ts` | `createProduct()` | POST `/api/products` |
| `api/stockMovements.api.ts` | `listMovements()` | GET `/api/stock-movements` |
| `api/stockMovements.api.ts` | `createMovement()` | POST `/api/stock-movements` |
| `api/notifications.api.ts` | `listNotifications()` | GET `/api/notifications` |
| `api/notifications.api.ts` | SSE connection | GET `/api/notifications/stream` |
| `api/reports.api.ts` | `currentStockReport()` | GET `/api/reports/current-stock` |
| `api/categories.api.ts` | CRUD | `/api/categories` |
| `api/suppliers.api.ts` | CRUD | `/api/suppliers` |
| `api/warehouses.api.ts` | CRUD | `/api/warehouses` |
| `api/users.api.ts` | CRUD + audit | `/api/users`, `/api/users/audit-log` |

### Important user journey: Login

1. User submits email + password in `LoginView.vue`
2. `authStore.login()` (Pinia) calls `auth.api.ts → POST /api/auth/login`
3. Backend validates credentials: finds user by email, `bcrypt.compare(password, hash)`
4. On success: returns `{ data: { token, user } }`
5. `authStore` saves token + user to `localStorage` and Pinia state
6. `router.push('/dashboard')`
7. All subsequent requests carry `Authorization: Bearer <token>` via the Axios interceptor

### Important user journey: Creating a stock movement

1. User clicks "New Movement" in `StockMovementsView.vue` or `ProductDetailView.vue`
2. `MovementFormDialog.vue` opens; user fills product, type, quantity, warehouse
3. On submit: `movements.api.ts → POST /api/stock-movements`
4. Backend: `authenticate()` → `authorize(ADMIN, MANAGER, OPERATOR)` → `stockMovements.controller.createTransaction()`
5. Controller creates `StockMovement` record, updates `StockItem.quantity`
6. `notification.service.checkLowStock()` runs: if `totalQuantity ≤ product.minStock`, creates/deduplicates a `Notification` and broadcasts to all SSE clients
7. Browser receives SSE event; `notifications.ts` store updates badge count; `NotificationBell.vue` re-renders
8. API returns created movement; `movements.ts` store refreshes list

### Base URL and CORS configuration

| Environment | Frontend origin | Backend base URL | Resolved by |
|---|---|---|---|
| Development | `http://localhost:5173` | `http://localhost:3000` | Vite proxy (`/api → VITE_API_BASE_URL`) |
| Docker dev | `http://localhost:5173` | `http://backend:3000` | Docker network + Vite proxy |
| Production | Configured via `FRONTEND_URL` | nginx serves frontend + proxies `/api` | Nginx `proxy_pass` |

CORS on the backend (`app.ts`) allows only the origin specified by `process.env.FRONTEND_URL`.

### Error boundary

- **Frontend:** Axios response interceptor catches 401 globally. Individual views catch other errors with `try/catch` and display Quasar `Notify` toasts.
- **Backend:** `errorHandler.ts` is the last Express middleware. It normalises all errors into `{ status, error, details? }` and never leaks stack traces to clients in production.

---

## 5. Build and Run Process

### Prerequisites

- Node.js ≥ 18, npm ≥ 9
- PostgreSQL 16 (or Docker)

### Install dependencies

```bash
# From repository root — installs all workspaces
npm install
```

### Run locally (without Docker)

```bash
# Copy and edit environment variables
cp .env.example apps/backend/.env
# Edit DATABASE_URL to point to your local Postgres

# Database setup (run once)
npm run db:migrate    # prisma migrate dev
npm run db:generate   # prisma generate
npm run db:seed       # seed initial data

# Start both servers concurrently
npm run dev
# OR individually:
npm run dev:backend   # Express on :3000
npm run dev:frontend  # Vite on :5173
```

### Available root-level scripts (`package.json`)

| Script | Action |
|---|---|
| `npm run dev` | Concurrently starts backend + frontend dev servers |
| `npm run dev:backend` | `nodemon` TypeScript backend |
| `npm run dev:frontend` | Vite HMR dev server |
| `npm run build` | Build all workspaces (`tsc` + `vite build`) |
| `npm run lint` | ESLint across all workspaces |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run test` | Jest (backend) + Vitest (frontend) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:push` | `prisma db push` (schema sync without migration) |
| `npm run db:seed` | `ts-node prisma/seed.ts` |
| `npm run docker:dev` | `docker compose up --build` |
| `npm run docker:prod` | `docker compose -f docker-compose.prod.yml up --build` |
| `npm run docker:down` | `docker compose down` |

### Required environment variables

Documented fully in `.env.example`. Critical variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Must be changed for production |
| `JWT_EXPIRES_IN` | Token TTL (default: `8h`) |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:5173`) |
| `VITE_API_BASE_URL` | Injected into frontend build (default: `http://localhost:3000`) |
| `PORT` | Backend port (default: `3000`) |

---

## 6. Docker and Deployment

### Compose files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Development environment (hot reload, volume mounts) |
| `docker-compose.override.yml` | Local developer overrides |
| `docker-compose.prod.yml` | Production build (multi-stage, Nginx, no mounts) |

### Services defined in `docker-compose.yml`

#### `postgres`
- Image: `postgres:16-alpine`
- Credentials: `sturage_user` / `sturage_pass` / DB `sturage_db`
- Port: `5432`
- Volume: `postgres_data` (named volume, persists between restarts)
- Health check: `pg_isready` every 10s

#### `backend`
- Build context: `apps/backend/`, target stage: `development`
- Depends on: `postgres` (health check must pass)
- Port: `3000:3000`
- Volumes: source code mounted for hot reload; `backend_modules` for node_modules
- Environment: `NODE_ENV=development`, `DATABASE_URL`, `JWT_SECRET`, etc.

#### `frontend`
- Build context: `apps/frontend/`, target stage: `development`
- Depends on: `backend`
- Port: `5173:5173`
- Volumes: source code mounted for HMR; `frontend_modules` for node_modules
- Environment: `VITE_API_BASE_URL=http://localhost:3000`

### Backend Dockerfile (`apps/backend/Dockerfile`)

Four-stage multi-stage build:

| Stage | Base | Purpose |
|---|---|---|
| `base` | `node:20-alpine` | Install all npm deps (including dev) |
| `development` | `base` | Mount source code, run `nodemon` |
| `builder` | `base` | Copy source, generate Prisma client, compile TypeScript → `dist/` |
| `production` | `node:20-alpine` | Copy only `dist/`, `node_modules/`, `prisma/`; run `node dist/index.js` |

Includes `openssl` package for Prisma's query engine binary.

### Frontend Dockerfile (`apps/frontend/Dockerfile`)

Three-stage multi-stage build:

| Stage | Base | Purpose |
|---|---|---|
| `base` | `node:20-alpine` | Install npm deps |
| `development` | `base` | Mount source, run Vite HMR dev server |
| `builder` | `base` | `vite build` → `dist/` |
| `production` | `nginx:alpine` | Serve `dist/` + `nginx.conf` (with `/api` proxy pass) |

### How to run with Docker

```bash
# Development (hot reload):
cp .env.example .env
docker compose up
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Postgres: localhost:5432

# Production:
docker compose -f docker-compose.prod.yml up --build
```

### Production-readiness considerations

- **Token blacklist is in-memory** (`utils/tokenBlacklist.ts`): resets on server restart. For production, replace with Redis.
- **JWT_SECRET** must be rotated and stored securely (environment secret, not `.env` file).
- **Database URL** should use a managed PostgreSQL instance with TLS.
- **SMTP credentials** (Mailtrap in dev) must be replaced with a real mail provider.
- **`FRONTEND_URL` CORS origin** must be locked to the production domain.
- The Nginx production image should be configured with TLS termination (load balancer or Certbot).

---

## 7. Database and Persistence

### Technology

- **Database:** PostgreSQL 16
- **ORM:** Prisma 5 (schema at `apps/backend/prisma/schema.prisma`)
- **Migrations:** Prisma Migrate — versioned SQL migrations in `apps/backend/prisma/migrations/`
- **Seed:** `apps/backend/prisma/seed.ts` — bootstraps two users, two categories, one supplier, two warehouses, two products, and initial stock

### Entity model

```
User ─────────── StockMovement ──────── Product
                                          │
                                    ┌─────┴──────┐
                                 Category     Supplier
                                               │
                               StockItem ──────┤
                                 │             │
                              Warehouse        │
                                               │
                            Notification ──────┘

User ──────────── AuditLog
```

### Entities

| Entity | Key fields | Notes |
|---|---|---|
| `User` | id (CUID), email (unique), password (bcrypt), role, isActive | Soft delete via `isActive` |
| `Category` | id, name (unique), description | Reference data |
| `Supplier` | id, name, contactName, email, phone, address, isActive | Soft delete |
| `Warehouse` | id, name, location, description, isActive | Soft delete |
| `Product` | id, sku (unique), name, unit, minStock, categoryId, supplierId, isActive | Soft delete; minStock drives alerts |
| `StockItem` | id, quantity, productId, warehouseId | Unique on `(productId, warehouseId)`; current state |
| `StockMovement` | id, type, quantity, note, productId, createdById, sourceWarehouseId, targetWarehouseId, createdAt | Append-only audit log; never deleted |
| `Notification` | id, type, message, isRead, productId, createdAt | Deduplicated per `(productId, type)` while unread |
| `AuditLog` | id, action, entity, entityId, payload (JSON), userId, createdAt | Written by `audit.middleware.ts` |

### Enums

```typescript
enum Role           { ADMIN, MANAGER, OPERATOR, VIEWER }
enum MovementType   { INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT }
enum NotificationType { LOW_STOCK, OUT_OF_STOCK }
```

### ORM usage

- `apps/backend/src/utils/prisma.ts` exposes a singleton `PrismaClient`.
- All database access is through Prisma's type-safe query builder — no raw SQL in application code.
- Soft deletes are enforced manually in controllers (set `isActive: false`; filter `where: { isActive: true }`).

### Connection string

Format: `postgresql://USER:PASS@HOST:PORT/DB`  
Development default: `postgresql://sturage_user:sturage_pass@localhost:5432/sturage_db`  
Docker development: `postgresql://sturage_user:sturage_pass@postgres:5432/sturage_db`

---

## 8. Key Technical Details and Interesting Facts

### Real-time notifications via Server-Sent Events (SSE)

The notification system (`GET /api/notifications/stream`) uses Server-Sent Events rather than WebSockets. The browser holds a persistent HTTP connection; the backend maintains an in-memory array of `Response` objects (`src/services/sseClients.ts`). When `checkLowStock()` creates a new notification, it iterates the array and writes an `event:` frame to each client. SSE is simpler than WebSockets for this one-directional use case but requires the `token` in the query parameter (since the `Authorization` header cannot be set for SSE connections from the browser).

### Token blacklist (`src/utils/tokenBlacklist.ts`)

Logout is implemented by adding the JWT string to an in-memory `Set`. A `setTimeout` auto-removes each entry after its remaining TTL. This gives correct logout semantics without requiring a database round-trip on every request. **Limitation:** the blacklist is lost on server restart — logged-out tokens become valid again. The code comment explicitly notes this as an MVP decision and recommends Redis for production.

### Immutable stock movement log

`StockMovement` is append-only — no controller or route exposes an UPDATE or DELETE for movements. This is enforced at the API layer (no `PUT /api/stock-movements/:id`). Combined with the `AuditLog` table for all other mutations, the system maintains a complete, tamper-evident audit trail suitable for a warehouse context.

### Notification deduplication

`notification.service.checkLowStock()` queries for an existing unread notification of the same type for the same product before creating a new one. This prevents notification spam — one LOW_STOCK alert per product remains until the operator marks it read.

### Dual-quantity tracking

The system uses two separate structures for stock:
- **`StockItem`** — current quantity per `(product, warehouse)` pair, updated on every movement.
- **`StockMovement`** — historical record of every change, never modified.

This separation allows both live inventory queries (fast, indexed `StockItem` lookup) and full audit history without recalculating from movements.

### Shared types package (`packages/shared`)

`@sturage/shared` is consumed by both the backend (Prisma enums align with these types) and the frontend (API response types). This single source of truth prevents type drift between layers. Because the package is a workspace, TypeScript path resolution works without publishing to npm.

### Multi-stage Docker builds

Both backend and frontend Dockerfiles use multi-stage builds with named targets (`development`, `builder`, `production`). `docker-compose.yml` targets the `development` stage (with source mounts), while `docker-compose.prod.yml` targets `production` (minimal, no dev tools). This eliminates the need for two separate Dockerfiles.

### Report generation

`exceljs` and `pdfkit` are used server-side to generate `.xlsx` and `.pdf` reports. Files are streamed directly to the HTTP response — no intermediate file storage.

### Areas of technical debt and risk

| Area | Issue | Recommendation |
|---|---|---|
| Token blacklist | In-memory; resets on restart | Replace with Redis |
| No service layer | Controllers call Prisma directly | Extract service classes for testability |
| No frontend tests | Vitest is configured but test coverage is Not found in the current repository | Add component + store tests |
| Email in async fire-and-forget | Low-stock email errors are caught and logged silently | Add retry queue (e.g., Bull) |
| `VIEWER` role | Defined in enum and DB but no role-specific read restrictions in routes | Audit GET endpoints for VIEWER use case |
| Soft-delete filters | `isActive: true` filter must be added manually to every query | Consider Prisma middleware to inject automatically |

---

## 9. Diagrams

### High-level system architecture

```mermaid
graph TD
    subgraph Browser
        VUE[Vue 3 SPA<br/>Quasar · Pinia · Vue Router]
    end

    subgraph Docker / Host
        subgraph frontend_container[frontend :5173]
            NGINX_DEV[Vite Dev Server<br/>or Nginx :prod]
        end

        subgraph backend_container[backend :3000]
            EXPRESS[Express.js API<br/>Node 20 · TypeScript]
            PRISMA[Prisma 5 ORM]
        end

        subgraph db_container[postgres :5432]
            PG[(PostgreSQL 16)]
        end
    end

    VUE -- HTTP/REST + SSE --> NGINX_DEV
    NGINX_DEV -- proxy /api --> EXPRESS
    EXPRESS -- Prisma queries --> PRISMA
    PRISMA -- SQL --> PG
```

### Frontend–backend request flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant V as Vue View / Pinia Store
    participant A as api/client.ts (Axios)
    participant E as Express Router
    participant M as Middleware
    participant C as Controller
    participant DB as PostgreSQL

    U->>V: User action (e.g. submit login form)
    V->>A: authApi.login(email, password)
    A->>A: Request interceptor: add Bearer token
    A->>E: POST /api/auth/login
    E->>M: authLimiter
    E->>C: auth.controller.login()
    C->>DB: prisma.user.findUnique({ email })
    DB-->>C: User row
    C->>C: bcrypt.compare(password, hash)
    C-->>E: { token, user }
    E-->>A: 200 { data: { token, user } }
    A->>A: Response interceptor (2xx — pass through)
    A-->>V: { token, user }
    V->>V: authStore.token = token (localStorage)
    V->>U: router.push('/dashboard')
```

### Docker container diagram

```mermaid
graph LR
    subgraph docker_network[Docker Network]
        FE[frontend<br/>:5173<br/>Vite / Nginx]
        BE[backend<br/>:3000<br/>Node.js Express]
        DB[(postgres<br/>:5432<br/>PostgreSQL 16)]
    end

    HOST[Host Browser<br/>:5173] --> FE
    FE -->|proxy /api| BE
    BE -->|Prisma SQL| DB
    DB --- VOL[(postgres_data<br/>named volume)]

    style VOL fill:#f5f5f5,stroke:#999
```

### Database entity relationships

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        string firstName
        string lastName
        Role role
        boolean isActive
    }
    Category {
        string id PK
        string name
        string description
    }
    Supplier {
        string id PK
        string name
        string contactName
        string email
        boolean isActive
    }
    Warehouse {
        string id PK
        string name
        string location
        boolean isActive
    }
    Product {
        string id PK
        string sku
        string name
        string unit
        int minStock
        boolean isActive
        string categoryId FK
        string supplierId FK
    }
    StockItem {
        string id PK
        int quantity
        string productId FK
        string warehouseId FK
    }
    StockMovement {
        string id PK
        MovementType type
        int quantity
        string note
        string productId FK
        string createdById FK
        string sourceWarehouseId FK
        string targetWarehouseId FK
        datetime createdAt
    }
    Notification {
        string id PK
        NotificationType type
        string message
        boolean isRead
        string productId FK
        datetime createdAt
    }
    AuditLog {
        string id PK
        string action
        string entity
        string entityId
        json payload
        string userId FK
        datetime createdAt
    }

    Category ||--o{ Product : "has"
    Supplier ||--o{ Product : "supplied by"
    Product ||--o{ StockItem : "stored in"
    Warehouse ||--o{ StockItem : "stores"
    Product ||--o{ StockMovement : "moved as"
    User ||--o{ StockMovement : "created by"
    Product ||--o{ Notification : "triggers"
    User ||--o{ AuditLog : "performed by"
```

---

## 10. Final Summary

STURage is a full-stack university warehouse inventory management system built as a TypeScript monorepo. The **Vue 3 SPA** communicates with an **Express REST API** over HTTP. The API manages seven domain entities in **PostgreSQL 16** via the **Prisma ORM**. Authentication is JWT-based with role-based access control (`ADMIN > MANAGER > OPERATOR > VIEWER`). Real-time low-stock alerts are delivered via **Server-Sent Events**. Reports are generated server-side as Excel or PDF and streamed to the browser. The entire system runs in three **Docker containers** (frontend, backend, database) with hot reload in development and minimal production images via multi-stage builds.

The codebase is clean and well-structured for its scope: shared TypeScript types, a uniform API response envelope, an immutable stock movement audit log, and a layered security stack (Helmet, CORS, rate limiting, Zod validation, bcrypt, JWT).

### How to use this document later

| Use case | Relevant sections |
|---|---|
| **Onboarding a new developer** | §1 (overview), §5 (run locally), §6 (Docker), §7 (seed credentials) |
| **Bachelor thesis / project report** | §1–§3 (architecture description), §9 (diagrams), §10 (summary) |
| **Technical presentation** | §1 summary table, §9 Mermaid diagrams |
| **API integration / new endpoint** | §3 (route table), §4 (request flow) |
| **Database changes** | §7 (entities, migrations, seed) |
| **Security audit** | §3 (auth/authz), §6 (production-readiness), §8 (token blacklist) |
| **Refactoring planning** | §8 (technical debt table) |
| **CI/CD understanding** | §5 (scripts), §6 (Docker), CI pipeline (§5 build section) |
