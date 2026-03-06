# DevOps Skill — STURage

## Docker
- Each app has a multi-stage Dockerfile: `base → development → builder → production`
- `docker-compose.yml` orchestrates: postgres, backend, frontend
- Healthcheck on postgres before backend starts
- Volumes: `postgres_data` persists DB; app source mounted for hot reload in dev

## Environment Variables
- Never commit `.env` — only `.env.example`
- All secrets via env vars: `JWT_SECRET`, `DATABASE_URL`
- Rate limit config via env: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`

## CI (GitHub Actions)
- File: `.github/workflows/ci.yml`
- Triggers: push + PR on main, develop, feature/**, fix/**
- Jobs run in parallel: backend, frontend, shared
- Each job: install → (generate) → lint → build → test
- Node 20, npm cache per workspace

## Local Commands
```bash
# Full stack
docker compose up

# DB only
docker compose up postgres -d

# Backend dev (outside Docker)
cd apps/backend && npm run dev

# Frontend dev (outside Docker)
cd apps/frontend && npm run dev
```
