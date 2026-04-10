<template>
  <q-table
    :rows="movements"
    :columns="columns"
    row-key="id"
    :loading="loading"
    flat
    bordered
    dense
    :rows-per-page-options="[]"
    hide-bottom
  >
    <template #body-cell-type="{ value }">
      <q-td>
        <MovementTypeBadge :type="value" />
      </q-td>
    </template>
    <template #body-cell-qty="{ row }">
      <q-td :class="row.type === 'INBOUND' ? 'text-positive' : row.type === 'OUTBOUND' ? 'text-negative' : ''">
        <span class="text-weight-medium">
          {{ row.type === 'INBOUND' ? '+' : row.type === 'OUTBOUND' ? '-' : '' }}{{ row.quantity }}
        </span>
      </q-td>
    </template>
    <template #body-cell-createdAt="{ value }">
      <q-td>{{ formatDate(value) }}</q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { StockMovement } from '@/api/stockMovements.api';
import MovementTypeBadge from './MovementTypeBadge.vue';

defineProps<{
  movements: StockMovement[];
  loading?: boolean;
}>();

const columns = [
  { name: 'createdAt', label: 'Date', field: 'createdAt', align: 'left' as const, sortable: true },
  { name: 'product',   label: 'Product', field: (r: StockMovement) => r.product.name, align: 'left' as const },
  { name: 'type',      label: 'Type',    field: 'type',     align: 'left' as const },
  { name: 'qty',       label: 'Qty',     field: 'quantity', align: 'right' as const },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>
