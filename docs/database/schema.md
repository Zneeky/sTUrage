# Database Design — STURage

> STUR-6 | Sprint 1

## Overview

PostgreSQL 16 with Prisma 5 ORM. The schema file lives at `apps/backend/prisma/schema.prisma` and is the single source of truth for the entire database structure.

---

## Entity-Relationship Diagram (text)

```
User ──────────────────────────────────────── StockMovement
                                                    │
                              ┌─────────────────────┤
                              │                     │
Category ──── Product ────────┼──────────────── StockMovement
                │             │
Supplier ───────┘         StockItem ──────────── Warehouse
```

Full cardinalities:

| From | Relation | To | Notes |
|---|---|---|---|
| Category | 1 ── n | Product | Category required on Product |
| Supplier | 1 ── n | Product | Supplier optional on Product |
| Product | 1 ── n | StockItem | One StockItem per warehouse |
| Warehouse | 1 ── n | StockItem | One StockItem per product |
| Product | 1 ── n | StockMovement | Every movement references a product |
| User | 1 ── n | StockMovement | createdBy — who recorded the movement |

---

## Entities

### User
Represents a system account. Soft-deleted via `isActive`.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| email | String | UNIQUE | Login identifier |
| password | String | | bcrypt hash — **never return in API responses** |
| firstName | String | | |
| lastName | String | | |
| role | Role enum | default OPERATOR | ADMIN / MANAGER / OPERATOR / VIEWER |
| isActive | Boolean | default true | false = soft-deleted |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

---

### Category
Product classification. Names must be unique.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| name | String | UNIQUE | e.g. "Electronics" |
| description | String? | optional | |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

---

### Supplier
Vendor that provides products. Optional on Product.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| name | String | | |
| contactName | String? | optional | |
| email | String? | optional | |
| phone | String? | optional | |
| address | String? | optional | |
| isActive | Boolean | default true | soft-delete |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

---

### Warehouse
Physical storage location. Can hold many products via StockItem.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| name | String | | e.g. "Main Warehouse" |
| location | String | | e.g. "Building A, Floor 2" |
| description | String? | optional | |
| isActive | Boolean | default true | soft-delete |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

---

### Product
A stock-keeping unit (SKU). Quantities are **not** stored on Product — they live in StockItem (per warehouse).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| sku | String | UNIQUE | e.g. "ELEC-001" |
| name | String | | |
| description | String? | optional | |
| unit | String | default "pcs" | pcs / kg / l / m / box |
| minStock | Int | default 0 | Low-stock alert threshold |
| isActive | Boolean | default true | soft-delete |
| categoryId | String | FK → Category | required |
| supplierId | String? | FK → Supplier | optional |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |

---

### StockItem
Current quantity of a **product at a specific warehouse**. Kept in sync by StockMovement creation inside a `prisma.$transaction`.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| quantity | Int | default 0 | Must never go negative |
| productId | String | FK → Product | |
| warehouseId | String | FK → Warehouse | |
| updatedAt | DateTime | auto | |

**Unique constraint**: `(productId, warehouseId)` — one record per product-warehouse pair.

---

### StockMovement
Immutable audit log of every quantity change. **Never update or delete records.** Use `ADJUSTMENT` type to correct errors.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | String (CUID) | PK | |
| type | MovementType | | INBOUND / OUTBOUND / TRANSFER / ADJUSTMENT |
| quantity | Int | | Always positive; direction inferred from type |
| note | String? | optional | e.g. "PO #1234", "Damaged goods" |
| productId | String | FK → Product | |
| createdById | String | FK → User | Who recorded the movement |
| sourceWarehouseId | String? | optional | Required for OUTBOUND / TRANSFER |
| targetWarehouseId | String? | optional | Required for INBOUND / TRANSFER |
| createdAt | DateTime | auto | Immutable — no updatedAt |

**Movement type field requirements**:

| Type | sourceWarehouseId | targetWarehouseId |
|---|---|---|
| INBOUND | null | required |
| OUTBOUND | required | null |
| TRANSFER | required | required |
| ADJUSTMENT | at least one | at least one |

---

## Enums

### Role
```
ADMIN    — full access, user management, deletions
MANAGER  — CRUD on products/categories/suppliers, stock movements
OPERATOR — create stock movements only
VIEWER   — read-only
```

### MovementType
```
INBOUND    — arrives at warehouse (purchase, return from customer)
OUTBOUND   — leaves warehouse (sale, consumption)
TRANSFER   — moves between warehouses
ADJUSTMENT — manual correction (count discrepancy, damage write-off)
```

---

## Key Design Decisions

1. **StockItem as derived aggregate** — separates current quantity from movement history. Allows querying "how much product X is in warehouse Y" in O(1) without summing all movements.

2. **StockMovement is append-only** — full audit trail; every change is traceable to a user and time. Corrections go through ADJUSTMENT movements.

3. **Soft deletes** — `isActive: false` on User, Supplier, Warehouse, Product. Preserves referential integrity of historical StockMovements.

4. **CUID primary keys** — URL-safe, collision-resistant, no sequential enumeration.

5. **Warehouse IDs on StockMovement as raw Strings** (not Prisma relations) — allows querying movements by warehouse without requiring both source and target to always be set.

---

## Setup Commands

```bash
# 1. Start PostgreSQL
docker compose up postgres -d

# 2. Apply migrations
cd apps/backend
npx prisma migrate dev --name init

# 3. Generate Prisma Client
npx prisma generate

# 4. Seed initial data
npx ts-node prisma/seed.ts

# 5. Open Prisma Studio (visual DB browser)
npx prisma studio
```

## Migration workflow (for future sprints)
```bash
# After changing schema.prisma:
npx prisma migrate dev --name describe_your_change
npx prisma generate
# Commit both the migration files and the updated schema
```
