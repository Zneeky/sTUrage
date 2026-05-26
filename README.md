# STURage — Система за складова наличност

> University Warehouse Inventory Management System

[![CI](https://github.com/Zneeky/sTUrage/actions/workflows/ci.yml/badge.svg)](https://github.com/Zneeky/sTUrage/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Overview

STURage is a full-stack inventory management system built for university warehouse operations. It tracks products, stock levels, and movements across multiple warehouses — with role-based access control, real-time low-stock alerts, and exportable reports.

### Key Features

- **Role-based access** — four roles: `ADMIN`, `MANAGER`, `OPERATOR`, `VIEWER`
- **Stock movements** — inbound, outbound, transfer, and adjustment with a full audit trail
- **Real-time alerts** — low-stock notifications delivered via Server-Sent Events
- **Reports** — export current stock or movement history as Excel (`.xlsx`) or PDF
- **Audit log** — every write operation is recorded with actor, entity, and payload
- **Multi-warehouse** — products tracked per `(product, warehouse)` pair

---

## Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Backend      | Node.js 20 · Express.js · TypeScript 5          |
| Database     | PostgreSQL 16 · Prisma ORM 5                    |
| Frontend     | Vue 3 · Vite · Pinia · Quasar v2                |
| Auth         | JWT (`jsonwebtoken`) · `bcryptjs`               |
| Validation   | Zod · express-validator                         |
| Reporting    | ExcelJS · PDFKit                                |
| Email        | Nodemailer                                      |
| Security     | Helmet · express-rate-limit · CORS              |
| CI/CD        | GitHub Actions                                  |
| Containers   | Docker · Docker Compose                         |
| Package mgr  | npm workspaces (monorepo)                       |

---

## Quick Start

### Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/Zneeky/sTUrage.git
cd sTUrage

# Set up environment
cp .env.example .env

# Start all services (postgres + backend + frontend)
docker compose up
```

| Service    | URL                       |
|------------|---------------------------|
| Frontend   | http://localhost:5173      |
| Backend API| http://localhost:3000      |
| PostgreSQL | localhost:5432             |

### Local Development (without Docker)

```bash
# Prerequisites: Node.js 20+, PostgreSQL 16

# Install all workspace dependencies
npm install

# Configure backend environment
cp .env.example apps/backend/.env
# Edit DATABASE_URL in apps/backend/.env to point to your local Postgres

# Set up the database
cd apps/backend
npm run db:migrate    # run Prisma migrations
npm run db:generate   # generate Prisma client
npm run db:seed       # seed initial data

# Start both servers
cd ../..
npm run dev:backend   # Express on :3000
npm run dev:frontend  # Vite on :5173
```

---

## Repository Structure

```
/
├── apps/
│   ├── backend/          Express REST API · Prisma · controllers · services
│   └── frontend/         Vue 3 SPA · Pinia stores · Quasar components
├── packages/
│   └── shared/           @sturage/shared — TypeScript types shared across layers
├── docs/
│   ├── architecture/     Stack decisions · ADRs
│   ├── api/              REST contract · Postman collection
│   ├── database/         Schema docs · ERD
│   ├── ux/               Screen wireframes
│   ├── security/         Rate limiting strategy
│   └── devops/           CI/CD pipeline docs
└── .github/workflows/    GitHub Actions — lint · test · build
```

---

## API Overview

All endpoints are prefixed with `/api`. Authentication uses a JWT Bearer token.

| Resource         | Base path              | Min. role     |
|------------------|------------------------|---------------|
| Auth             | `/api/auth`            | —             |
| Products         | `/api/products`        | VIEWER        |
| Categories       | `/api/categories`      | VIEWER        |
| Suppliers        | `/api/suppliers`       | VIEWER        |
| Warehouses       | `/api/warehouses`      | VIEWER        |
| Stock Movements  | `/api/stock-movements` | VIEWER        |
| Notifications    | `/api/notifications`   | VIEWER        |
| Reports          | `/api/reports`         | MANAGER       |
| Users            | `/api/users`           | ADMIN         |
| Health           | `/api/health`          | —             |

Full contract: [`docs/api/contract.md`](docs/api/contract.md) · [Postman collection](docs/api/postman-collection.json)

---

## Environment Variables

| Variable              | Description                                        | Default                  |
|-----------------------|----------------------------------------------------|--------------------------|
| `DATABASE_URL`        | PostgreSQL connection string                       | —                        |
| `JWT_SECRET`          | Secret for signing tokens — **change in prod**    | —                        |
| `JWT_EXPIRES_IN`      | Token TTL                                          | `8h`                     |
| `PORT`                | Backend port                                       | `3000`                   |
| `FRONTEND_URL`        | Allowed CORS origin                                | `http://localhost:5173`  |
| `VITE_API_BASE_URL`   | Backend URL injected into frontend build           | `http://localhost:3000`  |

See [`.env.example`](.env.example) for the full list.

---

## Available Scripts

| Script                  | Action                                       |
|-------------------------|----------------------------------------------|
| `npm run dev`           | Start backend + frontend concurrently        |
| `npm run dev:backend`   | Backend only (nodemon, hot reload)           |
| `npm run dev:frontend`  | Frontend only (Vite HMR)                     |
| `npm run build`         | Build all workspaces                         |
| `npm run lint`          | ESLint across all packages                   |
| `npm run test`          | Jest (backend) + Vitest (frontend)           |
| `npm run db:migrate`    | Run Prisma migrations                        |
| `npm run db:seed`       | Seed demo data                               |
| `npm run db:studio`     | Open Prisma Studio GUI                       |
| `npm run docker:dev`    | `docker compose up --build`                  |
| `npm run docker:prod`   | Production compose build                     |

---

## Default Credentials (seed)

| Email                     | Password    | Role      |
|---------------------------|-------------|-----------|
| admin@sturage.local       | Admin@123   | ADMIN     |
| manager@sturage.local     | Manager@123 | MANAGER   |
| operator@sturage.local    | Operator@123| OPERATOR  |
| viewer@sturage.local      | Viewer@123  | VIEWER    |

> These credentials are for local development only. Never use them in production.

---

## Jira Project

Sprint tracking and issue management: [STUR Board](https://expbanking.atlassian.net/jira/software/projects/STUR/boards/169/backlog)
