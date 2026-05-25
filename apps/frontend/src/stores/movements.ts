import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listMovements } from '@/api/stockMovements.api';
import type { StockMovement } from '@/api/stockMovements.api';

export const useMovementsStore = defineStore('movements', () => {
  const items = ref<StockMovement[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const loading = ref(false);
  const filterType = ref<string[]>([]);
  const filterProductId = ref<string | null>(null);
  const filterDateFrom = ref('');
  const filterDateTo = ref('');

  async function fetchMovements() {
    loading.value = true;
    try {
      const res = await listMovements({
        page: page.value,
        limit: limit.value,
        type: filterType.value.length === 1 ? filterType.value[0] : undefined,
        productId: filterProductId.value || undefined,
        dateFrom: filterDateFrom.value || undefined,
        dateTo: filterDateTo.value || undefined,
      });
      items.value = res.data;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  function resetPage() { page.value = 1; }

  return { items, total, page, limit, loading, filterType, filterProductId, filterDateFrom, filterDateTo, fetchMovements, resetPage };
});
