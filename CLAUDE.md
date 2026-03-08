# STURage — Agent Reference

## What this project is
University warehouse inventory management system ("Система за складова наличност").
Monorepo. One backend API, one frontend SPA, one shared types package.

## Jira
- Project: STUR
- Board: https://expbanking.atlassian.net/jira/software/projects/STUR/boards/169/backlog
- MCP server name: `atlassian` (transport: http, url: https://mcp.atlassian.com/v1/mcp)
- Always fetch the Jira issue before starting work on it. Read description + acceptance criteria + comments.

## Git rules
- Identity: `arkan <arkanahmedov02@gmail.com>` — the only allowed author/committer
- No Co-authored-by. No AI/Claude/Anthropic references anywhere.
- Branch format: `feature/STUR-XX-short-title`
- Commit format: `STUR-XX short imperative message`
- One branch per Jira issue. PR title = `STUR-XX Jira Issue Title`.

## Stack
| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express.js, TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Frontend | Vue 3, Vite, Pinia, Vue Router, TypeScript |
| Shared | @sturage/shared — TypeScript types |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Security | express-rate-limit |
| CI | GitHub Actions |
| Containers | Docker, docker-compose |
| Package manager | npm workspaces |

## Directory layout
```
/
├── apps/
│   ├── backend/                 Express API
│   │   ├── src/
│   │   │   ├── app.ts           Express app setup (cors, middleware, routes)
│   │   │   ├── index.ts         Server entrypoint
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts      JWT authenticate + authorize(roles)
│   │   │   │   └── rateLimiter.ts  apiLimiter + authLimiter
│   │   │   └── routes/          Route stubs — one file per entity
│   │   ├── prisma/
│   │   │   ├── schema.prisma    Single source of truth for DB schema
│   │   │   └── seed.ts          Dev seed data
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   ├── jest.config.ts
│   │   └── package.json
│   └── frontend/                Vue 3 SPA
│       ├── src/
│       │   ├── App.vue
│       │   ├── main.ts          Mounts app, registers Pinia + Router
│       │   ├── router/index.ts  All routes, lazy-loaded views
│       │   ├── stores/auth.ts   Pinia auth store (token, user, isAuthenticated)
│       │   └── views/           One .vue file per screen (8 total, stubs for Sprint 2)
│       ├── Dockerfile
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   └── shared/                  @sturage/shared
│       └── src/
│           ├── index.ts
│           └── types.ts         Role, MovementType, ApiResponse, PaginatedResponse, ApiError
├── docs/
│   ├── architecture/stack.md    Full stack decisions + diagrams
│   ├── api/contract.md          REST endpoint reference
│   ├── api/postman-collection.json
│   ├── database/schema.md       ERD + entity descriptions + setup commands
│   ├── ux/wireframes.md         8 screen text wireframes
│   ├── security/rate-limiting.md
│   └── devops/ci.md
├── agentic-workflow/            Sprint planning artifacts
│   ├── sprint-1-plan.md
│   ├── sprint-1-summary.md
│   ├── implementation-log.md
│   ├── decision-log.md
│   ├── assumptions.md
│   └── next-sprint-preparation.md
├── skills/                      Reusable instruction files for agents
│   ├── jira-skill.md
│   ├── github-skill.md
│   ├── backend-skill.md
│   ├── frontend-skill.md
│   ├── database-skill.md
│   ├── devops-skill.md
│   ├── qa-skill.md
│   └── documentation-skill.md
├── .github/workflows/ci.yml     Runs lint+test+build on push/PR
├── docker-compose.yml           postgres + backend + frontend
├── .env.example                 All required env vars documented
└── package.json                 npm workspaces root
```

## How to run locally

### Docker (recommended)
```bash
cp .env.example .env
docker compose up
# Backend:  http://localhost:3000
# Frontend: http://localhost:5173
# Postgres: localhost:5432
```

### Without Docker
```bash
# Requires Node 20+ and PostgreSQL 16 running locally
npm install
cp .env.example apps/backend/.env
# Edit DATABASE_URL in apps/backend/.env
cd apps/backend
npm run db:migrate    # runs prisma migrate dev
npm run db:generate   # generates prisma client
npm run db:seed       # seeds initial data
npm run dev           # starts backend on :3000

cd ../frontend
npm run dev           # starts frontend on :5173
```

## Environment variables
All variables are documented in `.env.example`. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — sign/verify tokens
- `RATE_LIMIT_WINDOW_MS` — rate limit window (default 900000 = 15 min)
- `RATE_LIMIT_MAX_REQUESTS` — max requests per window (default 100)

## Database
- Engine: PostgreSQL 16
- ORM: Prisma 5 — schema at `apps/backend/prisma/schema.prisma`
- Entities: User, Category, Supplier, Warehouse, Product, StockItem, StockMovement
- Primary keys: CUID (`@default(cuid())`)
- Soft deletes: `isActive Boolean @default(true)` — never hard delete users/products
- StockItem: unique on `(productId, warehouseId)` — tracks current quantity per location
- StockMovement: append-only audit log

## Auth
- JWT Bearer token
- Roles: ADMIN > MANAGER > OPERATOR > VIEWER
- Middleware: `authenticate` (checks token), `authorize(...roles)` (checks role)
- Auth routes have a stricter rate limiter (10 req / 15 min)

## API conventions
- Base: `/api`
- Auth header: `Authorization: Bearer <token>`
- Success: `{ data: T, message?: string }`
- Paginated: `{ data: T[], total, page, limit, totalPages }`
- Error: `{ status: number, error: string, details?: Record<string, string[]> }`

## Sprint state
- Sprint 1: scaffold complete. All route handlers return `501 Not Implemented`.
- Sprint 2: implement route handlers (auth, products, categories, suppliers, warehouses, stock movements).
- See `agentic-workflow/next-sprint-preparation.md` for full Sprint 2 task list.

## Before starting any work
1. `git config user.name "arkan"` and `git config user.email "arkanahmedov02@gmail.com"`
2. Fetch the Jira issue via MCP: `mcp_atlassian_getJiraIssue({ issueKey: "STUR-XX" })`
3. Read acceptance criteria and comments
4. Check out or create the feature branch: `git checkout -b feature/STUR-XX-title`
5. Implement, commit (`STUR-XX message` — no co-author lines), push
