<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="arrow_back" class="q-mr-sm" to="/products" />
      <div class="page-title q-mb-none">{{ product?.name ?? 'Product Detail' }}</div>
      <q-space />
      <template v-if="product">
        <q-btn v-if="canEdit" label="Edit" icon="edit" outline color="primary" class="q-mr-sm" @click="showEdit = true" />
        <q-btn v-if="canDelete" label="Delete" icon="delete" outline color="negative" @click="confirmDelete" />
      </template>
    </div>

    <div v-if="loading" class="text-center q-pa-xl"><q-spinner size="40px" color="primary" /></div>

    <div v-else-if="product" class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Product Info</div>
            <q-list dense>
              <q-item><q-item-section><q-item-label caption>SKU</q-item-label><q-item-label>{{ product.sku }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Category</q-item-label><q-item-label>{{ product.category.name }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Supplier</q-item-label><q-item-label>{{ product.supplier?.name ?? '—' }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Unit</q-item-label><q-item-label>{{ product.unit }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Min Stock</q-item-label><q-item-label>{{ product.minStock }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Status</q-item-label>
                <q-item-label><q-badge :color="product.isActive ? 'positive' : 'grey'" :label="product.isActive ? 'Active' : 'Inactive'" /></q-item-label>
              </q-item-section></q-item>
              <q-item v-if="product.description"><q-item-section><q-item-label caption>Description</q-item-label><q-item-label>{{ product.description }}</q-item-label></q-item-section></q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-md-7">
        <q-card flat bordered>
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="text-subtitle1 text-weight-medium">Stock by Warehouse</div>
              <q-space />
              <q-btn
                v-if="canMove"
                label="New Movement"
                icon="add"
                color="primary"
                size="sm"
                unelevated
                @click="showMovement = true"
              />
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <q-table
              :rows="stockRows"
              :columns="stockColumns"
              row-key="warehouse"
              flat dense hide-bottom
              :rows-per-page-options="[]"
            >
              <template #body-cell-qty="{ row }">
                <q-td>
                  <StockBadge :quantity="row.quantity" :min-stock="product.minStock" />
                </q-td>
              </template>
            </q-table>
            <div class="row justify-end q-mt-sm q-pr-sm text-weight-medium">
              Total: {{ totalStock }}
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-medium">Movement History</div>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <MovementsTable :movements="movements" :loading="movementsLoading" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <ProductFormDialog v-model="showEdit" :product="product" @saved="loadProduct" />
    <MovementFormDialog v-if="product" v-model="showMovement" :product-id="product.id" @saved="loadProduct" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getProduct, deleteProduct } from '@/api/products.api';
import { listMovements } from '@/api/stockMovements.api';
import { useAuthStore } from '@/stores/auth';
import StockBadge from '@/components/StockBadge.vue';
import MovementsTable from '@/components/MovementsTable.vue';
import ProductFormDialog from '@/components/ProductFormDialog.vue';
import MovementFormDialog from '@/components/MovementFormDialog.vue';
import type { Product } from '@/api/products.api';
import type { StockMovement } from '@/api/stockMovements.api';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const movements = ref<StockMovement[]>([]);
const loading = ref(false);
const movementsLoading = ref(false);
const showEdit = ref(false);
const showMovement = ref(false);

const canEdit = computed(() => ['ADMIN', 'MANAGER'].includes(authStore.user?.role ?? ''));
const canDelete = computed(() => authStore.user?.role === 'ADMIN');
const canMove = computed(() => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(authStore.user?.role ?? ''));

const stockColumns = [
  { name: 'warehouse', label: 'Warehouse', field: 'warehouse', align: 'left' as const },
  { name: 'qty',       label: 'Quantity',  field: 'quantity',  align: 'right' as const },
];

const stockRows = computed(() =>
  product.value?.stockItems.map(si => ({ warehouse: si.warehouse.name, quantity: si.quantity })) ?? []
);

const totalStock = computed(() =>
  product.value?.stockItems.reduce((s, si) => s + si.quantity, 0) ?? 0
);

async function loadProduct() {
  loading.value = true;
  movementsLoading.value = true;
  try {
    const id = route.params.id as string;
    [product.value] = await Promise.all([getProduct(id)]);
    const res = await listMovements({ productId: id, limit: 20 });
    movements.value = res.data;
  } finally {
    loading.value = false;
    movementsLoading.value = false;
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Delete Product',
    message: `Delete "${product.value?.name}"? This cannot be undone.`,
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    await deleteProduct(product.value!.id);
    router.push('/products');
  });
}

onMounted(loadProduct);
</script>
