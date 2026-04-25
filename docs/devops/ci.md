# CI Pipeline — STURage

> STUR-74 | Sprint 1

## Pipeline file

`.github/workflows/ci.yml`

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop`, `feature/**`, `fix/**`, `chore/**` |
| `pull_request` | `main`, `develop` |

## Jobs

All three jobs run in **parallel** on every trigger.

### `backend` — Node.js 20, `apps/backend/`
1. Checkout
2. Setup Node 20 + npm cache
3. `npm ci`
4. `npx prisma generate` — generates Prisma client from schema
5. `npm run lint` — ESLint
6. `npm run build` — TypeScript compile
7. `npm test` — Jest

Test environment variables injected by CI (no real database needed for unit tests):
```
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
JWT_SECRET=ci_test_secret_not_for_production
```

### `frontend` — Node.js 20, `apps/frontend/`
1. Checkout
2. Setup Node 20 + npm cache
3. `npm ci`
4. `npm run lint` — ESLint
5. `npm run build` — `vue-tsc && vite build`
6. `npm test` — Vitest

### `shared` — Node.js 20, `packages/shared/`
1. Checkout
2. Setup Node 20 + npm cache
3. `npm ci`
4. `npm run build` — TypeScript compile

## Caching

npm dependencies are cached per workspace using each workspace's `package-lock.json` as the cache key. A lockfile change invalidates the cache and forces a fresh `npm ci`.

## Adding tests (Sprint 2+)

For integration tests that need a real database, add a PostgreSQL service to the `backend` job:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

Then update the `DATABASE_URL` env var to match.

## Branch protection (recommended)

On GitHub → Settings → Branches → Add rule for `main`:
- Require status checks: `backend`, `frontend`, `shared`
- Require branches to be up to date before merging
- Require pull request reviews: 1 approval
