# UX Wireframes — STURage

> STUR-8 | Sprint 1
> 8 screens, text-based wireframes. Vue component names are noted for Sprint 2 implementation.

---

## Navigation Structure

```
Public:
  /login         → LoginView.vue
  /register      → RegisterView.vue

Protected (requires auth):
  /dashboard              → DashboardView.vue
  /products               → ProductsView.vue
  /products/:id           → ProductDetailView.vue
  /categories             → CategoriesView.vue
  /stock-movements        → StockMovementsView.vue
  /reports                → ReportsView.vue
```

Global layout (all protected pages):
- Top navigation bar with app logo, nav links, user menu
- Breadcrumb below nav
- Main content area
- Toast notification area (top-right)

---

## Screen 1 — Login (`/login`)

**Component**: `LoginView.vue`
**Auth**: Public

```
┌──────────────────────────────────────┐
│                                      │
│          🏭  STURage                 │
│    Система за складова наличност     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Email address                 │  │
│  └────────────────────────────────┘  │
│  ┌─────────────────────────────👁─┐  │
│  │  Password                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ⚠  Invalid email or password        │  ← shown on 401
│                                      │
│  [        Log In        ]            │
│                                      │
│  Don't have an account?  Register →  │
└──────────────────────────────────────┘
```

**Behaviour**:
- On submit: `POST /api/auth/login` → save token to Pinia auth store + localStorage → redirect to `/dashboard`
- Eye icon toggles password visibility
- Show inline error on 401 (do not distinguish email vs password for security)
- Show rate limit warning after 5 failed attempts: "Too many attempts — try again in 15 minutes"
- Redirect to `/dashboard` if already authenticated

---

## Screen 2 — Register (`/register`)

**Component**: `RegisterView.vue`
**Auth**: Public

```
┌──────────────────────────────────────┐
│         Create Account               │
│                                      │
│  ┌──────────────┐ ┌───────────────┐  │
│  │  First name  │ │  Last name    │  │
│  └──────────────┘ └───────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Email address                 │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Password                   👁 │  │
│  └────────────────────────────────┘  │
│  Password must be 8+ chars, 1 number │
│  and 1 special character             │
│                                      │
│  [     Create Account    ]           │
│                                      │
│  Already have an account?  Login →   │
└──────────────────────────────────────┘
```

**Behaviour**:
- On submit: `POST /api/auth/register` → save token → redirect to `/dashboard`
- Show field-level validation errors from API `details` object
- 409 conflict: "This email is already registered"

---

## Screen 3 — Dashboard (`/dashboard`)

**Component**: `DashboardView.vue`
**Auth**: All roles

```
┌──────────────────────────────────────────────────────────────┐
│ 🏭 STURage │ Dashboard  Products  Stock  Reports     [User▾] │
├──────────────────────────────────────────────────────────────┤
│  Dashboard                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Products │  │ In Stock │  │ Low Stock │  │Movements  │  │
│  │   142    │  │  2,840   │  │    7  ⚠  │  │  today: 5 │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────┘  │
│                                                              │
│  Recent Movements (last 10)                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Date/Time   Product      Type      Qty   By          │   │
│  │ 12 Mar 10h  Laptop 15"   INBOUND   +50   admin       │   │
│  │ 12 Mar 09h  Office Chair INBOUND   +10   admin       │   │
│  │ ...                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚠ Low Stock Alerts                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Keyboard — 2 units  (min: 10)  [View Product]      │   │
│  │ • USB Hub  — 0 units  (min: 5)   [View Product]      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Data sources**:
- KPI cards: `GET /api/products?limit=1` (total), `GET /api/stock-movements?limit=10` (recent)
- Low stock: products where totalStock < minStock

---

## Screen 4 — Product List (`/products`)

**Component**: `ProductsView.vue`
**Auth**: All roles (ADMIN/MANAGER see edit/delete actions)

```
┌──────────────────────────────────────────────────────────────┐
│  Products                             [+ Add Product]        │
├──────────────────────────────────────────────────────────────┤
│  🔍 Search name or SKU...  │ Category ▾ │ Supplier ▾        │
├──────────────────────────────────────────────────────────────┤
│  SKU       Name             Category      Stock    Actions   │
│  ─────────────────────────────────────────────────────────   │
│  ELEC-001  Laptop 15"       Electronics   25 pcs   [✏][🗑]  │
│  ELEC-002  Wireless Mouse   Electronics   80 pcs   [✏][🗑]  │
│  FURN-001  Office Chair     Furniture      8 pcs ⚠ [✏][🗑]  │
├──────────────────────────────────────────────────────────────┤
│  Showing 1–20 of 142    [← Prev]  Page 1 of 8  [Next →]    │
└──────────────────────────────────────────────────────────────┘
```

**Behaviour**:
- ⚠ badge when `totalStock < minStock`
- Search is debounced 300ms → updates `?search=` query param
- Filters update URL params so state is bookmarkable
- [✏] → navigates to `/products/:id`
- [🗑] → confirmation dialog → `DELETE /api/products/:id` → soft delete
- [+ Add Product] → opens Add Product modal (or separate route in Sprint 2)

---

## Screen 5 — Product Detail / Edit (`/products/:id`)

**Component**: `ProductDetailView.vue`
**Auth**: All roles (edit actions for ADMIN/MANAGER only)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Products                          [Edit] [Delete] │
├────────────────────────────┬─────────────────────────────────┤
│  ELEC-001 — Laptop 15"     │  Stock by Warehouse             │
│                            │  ┌─────────────────────────┐   │
│  Category:  Electronics    │  │ Main Warehouse   20 pcs  │   │
│  Supplier:  TechSupply     │  │ Annex Warehouse   5 pcs  │   │
│  Unit:      pcs            │  │ ─────────────────────    │   │
│  Min stock: 5              │  │ Total            25 pcs  │   │
│  Status:    Active         │  └─────────────────────────┘   │
│                            │                                 │
│  Description:              │  [+ New Stock Movement]         │
│  Business laptop, 15 inch  │                                 │
├────────────────────────────┴─────────────────────────────────┤
│  Movement History                                            │
│  Date/Time     Type      Qty   Warehouse     Note     By    │
│  12 Mar 10:00  INBOUND   +20   Main WH       PO-001   admin │
│  12 Mar 10:00  INBOUND   +5    Annex WH      PO-001   admin │
│  ...                                                         │
│  [← Prev]   Page 1 of 3   [Next →]                         │
└──────────────────────────────────────────────────────────────┘
```

**Behaviour**:
- [Edit] → inline form replaces the detail card (or modal)
- [Delete] → confirmation → `DELETE /api/products/:id` → redirect to list
- [+ New Stock Movement] → opens New Movement modal pre-filled with this product
- Movement history: `GET /api/stock-movements?productId=:id`

---

## Screen 6 — Categories (`/categories`)

**Component**: `CategoriesView.vue`
**Auth**: All roles (write actions for ADMIN/MANAGER)

```
┌──────────────────────────────────────────────────────────────┐
│  Categories                           [+ Add Category]       │
├──────────────────────────────────────────────────────────────┤
│  Name            Description               Products  Actions │
│  ──────────────────────────────────────────────────────────  │
│  Electronics     Electronic devices           42    [✏][🗑] │
│  Furniture       Office furniture              8    [✏][🗑] │
│  Stationery      Office supplies              15    [✏][🗑] │
└──────────────────────────────────────────────────────────────┘

Add / Edit Category (modal):
┌──────────────────────────────────┐
│  Add Category                 ✕  │
│                                  │
│  Name *                          │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  Description                     │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  [Cancel]          [Save]        │
└──────────────────────────────────┘
```

**Behaviour**:
- [🗑] disabled with tooltip if category has active products
- Add/Edit via modal overlay — no page navigation needed

---

## Screen 7 — Stock Movements (`/stock-movements`)

**Component**: `StockMovementsView.vue`
**Auth**: All roles (OPERATOR/MANAGER/ADMIN can create; VIEWER read-only)

```
┌──────────────────────────────────────────────────────────────┐
│  Stock Movements                     [+ New Movement]        │
├──────────────────────────────────────────────────────────────┤
│  Type ▾ │ 🔍 Product... │ Warehouse ▾ │ From [──] To [──]   │
├──────────────────────────────────────────────────────────────┤
│  Date/Time   Product      Type      Qty   Warehouse   By     │
│  ──────────────────────────────────────────────────────────  │
│  14 Mar 11h  Laptop 15"   INBOUND   +50   Main WH    admin  │
│  14 Mar 10h  Office Chair OUTBOUND  -2    Main WH    oper1  │
│  13 Mar 14h  Laptop 15"   TRANSFER  →5    Annex WH   admin  │
│  12 Mar 09h  USB Hub      ADJUSTMENT -3   Main WH    admin  │
├──────────────────────────────────────────────────────────────┤
│  [← Prev]  Page 1 of 12  [Next →]                           │
└──────────────────────────────────────────────────────────────┘

New Movement (modal):
┌──────────────────────────────────────────┐
│  New Stock Movement                   ✕  │
│                                          │
│  Type *  [INBOUND ▾]                    │
│                                          │
│  Product *  [Search product...]          │
│                                          │
│  Quantity *  [____]  pcs                 │
│                                          │
│  Target Warehouse *  [Select...]         │  ← INBOUND
│  Source Warehouse *  [Select...]         │  ← OUTBOUND
│  Source → Target  [Select] → [Select]   │  ← TRANSFER
│                                          │
│  Note (optional)                         │
│  [__________________________________]    │
│                                          │
│  [Cancel]              [Submit]          │
└──────────────────────────────────────────┘
```

**Behaviour**:
- Warehouse fields change based on selected Type
- Quantity validated against available stock on OUTBOUND/TRANSFER before submit
- TRANSFER shows both source and target warehouse selects

---

## Screen 8 — Reports (`/reports`)

**Component**: `ReportsView.vue`
**Auth**: All roles (Settings panel ADMIN only)

```
┌──────────────────────────────────────────────────────────────┐
│  Reports & Settings                                          │
├─────────────────────────────┬────────────────────────────────┤
│  📊 Inventory Summary       │  Export                        │
│                             │                                │
│  Total active products: 142 │  Date range                    │
│  Total stock units: 2,840   │  From [2026-03-01]             │
│  Low stock items:   7       │  To   [2026-03-31]             │
│  Inactive products: 3       │                                │
│                             │  [📥 Export CSV]               │
│  📦 Movement Summary        │  [📥 Export PDF]               │
│  (current month)            │                                │
│  Inbound:   +1,200 units    │  [Generate Report]             │
│  Outbound:    -380 units    │                                │
│  Transfers:    12 moves     │                                │
│  Adjustments:  -8 units     │                                │
├─────────────────────────────┴────────────────────────────────┤
│  ⚙ Settings  (visible to ADMIN only)                        │
│                                                              │
│  User Management      [View Users]                          │
│  Warehouses           [Manage Warehouses]                   │
│  Rate Limit Config    Window: 15 min  Max: 100 req          │
└──────────────────────────────────────────────────────────────┘
```

**Behaviour**:
- Date range defaults to current month
- Export buttons call future `/api/reports/export?format=csv&from=&to=` endpoint (Sprint 3)
- Settings panel hidden for non-ADMIN users via `v-if="authStore.user?.role === 'ADMIN'"`
