import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listProducts } from '@/api/products.api';
import { listMovements } from '@/api/stockMovements.api';
import { lowStockReport } from '@/api/reports.api';
import type { StockMovement } from '@/api/stockMovements.api';

export const useDashboardStore = defineStore('dashboard', () => {
  const totalProducts = ref(0);
  const lowStockCount = ref(0);
  const todayMovementsCount = ref(0);
  const recentMovements = ref<StockMovement[]>([]);
  const lowStockItems = ref<unknown[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const today = new Date().toISOString().split('T')[0];
      const [productsRes, movementsRes, lowStockRes, todayRes] = await Promise.all([
        listProducts({ limit: 1 }),
        listMovements({ limit: 10 }),
        lowStockReport('json'),
        listMovements({ limit: 1, dateFrom: today, dateTo: today }),
      ]);
      totalProducts.value = productsRes.total;
      recentMovements.value = movementsRes.data;
      lowStockItems.value = lowStockRes as unknown[];
      lowStockCount.value = (lowStockRes as unknown[]).length;
      todayMovementsCount.value = (todayRes as { total: number }).total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  return { totalProducts, lowStockCount, todayMovementsCount, recentMovements, lowStockItems, loading, fetchAll };
});
