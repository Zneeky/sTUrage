# STURage — Система за складова наличност

University project — Warehouse Inventory Management System

## Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Backend  | Node.js 20 + Express.js + TypeScript |
| Database | PostgreSQL 16 + Prisma ORM    |
| Frontend | Vue 3 + Vite + Pinia          |
| CI/CD    | GitHub Actions                |
| Containers | Docker + Docker Compose     |

## Quick Start (Docker)

```bash
# 1. Clone and set up env
cp .env.example .env

# 2. Start all services
docker compose up

# Backend API: http://localhost:3000
# Frontend:    http://localhost:5173
# PostgreSQL:  localhost:5432
```

## Local Development (without Docker)

```bash
# Prerequisites: Node 20+, PostgreSQL 16

# Install all dependencies
npm install

# Set up backend env
cp .env.example apps/backend/.env

# Run DB migrations and seed
cd apps/backend
npm run db:migrate
npm run db:seed

# Start backend (port 3000)
npm run dev:backend

# Start frontend (port 5173)
npm run dev:frontend
```

## Repository Structure

```
/
├── apps/
│   ├── backend/          Express API + Prisma
│   └── frontend/         Vue 3 SPA
├── packages/
│   └── shared/           Shared TypeScript types
├── docs/
│   ├── architecture/     Stack decisions
│   ├── api/              REST contract + Postman
│   ├── database/         Schema docs
│   ├── ux/               Wireframes
│   ├── security/         Rate limiting docs
│   └── devops/           CI/CD docs
├── agentic-workflow/     Sprint plans, decision logs
├── skills/               Claude Code instruction files
└── .github/workflows/    CI pipelines
```

## Jira Project

[STUR Sprint Board](https://expbanking.atlassian.net/jira/software/projects/STUR/boards/169/backlog)

## Default Credentials (seed)

| Email                  | Password   | Role  |
|------------------------|------------|-------|
| admin@sturage.local    | Admin@123  | ADMIN |
