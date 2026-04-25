# ADR-002: PostgreSQL 16 + Prisma ORM

**Date**: 2026-03-08
**Status**: Accepted

## Context
We need a database for a relational inventory domain: products belong to categories, stock items link products to warehouses, movements reference users and products. Strong referential integrity is required.

## Decision
PostgreSQL 16 as the database engine, Prisma 5 as the ORM.

## Rationale

**PostgreSQL over MySQL/SQLite**:
- Full ACID transactions — critical for stock movement + StockItem updates needing atomicity
- Rich constraint support (unique composite keys on StockItem)
- Widely used in production; good university learning value
- SQLite rejected: no concurrent write support, no real FK enforcement by default

**Prisma over TypeORM / Sequelize / raw SQL**:
- Type-safe query builder generated from the schema — no runtime type surprises
- Single `schema.prisma` file is the source of truth for the entire database structure
- Migration system (`prisma migrate dev`) tracks schema changes in version control
- Prisma Studio provides a free GUI for inspecting data during development
- TypeORM rejected: decorator-based schema is harder to read at a glance; worse TS inference

## Consequences
- Prisma Client must be regenerated (`prisma generate`) after every schema change
- Prisma does not support all PostgreSQL-specific features (e.g., partial indexes) — use raw SQL via `prisma.$queryRaw` if needed
- Schema changes require migration files — keep them committed
