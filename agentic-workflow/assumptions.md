# Assumptions — Sprint 1

> Documented because Jira MCP was not authenticated during Sprint 1 setup.
> All requirements were derived from the detailed task prompt provided by the team lead.

| # | Assumption | Jira Issue | Impact |
|---|-----------|------------|--------|
| 1 | Frontend framework is Vue.js 3 (confirmed by user mid-session) | STUR-5 | Replaced React scaffold with Vue 3 + Pinia + Vue Router |
| 2 | Backend is Express.js (confirmed by user) | STUR-5 | Express already used |
| 3 | PostgreSQL is the chosen database | STUR-6 | Schema uses PostgreSQL dialect |
| 4 | Roles: ADMIN, MANAGER, OPERATOR, VIEWER | STUR-6 | Defined as enum in Prisma schema |
| 5 | MovementType: INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT | STUR-6 | Covers standard warehouse operations |
| 6 | Rate limit: 100 req/15min global, 10 req/15min auth | STUR-68 | Configurable via env vars |
| 7 | npm workspaces chosen over Turborepo/Nx | STUR-5 | Simpler for university team, no extra tooling |
| 8 | Jira status updates will be done manually | All | No Jira write API available without authentication |
