import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listProducts, createProduct, updateProduct, deleteProduct } from '@/api/products.api';
import type { Product, CreateProductDto } from '@/api/products.api';

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const search = ref('');
  const categoryId = ref<string | null>(null);
  const supplierId = ref<string | null>(null);
  const loading = ref(false);

  async function fetchProducts() {
    loading.value = true;
    try {
      const res = await listProducts({
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
        categoryId: categoryId.value || undefined,
        supplierId: supplierId.value || undefined,
      });
      items.value = res.data;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  function resetPage() {
    page.value = 1;
  }

  async function addProduct(data: CreateProductDto) {
    await createProduct(data);
    await fetchProducts();
  }

  async function editProduct(id: string, data: Partial<CreateProductDto>) {
    await updateProduct(id, data);
    await fetchProducts();
  }

  async function removeProduct(id: string) {
    await deleteProduct(id);
    await fetchProducts();
  }

  return { items, total, page, limit, search, categoryId, supplierId, loading, fetchProducts, resetPage, addProduct, editProduct, removeProduct };
});
