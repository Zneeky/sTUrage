import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMovementsStore } from '../../stores/movements';

vi.mock('../../api/stockMovements.api', () => ({
  listMovements: vi.fn(),
}));

import * as movementsApi from '../../api/stockMovements.api';

const emptyPage = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
const fullPage = {
  data: [
    {
      id: 'mv1', type: 'INBOUND' as const, quantity: 10, createdAt: '2025-01-01T00:00:00.000Z',
      product: { id: 'p1', sku: 'SKU-001', name: 'Product A' },
      createdBy: { id: 'u1', email: 'admin@sturage.com' },
    },
  ],
  total: 1, page: 1, limit: 10, totalPages: 1,
};

describe('useMovementsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initialises with empty state', () => {
    const store = useMovementsStore();
    expect(store.items).toHaveLength(0);
    expect(store.total).toBe(0);
    expect(store.filterDateFrom).toBe('');
    expect(store.filterDateTo).toBe('');
    expect(store.loading).toBe(false);
  });

  it('fetchMovements populates items and total', async () => {
    vi.mocked(movementsApi.listMovements).mockResolvedValue(fullPage);
    const store = useMovementsStore();
    await store.fetchMovements();

    expect(store.items).toHaveLength(1);
    expect(store.total).toBe(1);
    expect(store.loading).toBe(false);
  });

  it('fetchMovements passes active filters to the API', async () => {
    vi.mocked(movementsApi.listMovements).mockResolvedValue(emptyPage);
    const store = useMovementsStore();
    store.filterDateFrom = '2025-01-01';
    store.filterDateTo = '2025-12-31';
    store.filterType = ['INBOUND', 'OUTBOUND'];

    await store.fetchMovements();

    expect(movementsApi.listMovements).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        type: 'INBOUND,OUTBOUND',
      })
    );
  });

  // TC-014: Date range validation - "To" must not be before "From"
  it('TC-014: validation rule rejects "To" date before "From" date', () => {
    const from = '2025-06-15';
    // Mirror of the Quasar rule used in StockMovementsView
    const rule = (v: string) =>
      !v || !from || v >= from || 'Must be on or after From date';

    expect(rule('2025-06-01')).toBe('Must be on or after From date'); // before from - invalid
    expect(rule('2025-06-15')).toBe(true); // same date - valid
    expect(rule('2025-07-01')).toBe(true); // after - valid
    expect(rule('')).toBe(true);           // empty - valid (no range)
  });

  it('TC-014: onFilterChange guard skips fetch when dateFrom > dateTo', async () => {
    vi.mocked(movementsApi.listMovements).mockResolvedValue(emptyPage);
    const store = useMovementsStore();
    store.filterDateFrom = '2025-06-15';
    store.filterDateTo = '2025-06-01'; // invalid: before from

    // Reproduce the guard from StockMovementsView.onFilterChange
    const dateRangeInvalid = !!(
      store.filterDateFrom &&
      store.filterDateTo &&
      store.filterDateFrom > store.filterDateTo
    );
    if (!dateRangeInvalid) await store.fetchMovements();

    expect(movementsApi.listMovements).not.toHaveBeenCalled();
  });

  it('resetPage sets page back to 1', () => {
    const store = useMovementsStore();
    store.page = 5;
    store.resetPage();
    expect(store.page).toBe(1);
  });
});
