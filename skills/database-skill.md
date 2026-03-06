# Database Skill — STURage

## Stack
PostgreSQL 16 + Prisma 5

## Schema Location
`apps/backend/prisma/schema.prisma`

## Rules
- Primary keys: `@id @default(cuid())`
- All entities have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Soft deletes via `isActive Boolean @default(true)` — never hard delete
- StockItem has unique constraint `(productId, warehouseId)`
- StockMovement is append-only (no updates, no deletes)
- Use `@@map("snake_case_table_name")` on all models

## Migration Workflow
```bash
npx prisma migrate dev --name <description>
npx prisma generate
npx prisma db seed
```

## Query Rules
- Always `select` only needed fields in queries
- Exclude `password` from all user query responses
- Use `$transaction` for stock movement + stock item updates
- Add `where: { isActive: true }` to all list queries for soft-deleted entities
