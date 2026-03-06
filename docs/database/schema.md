# Database Design — STURage

> STUR-6 | Sprint 1

## Overview

PostgreSQL 16 with Prisma ORM. The schema covers the core inventory domain: users, products, categories, suppliers, warehouses, stock items (current quantity per product per warehouse), and stock movements (audit trail).

## Entity Relationship Summary

```
User ──────────────────────────── StockMovement
                                       │
Category ──── Product ─────────── StockMovement
                  │                    │
Supplier ─────────┘             (source/target warehouse)
                  │
              StockItem
                  │
            Warehouse
```

## Entities

### User
| Field     | Type     | Notes                            |
|-----------|----------|----------------------------------|
| id        | CUID     | Primary key                      |
| email     | String   | Unique                           |
| password  | String   | bcrypt hashed                    |
| firstName | String   |                                  |
| lastName  | String   |                                  |
| role      | Role     | ADMIN, MANAGER, OPERATOR, VIEWER |
| isActive  | Boolean  | Soft delete support              |

### Category
| Field       | Type   | Notes  |
|-------------|--------|--------|
| id          | CUID   | PK     |
| name        | String | Unique |
| description | String | Optional |

### Supplier
| Field       | Type   | Notes    |
|-------------|--------|----------|
| id          | CUID   | PK       |
| name        | String |          |
| contactName | String | Optional |
| email       | String | Optional |
| phone       | String | Optional |
| address     | String | Optional |
| isActive    | Boolean|          |

### Warehouse
| Field       | Type   | Notes    |
|-------------|--------|----------|
| id          | CUID   | PK       |
| name        | String |          |
| location    | String |          |
| description | String | Optional |
| isActive    | Boolean|          |

### Product
| Field       | Type    | Notes                    |
|-------------|---------|--------------------------|
| id          | CUID    | PK                       |
| sku         | String  | Unique                   |
| name        | String  |                          |
| description | String  | Optional                 |
| unit        | String  | Default "pcs"            |
| minStock    | Int     | Low-stock threshold      |
| categoryId  | FK      | → Category               |
| supplierId  | FK?     | → Supplier (optional)    |

### StockItem
Current quantity for a product at a specific warehouse.

| Field       | Type | Notes                       |
|-------------|------|-----------------------------|
| id          | CUID | PK                          |
| productId   | FK   | → Product                   |
| warehouseId | FK   | → Warehouse                 |
| quantity    | Int  | Current stock               |

Unique constraint: `(productId, warehouseId)`

### StockMovement
Immutable audit log of all quantity changes.

| Field             | Type         | Notes                         |
|-------------------|--------------|-------------------------------|
| id                | CUID         | PK                            |
| type              | MovementType | INBOUND/OUTBOUND/TRANSFER/ADJUSTMENT |
| quantity          | Int          |                               |
| note              | String?      |                               |
| productId         | FK           | → Product                     |
| createdById       | FK           | → User                        |
| sourceWarehouseId | String?      | FK for TRANSFER/OUTBOUND      |
| targetWarehouseId | String?      | FK for TRANSFER/INBOUND       |

## Setup Instructions

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start PostgreSQL
docker compose up postgres -d

# 3. Run migrations
cd apps/backend
npm run db:migrate

# 4. Generate Prisma client
npm run db:generate

# 5. Seed initial data
npm run db:seed

# 6. Open Prisma Studio (optional)
npm run db:studio
```
