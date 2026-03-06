# CI Pipeline — STURage

> STUR-74 | Sprint 1

## Pipeline: `.github/workflows/ci.yml`

Triggers on every push and PR to `main`, `develop`, and `feature/**` branches.

## Jobs

| Job      | Steps                                          |
|----------|------------------------------------------------|
| backend  | Install → Prisma Generate → Lint → Build → Test|
| frontend | Install → Lint → Build → Test                  |
| shared   | Install → Build                                |

Each job runs in its own working directory. No inter-job dependency — all run in parallel.

## Caching

npm cache keyed by each workspace's `package-lock.json` for fast installs.

## Secrets Required

None for CI (uses dummy `DATABASE_URL` and `JWT_SECRET` for tests).

## Local CI Validation

```bash
# Run same checks locally before pushing
cd apps/backend && npm run lint && npm run build && npm test
cd apps/frontend && npm run lint && npm run build && npm test
```
