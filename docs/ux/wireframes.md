# UX Wireframes — STURage (Text Description)

> STUR-8 | Sprint 1 | 8 screens

---

## Screen 1: Login

```
┌─────────────────────────────────────────┐
│              STURage                    │
│       Warehouse Inventory System        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Email                          │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Password                   👁  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [          Log In           ]          │
│                                         │
│  Don't have an account? Register        │
└─────────────────────────────────────────┘
```

**Elements**: Email field, password field with show/hide, login button, link to register.
**Validation**: Inline error messages below each field. Rate limit warning after 5 failed attempts.

---

## Screen 2: Register

```
┌─────────────────────────────────────────┐
│            Create Account               │
│                                         │
│  ┌──────────────┐ ┌──────────────────┐  │
│  │  First Name  │ │    Last Name     │  │
│  └──────────────┘ └──────────────────┘  │
│  ┌─────────────────────────────────┐    │
│  │  Email                          │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Password                       │    │
│  └─────────────────────────────────┘    │
│  [          Create Account  ]           │
│  Already have an account? Login         │
└─────────────────────────────────────────┘
```

**Elements**: First/last name side by side, email, password, submit. Link back to login.

---

## Screen 3: Dashboard

```
┌──────────────────────────────────────────────────────┐
│ 🏭 STURage  │  Dashboard  Products  Stock  Reports  │ [User ▾]
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Products │ │ In Stock │ │ Low Stock│ │Movements│ │
│  │   142    │ │  2,840   │ │    7     │ │   23   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│                                                      │
│  Recent Stock Movements                              │
│  ┌────────────────────────────────────────────────┐  │
│  │ Date     │ Product    │ Type    │ Qty │ User   │  │
│  │ Today    │ Laptop     │ INBOUND │ +50 │ admin  │  │
│  │ Today    │ Mouse      │ OUTBOUND│ -10 │ oper1  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Low Stock Alerts          ⚠                        │
│  • Keyboard — 2 left (min: 10)                      │
│  • USB Hub  — 0 left (min: 5)                       │
└──────────────────────────────────────────────────────┘
```

**Elements**: Top nav, 4 KPI cards, recent movements table, low stock alert list.

---

## Screen 4: Product List

```
┌──────────────────────────────────────────────────────┐
│ Products                            [+ Add Product]  │
├─────────────────────────────────────────────────────┤
│ 🔍 Search...  │ Category ▾ │ Supplier ▾ │ Status ▾  │
├──────────────────────────────────────────────────────┤
│ SKU      │ Name        │ Category   │ Stock │ Actions│
│ ELEC-001 │ Laptop      │ Electronics│  42   │ ✏️ 🗑️  │
│ ELEC-002 │ Mouse       │ Electronics│  150  │ ✏️ 🗑️  │
│ FURN-001 │ Office Chair│ Furniture  │   8 ⚠│ ✏️ 🗑️  │
├──────────────────────────────────────────────────────┤
│  ← 1  2  3 ... →                     20 / page ▾   │
└──────────────────────────────────────────────────────┘
```

**Elements**: Search bar, filter dropdowns (category, supplier, status), sortable table, pagination, add button. Low stock flagged with ⚠.

---

## Screen 5: Product Detail / Edit

```
┌──────────────────────────────────────────────────────┐
│ ← Back  │  Laptop (ELEC-001)             [Edit] [🗑️]│
├──────────────────────────────────────────────────────┤
│ Details               │ Stock per Warehouse           │
│ SKU: ELEC-001         │ Main WH:    42 units          │
│ Category: Electronics │ Annex WH:    8 units          │
│ Supplier: ABC Corp    │ Total:      50 units          │
│ Unit: pcs             │                               │
│ Min Stock: 10         │ [+ Stock Movement]            │
├──────────────────────────────────────────────────────┤
│ Movement History                                      │
│ Date       │ Type    │ Qty  │ Warehouse     │ User    │
│ 2026-04-20 │ INBOUND │ +50  │ Main WH       │ admin   │
│ 2026-04-22 │ OUTBOUND│ -10  │ Main WH       │ oper1   │
└──────────────────────────────────────────────────────┘
```

**Elements**: Product info panel, stock breakdown per warehouse, movement history table, edit & delete actions.

---

## Screen 6: Categories

```
┌──────────────────────────────────────────────────────┐
│ Categories                        [+ Add Category]   │
├──────────────────────────────────────────────────────┤
│ Name           │ Description              │ Actions  │
│ Electronics    │ Electronic devices        │ ✏️ 🗑️   │
│ Furniture      │ Office furniture          │ ✏️ 🗑️   │
│ Stationery     │ Office supplies           │ ✏️ 🗑️   │
└──────────────────────────────────────────────────────┘
│                  [Add / Edit Category modal]         │
│  Name: ________________________                      │
│  Description: __________________                     │
│  [Cancel]  [Save]                                    │
└──────────────────────────────────────────────────────┘
```

**Elements**: Table, inline add/edit via modal, delete with confirmation dialog.

---

## Screen 7: Stock Movements

```
┌──────────────────────────────────────────────────────┐
│ Stock Movements                  [+ New Movement]    │
├──────────────────────────────────────────────────────┤
│ Type ▾ │ Product 🔍 │ From ─── To │ Warehouse ▾     │
├──────────────────────────────────────────────────────┤
│ Date       │ Product  │ Type     │ Qty  │ WH     │ By│
│ 2026-04-25 │ Laptop   │ INBOUND  │ +50  │ Main   │ admin│
│ 2026-04-25 │ Mouse    │ OUTBOUND │ -10  │ Main   │ oper1│
│ 2026-04-24 │ Keyboard │ TRANSFER │ +5   │ Annex  │ admin│
├──────────────────────────────────────────────────────┤
│  ← 1  2  3 ... →                                    │
└──────────────────────────────────────────────────────┘
```

**New Movement Modal**:
```
Type: [INBOUND ▾]   Product: [Search...]
Qty: [___]          Warehouse: [Select...]
Note: [______________]
[Cancel]  [Submit]
```

**Elements**: Filterable log table, new movement modal with type-aware fields (TRANSFER shows source + target).

---

## Screen 8: Reports / Settings

```
┌──────────────────────────────────────────────────────┐
│ Reports                                              │
├────────────────────────┬─────────────────────────────┤
│ 📊 Inventory Summary   │ Export                      │
│ Total products: 142    │ [📥 Export CSV]              │
│ Total units: 2,840     │ [📥 Export PDF]              │
│ Low stock items: 7     │                             │
│                        │ Date range:                 │
│ 📦 Movement Summary    │ From: [____] To: [____]     │
│ This month: 23 moves   │ [Generate Report]           │
│ Inbound:  +1,200       │                             │
│ Outbound: -380         │                             │
│ Transfers: 12          │                             │
├────────────────────────┴─────────────────────────────┤
│ ⚙ Settings (ADMIN only)                              │
│ Manage Users  │  Warehouses  │  API Rate Limits      │
└──────────────────────────────────────────────────────┘
```

**Elements**: Summary stats, date-range export (CSV/PDF), admin-only settings panel.
