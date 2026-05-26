import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard';

// vi.mock factories are hoisted — no references to outer variables allowed inside them
vi.mock('../../api/products.api', () => ({
  listProducts: vi.fn().mockResolvedValue({ data: [], total: 42, page: 1, limit: 1, totalPages: 42 }),
}));

vi.mock('../../api/stockMovements.api', () => ({
  listMovements: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'mv1', type: 'INBOUND', quantity: 10,
        createdAt: '2025-01-01T10:00:00.000Z',
        product: { id: 'p1', sku: 'SKU-001', name: 'Product A' },
        createdBy: { id: 'u1', email: 'admin@sturage.com' },
      },
      {
        id: 'mv2', type: 'OUTBOUND', quantity: 3,
        createdAt: '2025-01-02T09:00:00.000Z',
        product: { id: 'p2', sku: 'SKU-002', name: 'Product B' },
        createdBy: { id: 'u1', email: 'admin@sturage.com' },
      },
    ],
    total: 7, page: 1, limit: 10, totalPages: 1,
  }),
}));

vi.mock('../../api/reports.api', () => ({
  lowStockReport: vi.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]),
}));

describe('useDashboardStore — TC-020', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts with zero counts and empty recent movements', () => {
    const store = useDashboardStore();
    expect(store.totalProducts).toBe(0);
    expect(store.recentMovements).toHaveLength(0);
    expect(store.lowStockCount).toBe(0);
    expect(store.loading).toBe(false);
  });

  it('TC-020: fetchAll populates recentMovements from the API', async () => {
    const store = useDashboardStore();
    await store.fetchAll();

    expect(store.recentMovements).toHaveLength(2);
    expect(store.recentMovements[0].type).toBe('INBOUND');
    expect(store.recentMovements[1].type).toBe('OUTBOUND');
  });

  it('TC-020: fetchAll sets totalProducts from the products API', async () => {
    const store = useDashboardStore();
    await store.fetchAll();

    expect(store.totalProducts).toBe(42);
  });

  it('fetchAll sets lowStockCount from the low-stock report', async () => {
    const store = useDashboardStore();
    await store.fetchAll();

    expect(store.lowStockCount).toBe(2);
  });

  it('loading is false after fetchAll completes', async () => {
    const store = useDashboardStore();
    const fetchPromise = store.fetchAll();
    expect(store.loading).toBe(true);
    await fetchPromise;
    expect(store.loading).toBe(false);
  });
});
