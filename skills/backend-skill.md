# Backend Skill — STURage

## Stack
Node.js 20 + Express.js + TypeScript 5 + Prisma 5 + PostgreSQL 16

## Conventions
- Routes in `src/routes/*.routes.ts`
- Middleware in `src/middleware/`
- Controllers in `src/controllers/` (Sprint 2+)
- Services in `src/services/` (Sprint 2+)
- All routes prefixed `/api`
- Auth via JWT Bearer token
- Input validation via express-validator
- Errors: `{ status, error, details? }`

## Security Rules
- Always authenticate protected routes with `authenticate` middleware
- Use `authorize(...roles)` for role-based access
- Never return raw Prisma errors to the client
- Hash passwords with bcryptjs cost factor 10

## Prisma Rules
- Use `prisma.$transaction()` for multi-step operations
- Use `select` or `omit` to exclude `password` from user responses
- Soft delete: set `isActive: false`, never hard delete users/products
