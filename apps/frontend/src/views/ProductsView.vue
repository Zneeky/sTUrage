<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Products</div>
      <q-space />
      <q-btn
        v-if="canEdit"
        label="Add Product"
        icon="add"
        color="primary"
        unelevated
        @click="openForm(null)"
      />
    </div>

    <div class="filter-bar q-mb-md">
      <q-input
        v-model="searchInput"
        placeholder="Search name or SKU…"
        outlined dense clearable
        style="min-width: 220px;"
        debounce="300"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select
        v-model="selectedCategory"
        :options="categories"
        option-value="id" option-label="name"
        emit-value map-options
        label="Category" outlined dense clearable
        style="min-width: 180px;"
      />
      <q-select
        v-model="selectedSupplier"
        :options="suppliers"
        option-value="id" option-label="name"
        emit-value map-options
        label="Supplier" outlined dense clearable
        style="min-width: 180px;"
      />
    </div>

    <q-table
      :rows="store.items"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      flat bordered
      :rows-per-page-options="[]"
      hide-bottom
      :row-class="rowClass"
    >
      <template #body-cell-stock="{ row }">
        <q-td>
          <StockBadge
            :quantity="totalStock(row)"
            :min-stock="row.minStock"
          />
        </q-td>
      </template>
      <template #body-cell-actions="{ row }">
        <q-td class="text-right">
          <q-btn flat round dense icon="visibility" size="sm" :to="`/products/${row.id}`" />
          <template v-if="canEdit">
            <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openForm(row)" />
            <q-btn flat round dense icon="delete" size="sm" color="negative" @click="confirmDelete(row)" />
          </template>
        </q-td>
      </template>
    </q-table>

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="store.page"
        :max="Math.ceil(store.total / store.limit)"
        :max-pages="7"
        boundary-numbers
        color="primary"
      />
    </div>

    <ProductFormDialog
      v-model="showForm"
      :product="selectedProduct"
      @saved="store.fetchProducts()"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useProductsStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';
import { listCategories } from '@/api/categories.api';
import { listSuppliers } from '@/api/suppliers.api';
import StockBadge from '@/components/StockBadge.vue';
import ProductFormDialog from '@/components/ProductFormDialog.vue';
import type { Product } from '@/api/products.api';
import type { Category } from '@/api/categories.api';
import type { Supplier } from '@/api/suppliers.api';

const $q = useQuasar();
const store = useProductsStore();
const authStore = useAuthStore();
const canEdit = computed(() => ['ADMIN', 'MANAGER'].includes(authStore.user?.role ?? ''));

const categories = ref<Category[]>([]);
const suppliers = ref<Supplier[]>([]);
const searchInput = ref('');
const selectedCategory = ref<string | null>(null);
const selectedSupplier = ref<string | null>(null);
const showForm = ref(false);
const selectedProduct = ref<Product | null>(null);

const columns = [
  { name: 'sku',      label: 'SKU',      field: 'sku',      align: 'left' as const, sortable: true },
  { name: 'name',     label: 'Name',     field: 'name',     align: 'left' as const, sortable: true },
  { name: 'category', label: 'Category', field: (r: Product) => r.category.name, align: 'left' as const },
  { name: 'supplier', label: 'Supplier', field: (r: Product) => r.supplier?.name ?? '—', align: 'left' as const },
  { name: 'stock',    label: 'Stock',    field: 'stockItems', align: 'center' as const },
  { name: 'actions',  label: '',         field: 'id',        align: 'right' as const },
];

function totalStock(p: Product) {
  return p.stockItems.reduce((s, si) => s + si.quantity, 0);
}

function rowClass(row: Product) {
  return totalStock(row) < row.minStock ? 'bg-orange-1' : '';
}

watch(searchInput, (v) => { store.search = v; store.resetPage(); store.fetchProducts(); });
watch(selectedCategory, (v) => { store.categoryId = v; store.resetPage(); store.fetchProducts(); });
watch(selectedSupplier, (v) => { store.supplierId = v; store.resetPage(); store.fetchProducts(); });
watch(() => store.page, () => store.fetchProducts());

onMounted(async () => {
  [categories.value, suppliers.value] = await Promise.all([listCategories(), listSuppliers()]);
  store.fetchProducts();
});

function openForm(product: Product | null) {
  selectedProduct.value = product;
  showForm.value = true;
}

function confirmDelete(product: Product) {
  $q.dialog({
    title: 'Delete Product',
    message: `Delete "${product.name}"? This cannot be undone.`,
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    try {
      await store.removeProduct(product.id);
      $q.notify({ type: 'positive', message: 'Product deleted' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to delete product' });
    }
  });
}
</script>
