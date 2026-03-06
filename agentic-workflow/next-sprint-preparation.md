# Next Sprint Preparation — Sprint 2

## What remains after Sprint 1

### Backend (implement route handlers)
- Auth: register, login, logout, /me with real DB + JWT
- Products CRUD with Prisma
- Categories CRUD
- Suppliers CRUD
- Warehouses CRUD
- Stock Movements: create + automatic StockItem quantity update
- Input validation via express-validator
- Helmet security headers
- Error handler middleware

### Frontend (implement Vue views)
- LoginView — form + Pinia auth store + axios call
- RegisterView — form
- DashboardView — KPI cards + recent movements
- ProductsView — table + search + filters + pagination
- ProductDetailView — detail + stock per warehouse + history
- CategoriesView — table + modal CRUD
- StockMovementsView — table + new movement modal
- ReportsView — stats + date range export

### Database
- Write and run first migration: `prisma migrate dev --name init`
- Verify seed works end-to-end

### Testing
- Backend integration tests per route group
- Frontend component tests with @vue/test-utils

### DevOps
- Add PostgreSQL service to CI job for integration tests
- docker-compose.prod.yml for production deployment
