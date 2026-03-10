# Architecture Overview — STURage

> STUR-60 | Sprint 1

## System Description

STURage is a web-based warehouse inventory management system. It tracks products across warehouses, records all stock movements as an immutable audit log, and exposes a role-based REST API consumed by a Vue 3 SPA.

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Browser                                   │
│                 Vue 3 SPA  (port 5173 dev / port 80 prod)          │
│   Pinia stores ──► Vue Router ──► Views ──► Axios HTTP client      │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTP/REST  /api/*
                             │ Bearer token (JWT)
┌────────────────────────────▼───────────────────────────────────────┐
│                       Express.js API                               │
│                    Node.js 20  (port 3000)                         │
│                                                                    │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐    │
│  │  Middleware  │   │    Routes    │   │  Future: Controllers │    │
│  │  cors        │   │  /auth       │   │  + Services          │    │
│  │  morgan      │   │  /products   │   │  (Sprint 2+)         │    │
│  │  rate-limit  │   │  /categories │   └──────────────────────┘    │
│  │  auth (JWT)  │   │  /suppliers  │                               │
│  │  errorHandler│   │  /warehouses │                               │
│  └─────────────┘   │  /stock-move │                               │
│                    └──────┬───────┘                               │
└───────────────────────────┼────────────────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────▼────────────────────────────────────────┐
│                      PostgreSQL 16                                 │
│                   sturage_db  (port 5432)                          │
│                                                                    │
│  users  categories  suppliers  warehouses                          │
│  products  stock_items  stock_movements                            │
└────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (`apps/frontend`)
- Vue 3 Composition API SPA, built with Vite
- Pinia for global state (auth token, user profile)
- Vue Router for client-side routing with lazy-loaded views
- Axios instance with JWT interceptor for all API calls
- 8 screens: Login, Register, Dashboard, Products, Product Detail, Categories, Stock Movements, Reports

### Backend (`apps/backend`)
- Express.js REST API, all routes under `/api`
- JWT-based stateless authentication
- Role-based access control: ADMIN > MANAGER > OPERATOR > VIEWER
- Rate limiting: 100 req/15 min global, 10 req/15 min on auth endpoints
- Prisma ORM for type-safe database access
- Centralised error handler returns consistent `{ status, error, details? }` shape

### Shared (`packages/shared`)
- TypeScript types shared between frontend and backend
- `Role`, `MovementType`, `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`
- Prevents type drift between layers

### Database
- PostgreSQL 16 — relational model fits inventory domain (FK constraints, transactions)
- Prisma schema is the single source of truth
- StockItem: current quantity per (product, warehouse) pair — updated on each movement
- StockMovement: immutable audit trail — never updated or deleted

## Data Flow: Stock Movement

```
POST /api/stock-movements
        │
        ▼
   rateLimiter ──► authenticate ──► authorize(ADMIN,MANAGER,OPERATOR)
        │
        ▼
   Validate body (express-validator) — Sprint 2
        │
        ▼
   prisma.$transaction([
     create StockMovement record,
     upsert StockItem (increment/decrement quantity)
   ])
        │
        ▼
   201 { data: StockMovement }
```

## Deployment Architecture

### Development
```
docker compose up
# Starts: postgres + backend (ts-node-dev) + frontend (vite dev server)
# Hot reload on source changes
```

### Production (planned Sprint 3+)
```
docker compose -f docker-compose.prod.yml up
# Backend: compiled JS in node:20-alpine
# Frontend: nginx serving static Vite build
# Postgres: managed service (Neon / Supabase) or self-hosted volume
```

## Security Baseline (Sprint 1)
- express-rate-limit on all `/api` routes
- Stricter rate limit on `/api/auth` (brute-force protection)
- JWT with configurable expiry (default 7 days)
- bcryptjs password hashing (cost factor 10)
- CORS enabled (tighten origin in production)
- Planned Sprint 2: helmet, express-validator input sanitisation

## Scalability Considerations (for reference)
This is a university project. The in-memory rate limiter and single-process Express server are intentional simplifications. For production scale:
- Replace in-memory rate limiter with Redis-backed store
- Add a load balancer if running multiple Express instances
- Use connection pooling (PgBouncer) for PostgreSQL
- Move JWT to short-lived access tokens + refresh tokens
