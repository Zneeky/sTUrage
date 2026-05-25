<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Stock Movements</div>
      <q-space />
      <q-btn
        v-if="canMove"
        label="New Movement"
        icon="add"
        color="primary"
        unelevated
        @click="showForm = true"
      />
    </div>

    <div class="filter-bar q-mb-md">
      <q-select
        v-model="store.filterType"
        :options="typeOptions"
        label="Type"
        outlined dense multiple clearable
        bottom-slots
        style="min-width: 200px;"
        @update:model-value="onFilterChange"
      />
      <q-select
        v-model="store.filterProductId"
        :options="productOptions"
        option-value="id" option-label="name"
        emit-value map-options
        use-input clearable
        label="Product"
        outlined dense
        bottom-slots
        style="min-width: 200px;"
        @filter="filterProducts"
        @update:model-value="onFilterChange"
      />
      <q-input
        v-model="store.filterDateFrom"
        label="From"
        type="date"
        outlined dense bottom-slots
        style="min-width: 160px;"
        @update:model-value="onDateFromChange"
      />
      <q-input
        ref="dateToInput"
        v-model="store.filterDateTo"
        label="To"
        type="date"
        outlined dense bottom-slots
        style="min-width: 160px;"
        :rules="[v => !v || !store.filterDateFrom || v >= store.filterDateFrom || 'Must be on or after From date']"
        @update:model-value="onFilterChange"
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
    >
      <template #body-cell-type="{ value }">
        <q-td><MovementTypeBadge :type="value" /></q-td>
      </template>
      <template #body-cell-qty="{ row }">
        <q-td class="text-right" :class="row.type === 'INBOUND' ? 'text-positive' : row.type === 'OUTBOUND' ? 'text-negative' : ''">
          <span class="text-weight-medium">
            {{ row.type === 'INBOUND' ? '+' : row.type === 'OUTBOUND' ? '-' : '' }}{{ row.quantity }}
          </span>
        </q-td>
      </template>
      <template #body-cell-createdAt="{ value }">
        <q-td>{{ formatDate(value) }}</q-td>
      </template>
    </q-table>

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="store.page"
        :max="Math.ceil(store.total / store.limit) || 1"
        :max-pages="7"
        boundary-numbers
        color="primary"
      />
    </div>

    <MovementFormDialog v-model="showForm" @saved="store.fetchMovements()" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue';
import { QInput } from 'quasar';
import { useMovementsStore } from '@/stores/movements';
import { useAuthStore } from '@/stores/auth';
import { listProducts } from '@/api/products.api';
import MovementTypeBadge from '@/components/MovementTypeBadge.vue';
import MovementFormDialog from '@/components/MovementFormDialog.vue';
import type { StockMovement } from '@/api/stockMovements.api';
import type { Product } from '@/api/products.api';

const store = useMovementsStore();
const authStore = useAuthStore();
const showForm = ref(false);
const productOptions = ref<Product[]>([]);
const dateToInput = ref<InstanceType<typeof QInput> | null>(null);
const canMove = computed(() => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(authStore.user?.role ?? ''));

const typeOptions = ['INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT'];

async function filterProducts(val: string, update: (fn: () => void) => void) {
  const res = await listProducts({ search: val, limit: 20 });
  update(() => { productOptions.value = res.data; });
}

const columns = [
  { name: 'createdAt', label: 'Date',    field: 'createdAt', align: 'left' as const, sortable: true },
  { name: 'product',   label: 'Product', field: (r: StockMovement) => r.product.name, align: 'left' as const },
  { name: 'type',      label: 'Type',    field: 'type',      align: 'left' as const },
  { name: 'qty',       label: 'Qty',     field: 'quantity',  align: 'right' as const },
  { name: 'by',        label: 'By',      field: (r: StockMovement) => r.createdBy.email, align: 'left' as const },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function onDateFromChange() {
  dateToInput.value?.validate();
  onFilterChange();
}

function onFilterChange() {
  const dateRangeInvalid = !!(store.filterDateFrom && store.filterDateTo && store.filterDateFrom > store.filterDateTo);
  if (dateRangeInvalid) return;
  store.resetPage();
  store.fetchMovements();
}

watch(() => store.page, () => store.fetchMovements());
onMounted(() => store.fetchMovements());
</script>
