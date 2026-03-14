# API Contract — STURage

> STUR-7 | Sprint 1

## Conventions

- **Base URL**: `http://localhost:3000/api`
- **Auth**: `Authorization: Bearer <jwt_token>` on all protected routes
- **Content-Type**: `application/json`
- **Success envelope**: `{ "data": <T> }`
- **Paginated envelope**: `{ "data": [], "total": 0, "page": 1, "limit": 20, "totalPages": 0 }`
- **Error envelope**: `{ "status": 4xx|5xx, "error": "message", "details": { "field": ["msg"] } }`

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error — see `details` field |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate SKU or email) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limits

| Limiter | Routes | Window | Max |
|---------|--------|--------|-----|
| apiLimiter | All `/api/*` | 15 min | 100 req |
| authLimiter | `/api/auth/login`, `/api/auth/register` | 15 min | 10 req |

Response headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

---

## Health Check

### `GET /health`
No auth required.

**Response 200**
```json
{ "status": "ok", "timestamp": "2026-03-12T10:00:00.000Z" }
```

---

## Auth — `/api/auth`

### `POST /api/auth/register`
Rate-limited (authLimiter). No auth required.

**Request body**
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
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "OPERATOR"
    }
  }
}
```

**Errors**
- `400` — missing fields or password too weak
- `409` — email already registered

---

### `POST /api/auth/login`
Rate-limited (authLimiter). No auth required.

**Request body**
```json
{ "email": "admin@sturage.local", "password": "Admin@123" }
```

**Response 200**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "cuid...", "email": "admin@sturage.local", "role": "ADMIN" }
  }
}
```

**Errors**
- `401` — invalid credentials

---

### `GET /api/auth/me`
Requires auth.

**Response 200**
```json
{
  "data": {
    "id": "cuid...",
    "email": "admin@sturage.local",
    "firstName": "System",
    "lastName": "Admin",
    "role": "ADMIN",
    "createdAt": "2026-03-06T10:00:00.000Z"
  }
}
```

---

### `POST /api/auth/logout`
Requires auth. Client should discard the token — server is stateless.

**Response 200**
```json
{ "data": null, "message": "Logged out" }
```

---

## Products — `/api/products`

All routes require auth.

### `GET /api/products`
**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| search | string | — | Searches name and SKU |
| categoryId | string | — | Filter by category |
| supplierId | string | — | Filter by supplier |
| isActive | boolean | true | Include inactive products |

**Response 200**
```json
{
  "data": [
    {
      "id": "cuid...",
      "sku": "ELEC-001",
      "name": "Laptop 15\"",
      "unit": "pcs",
      "minStock": 5,
      "isActive": true,
      "category": { "id": "cuid...", "name": "Electronics" },
      "supplier": { "id": "cuid...", "name": "TechSupply EOOD" },
      "totalStock": 25
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### `POST /api/products`
**Roles**: ADMIN, MANAGER

**Request body**
```json
{
  "sku": "ELEC-002",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "categoryId": "cuid...",
  "supplierId": "cuid...",
  "unit": "pcs",
  "minStock": 10
}
```

**Response 201** — full product object (same shape as list item)

**Errors**
- `400` — missing required fields
- `409` — SKU already exists

---

### `GET /api/products/:id`
**Response 200**
```json
{
  "data": {
    "id": "cuid...",
    "sku": "ELEC-001",
    "name": "Laptop 15\"",
    "description": "Business laptop",
    "unit": "pcs",
    "minStock": 5,
    "category": { "id": "cuid...", "name": "Electronics" },
    "supplier": { "id": "cuid...", "name": "TechSupply EOOD" },
    "stockItems": [
      { "warehouseId": "cuid...", "warehouseName": "Main Warehouse", "quantity": 20 },
      { "warehouseId": "cuid...", "warehouseName": "Annex Warehouse", "quantity": 5 }
    ],
    "totalStock": 25
  }
}
```

---

### `PUT /api/products/:id`
**Roles**: ADMIN, MANAGER. Partial update — include only fields to change.

**Request body** (all fields optional)
```json
{ "name": "Updated Name", "minStock": 8, "supplierId": "cuid..." }
```

**Response 200** — updated product object

---

### `DELETE /api/products/:id`
**Roles**: ADMIN only. Sets `isActive: false` (soft delete).

**Response 200**
```json
{ "data": null, "message": "Product deactivated" }
```

---

## Categories — `/api/categories`

All routes require auth.

### `GET /api/categories`
**Response 200**
```json
{
  "data": [
    { "id": "cuid...", "name": "Electronics", "description": "...", "productCount": 3 }
  ]
}
```

### `POST /api/categories`
**Roles**: ADMIN, MANAGER

```json
{ "name": "Stationery", "description": "Office supplies" }
```
**Response 201** — created category

### `GET /api/categories/:id`
**Response 200** — single category with `products` array

### `PUT /api/categories/:id`
**Roles**: ADMIN, MANAGER

### `DELETE /api/categories/:id`
**Roles**: ADMIN only. Fails with `409` if category has active products.

---

## Suppliers — `/api/suppliers`

All routes require auth.

### `GET /api/suppliers`
Query: `page`, `limit`, `search`, `isActive`

### `POST /api/suppliers`
**Roles**: ADMIN, MANAGER

```json
{
  "name": "ABC Corp",
  "contactName": "John Smith",
  "email": "john@abc.com",
  "phone": "+1 555 0100",
  "address": "123 Main St"
}
```

### `GET /api/suppliers/:id`
### `PUT /api/suppliers/:id` — ADMIN, MANAGER
### `DELETE /api/suppliers/:id` — ADMIN only (soft delete)

---

## Warehouses — `/api/warehouses`

All routes require auth.

### `GET /api/warehouses`
### `POST /api/warehouses`
**Roles**: ADMIN, MANAGER

```json
{ "name": "Main Warehouse", "location": "Building A, Floor 1", "description": "Primary storage" }
```

### `GET /api/warehouses/:id`
Response includes `inventory` array: `[{ productId, productName, sku, quantity }]`

### `PUT /api/warehouses/:id` — ADMIN, MANAGER
### `DELETE /api/warehouses/:id` — ADMIN only (soft delete)

---

## Stock Movements — `/api/stock-movements`

All routes require auth.

### `GET /api/stock-movements`
**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| page | number | default 1 |
| limit | number | default 20 |
| productId | string | filter by product |
| type | MovementType | INBOUND / OUTBOUND / TRANSFER / ADJUSTMENT |
| warehouseId | string | filter by source or target warehouse |
| from | ISO date | start of date range |
| to | ISO date | end of date range |

**Response 200** — paginated list of movements

### `POST /api/stock-movements`
**Roles**: ADMIN, MANAGER, OPERATOR

**INBOUND**
```json
{
  "type": "INBOUND",
  "productId": "cuid...",
  "quantity": 50,
  "targetWarehouseId": "cuid...",
  "note": "Purchase order PO-2026-001"
}
```

**OUTBOUND**
```json
{
  "type": "OUTBOUND",
  "productId": "cuid...",
  "quantity": 10,
  "sourceWarehouseId": "cuid...",
  "note": "Issued to department"
}
```

**TRANSFER**
```json
{
  "type": "TRANSFER",
  "productId": "cuid...",
  "quantity": 5,
  "sourceWarehouseId": "cuid...",
  "targetWarehouseId": "cuid...",
  "note": "Rebalancing stock"
}
```

**ADJUSTMENT**
```json
{
  "type": "ADJUSTMENT",
  "productId": "cuid...",
  "quantity": -3,
  "sourceWarehouseId": "cuid...",
  "note": "Damaged goods write-off"
}
```

**Response 201**
```json
{
  "data": {
    "id": "cuid...",
    "type": "INBOUND",
    "quantity": 50,
    "note": "Purchase order PO-2026-001",
    "product": { "id": "cuid...", "sku": "ELEC-001", "name": "Laptop 15\"" },
    "createdBy": { "id": "cuid...", "email": "admin@sturage.local" },
    "targetWarehouseId": "cuid...",
    "sourceWarehouseId": null,
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

**Errors**
- `400` — missing required warehouse IDs for given type
- `400` — OUTBOUND/TRANSFER quantity exceeds available stock
- `404` — product or warehouse not found

### `GET /api/stock-movements/:id`
**Response 200** — single movement object

---

## Role Permission Matrix

| Endpoint | VIEWER | OPERATOR | MANAGER | ADMIN |
|----------|--------|----------|---------|-------|
| GET (all lists) | ✓ | ✓ | ✓ | ✓ |
| POST products/categories/suppliers/warehouses | — | — | ✓ | ✓ |
| PUT products/categories/suppliers/warehouses | — | — | ✓ | ✓ |
| DELETE any | — | — | — | ✓ |
| POST stock-movements | — | ✓ | ✓ | ✓ |
