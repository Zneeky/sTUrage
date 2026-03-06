# API Contract — STURage

> STUR-7 | Sprint 1

Base URL: `http://localhost:3000/api`

All responses follow:
```json
{ "data": {}, "message": "optional" }
```

Errors:
```json
{ "status": 400, "error": "message", "details": { "field": ["error"] } }
```

---

## Authentication

### POST /api/auth/register
Register a new user.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Secure@123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```
**Response 201**
```json
{ "data": { "token": "jwt...", "user": { "id": "...", "email": "...", "role": "OPERATOR" } } }
```

**Errors**: 400 validation, 409 email exists

---

### POST /api/auth/login
```json
{ "email": "admin@sturage.local", "password": "Admin@123" }
```
**Response 200**
```json
{ "data": { "token": "jwt...", "user": { "id": "...", "email": "...", "role": "ADMIN" } } }
```
**Errors**: 401 invalid credentials

---

### GET /api/auth/me
**Headers**: `Authorization: Bearer <token>`

**Response 200**
```json
{ "data": { "id": "...", "email": "...", "firstName": "Jane", "lastName": "Doe", "role": "OPERATOR" } }
```

---

## Products

All product routes require `Authorization: Bearer <token>`.

### GET /api/products
Query params: `page=1`, `limit=20`, `search=`, `categoryId=`, `supplierId=`

**Response 200**
```json
{
  "data": [{ "id": "...", "sku": "ELEC-001", "name": "...", "category": {}, "currentStock": 42 }],
  "total": 100, "page": 1, "limit": 20, "totalPages": 5
}
```

### POST /api/products
**Roles**: ADMIN, MANAGER

```json
{ "sku": "ELEC-002", "name": "Laptop", "categoryId": "...", "supplierId": "...", "unit": "pcs", "minStock": 5 }
```
**Response 201** — full product object

### GET /api/products/:id
**Response 200** — product + stockItems per warehouse

### PUT /api/products/:id
**Roles**: ADMIN, MANAGER — partial update, same body shape as POST

### DELETE /api/products/:id
**Roles**: ADMIN only — soft delete (`isActive: false`)

---

## Categories

### GET /api/categories
**Response 200** — array of categories

### POST /api/categories
**Roles**: ADMIN, MANAGER
```json
{ "name": "Electronics", "description": "..." }
```

### GET /api/categories/:id
### PUT /api/categories/:id
### DELETE /api/categories/:id — ADMIN only

---

## Suppliers

### GET /api/suppliers
### POST /api/suppliers
```json
{ "name": "ABC Corp", "contactName": "John", "email": "john@abc.com", "phone": "+1234", "address": "..." }
```
### GET /api/suppliers/:id
### PUT /api/suppliers/:id
### DELETE /api/suppliers/:id — ADMIN only

---

## Warehouses

### GET /api/warehouses
### POST /api/warehouses
```json
{ "name": "Main Warehouse", "location": "Building A, Floor 1", "description": "..." }
```
### GET /api/warehouses/:id
### PUT /api/warehouses/:id
### DELETE /api/warehouses/:id — ADMIN only

---

## Stock Movements

### GET /api/stock-movements
Query: `productId=`, `type=INBOUND|OUTBOUND|TRANSFER|ADJUSTMENT`, `from=`, `to=`, `page=`, `limit=`

**Response 200** — paginated movements list

### POST /api/stock-movements
**Roles**: ADMIN, MANAGER, OPERATOR

```json
{
  "type": "INBOUND",
  "productId": "...",
  "quantity": 50,
  "targetWarehouseId": "...",
  "note": "Purchase order #123"
}
```

For `TRANSFER`:
```json
{
  "type": "TRANSFER",
  "productId": "...",
  "quantity": 10,
  "sourceWarehouseId": "...",
  "targetWarehouseId": "...",
  "note": "Transfer to warehouse B"
}
```

**Response 201** — created movement object

### GET /api/stock-movements/:id

---

## HTTP Status Codes

| Code | Meaning                        |
|------|--------------------------------|
| 200  | OK                             |
| 201  | Created                        |
| 400  | Validation error               |
| 401  | Unauthenticated                |
| 403  | Forbidden (insufficient role)  |
| 404  | Not found                      |
| 409  | Conflict (duplicate)           |
| 429  | Rate limit exceeded            |
| 500  | Internal server error          |

---

## Rate Limits

- Global API: 100 requests / 15 minutes
- Auth endpoints: 10 requests / 15 minutes
- Headers returned: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
