# Architecture Stack & Implementation Plan — STURage

> STUR-60 | Sprint 1

## Overview

STURage is a warehouse inventory management system built as a monorepo. The stack is chosen for simplicity, team familiarity, and production readiness within university project constraints.

## Technology Stack

| Layer       | Technology              | Rationale                                                                 |
|-------------|-------------------------|---------------------------------------------------------------------------|
| Backend     | Node.js 20 + Express 5  | Lightweight, well-known by team, fast to prototype                       |
| Language    | TypeScript 5            | Type safety across full stack, shared types package                      |
| Database    | PostgreSQL 16           | Relational model fits inventory domain (FK constraints, transactions)    |
| ORM         | Prisma 5                | Type-safe queries, migration management, excellent DX                    |
| Frontend    | Vue 3 + Vite + Pinia    | Composition API, reactive, lightweight, team preference                  |
| Auth        | JWT (jsonwebtoken)      | Stateless, simple, sufficient for university project                     |
| Containers  | Docker + Docker Compose | Reproducible local dev, easy deployment                                  |
| CI/CD       | GitHub Actions          | Free for public repos, tight GitHub integration                          |
| Monorepo    | npm workspaces          | No extra tooling, native npm support                                     |

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              React SPA (Vite, port 5173)                │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────┐
│                    Express API                          │
│              Node.js 20 (port 3000)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Middleware  │  │   Routers    │  │  Controllers │  │
│  │ (auth, rate) │  │  /api/v1/*   │  │  (handlers)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────┐
│              PostgreSQL 16 (port 5432)                  │
│         sturage_db — full relational schema             │
└─────────────────────────────────────────────────────────┘
```

## Folder Structure

```
/
├── apps/
│   ├── backend/          Express API + Prisma
│   └── frontend/         React SPA
├── packages/
│   └── shared/           Shared TypeScript types
├── docs/                 All documentation
├── agentic-workflow/     AI-assisted planning artifacts
├── skills/               Reusable Claude Code instructions
└── .github/workflows/    CI pipelines
```

## API Design

- REST, versioned under `/api`
- JSON request/response
- JWT Bearer authentication
- Standardized error shape: `{ status, error, details? }`
- Rate limiting: 100 req / 15 min globally, 10 req / 15 min on auth endpoints

## Deployment Strategy

### Local Development
```bash
docker compose up
```

### Production (Future)
- Containerize all services
- Deploy to any VPS or cloud (Render, Railway, DigitalOcean)
- Use `docker compose -f docker-compose.prod.yml up`
- PostgreSQL managed (Neon, Supabase, or self-hosted)

## Security Baseline (Sprint 1)

- `express-rate-limit` on all `/api` routes
- Stricter limiter on `/api/auth` (10 req / 15 min)
- JWT with configurable expiry
- Password hashing via bcryptjs (cost 10)
- Helmet and CORS headers (Sprint 2)
- Input validation via `express-validator` (Sprint 2)
