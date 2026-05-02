<template>
  <q-page>
    <div class="page-title">Reports</div>

    <q-tabs v-model="activeTab" align="left" color="primary" class="q-mb-md">
      <q-tab name="stock"    label="Current Stock"    icon="inventory" />
      <q-tab name="movement" label="Movement Report"  icon="swap_horiz" />
      <q-tab name="lowstock" label="Below Min Stock"  icon="warning" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- Current Stock -->
      <q-tab-panel name="stock" class="q-pa-none">
        <div class="row justify-end q-gutter-sm q-mb-md">
          <q-btn label="PDF"   icon="picture_as_pdf" outline color="negative" size="sm" :loading="downloading.stock_pdf"   @click="download('stock','pdf')" />
          <q-btn label="Excel" icon="table_chart"    outline color="positive" size="sm" :loading="downloading.stock_excel" @click="download('stock','excel')" />
        </div>
        <q-table
          :rows="stockRows"
          :columns="stockColumns"
          row-key="id"
          :loading="loading.stock"
          flat bordered dense
          :rows-per-page-options="[]"
          hide-bottom
        />
      </q-tab-panel>

      <!-- Movement Report -->
      <q-tab-panel name="movement" class="q-pa-none">
        <div class="filter-bar q-mb-md">
          <q-input v-model="dateFrom" label="From" type="date" outlined dense bottom-slots style="min-width:160px;"
            @update:model-value="onDateFromChange"
          />
          <q-input ref="dateToInput" v-model="dateTo" label="To" type="date" outlined dense bottom-slots style="min-width:160px;"
            :rules="[v => !v || !dateFrom || v >= dateFrom || 'Must be on or after From date']"
          />
          <q-btn label="Generate" icon="refresh" color="primary" unelevated :loading="loading.movement" :disable="dateRangeInvalid" @click="loadMovement" />
          <q-space />
          <q-btn label="PDF"   icon="picture_as_pdf" outline color="negative" size="sm" :loading="downloading.movement_pdf"   :disable="dateRangeInvalid" @click="download('movement','pdf')" />
          <q-btn label="Excel" icon="table_chart"    outline color="positive" size="sm" :loading="downloading.movement_excel" :disable="dateRangeInvalid" @click="download('movement','excel')" />
        </div>
        <q-table
          :rows="movementRows"
          :columns="movementColumns"
          row-key="id"
          :loading="loading.movement"
          flat bordered dense
          :rows-per-page-options="[]"
          hide-bottom
        >
          <template #body-cell-type="{ value }">
            <q-td><MovementTypeBadge :type="value" /></q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Low Stock -->
      <q-tab-panel name="lowstock" class="q-pa-none">
        <div class="row justify-end q-gutter-sm q-mb-md">
          <q-btn label="PDF"   icon="picture_as_pdf" outline color="negative" size="sm" :loading="downloading.lowstock_pdf"   @click="download('lowstock','pdf')" />
          <q-btn label="Excel" icon="table_chart"    outline color="positive" size="sm" :loading="downloading.lowstock_excel" @click="download('lowstock','excel')" />
        </div>
        <q-table
          :rows="lowStockRows"
          :columns="stockColumns"
          row-key="id"
          :loading="loading.lowstock"
          flat bordered dense
          :rows-per-page-options="[]"
          hide-bottom
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { QInput } from 'quasar';
import { currentStockReport, movementReport, lowStockReport, downloadBlob } from '@/api/reports.api';
import MovementTypeBadge from '@/components/MovementTypeBadge.vue';

const activeTab = ref('stock');
const dateFrom = ref('');
const dateTo = ref('');
const dateToInput = ref<InstanceType<typeof QInput> | null>(null);
const dateRangeInvalid = computed(() => !!(dateFrom.value && dateTo.value && dateFrom.value > dateTo.value));

function onDateFromChange() {
  dateToInput.value?.validate();
}

const loading = ref({ stock: false, movement: false, lowstock: false });
const downloading = ref({
  stock_pdf: false, stock_excel: false,
  movement_pdf: false, movement_excel: false,
  lowstock_pdf: false, lowstock_excel: false,
});

const stockRows = ref<unknown[]>([]);
const movementRows = ref<unknown[]>([]);
const lowStockRows = ref<unknown[]>([]);

const stockColumns = [
  { name: 'sku',      label: 'SKU',      field: 'sku',      align: 'left' as const },
  { name: 'name',     label: 'Name',     field: 'name',     align: 'left' as const },
  { name: 'category', label: 'Category', field: (r: Record<string, { name: string }>) => r.category?.name, align: 'left' as const },
  { name: 'unit',     label: 'Unit',     field: 'unit',     align: 'left' as const },
  { name: 'minStock', label: 'Min Stock',field: 'minStock', align: 'right' as const },
  { name: 'stock',    label: 'Total Qty',field: (r: Record<string, { quantity: number }[]>) => (r.stockItems as { quantity: number }[])?.reduce((s, i) => s + i.quantity, 0) ?? 0, align: 'right' as const },
];

const movementColumns = [
  { name: 'createdAt', label: 'Date',    field: 'createdAt', align: 'left' as const },
  { name: 'product',   label: 'Product', field: (r: Record<string, { name: string }>) => r.product?.name, align: 'left' as const },
  { name: 'type',      label: 'Type',    field: 'type',      align: 'left' as const },
  { name: 'quantity',  label: 'Qty',     field: 'quantity',  align: 'right' as const },
  { name: 'by',        label: 'By',      field: (r: Record<string, { email: string }>) => r.createdBy?.email, align: 'left' as const },
];

async function loadStock() {
  loading.value.stock = true;
  try { stockRows.value = await currentStockReport('json') as unknown[]; }
  finally { loading.value.stock = false; }
}

async function loadMovement() {
  loading.value.movement = true;
  try { movementRows.value = await movementReport({ format: 'json', dateFrom: dateFrom.value || undefined, dateTo: dateTo.value || undefined }) as unknown[]; }
  finally { loading.value.movement = false; }
}

async function loadLowStock() {
  loading.value.lowstock = true;
  try { lowStockRows.value = await lowStockReport('json') as unknown[]; }
  finally { loading.value.lowstock = false; }
}

async function download(tab: 'stock' | 'movement' | 'lowstock', fmt: 'pdf' | 'excel') {
  const key = `${tab}_${fmt}` as keyof typeof downloading.value;
  downloading.value[key] = true;
  try {
    let blob: Blob;
    const ext = fmt === 'pdf' ? 'pdf' : 'xlsx';
    if (tab === 'stock') {
      blob = await currentStockReport(fmt) as Blob;
      downloadBlob(blob, `Current_Stock.${ext}`);
    } else if (tab === 'movement') {
      blob = await movementReport({ format: fmt, dateFrom: dateFrom.value || undefined, dateTo: dateTo.value || undefined }) as Blob;
      downloadBlob(blob, `Stock_Movements.${ext}`);
    } else {
      blob = await lowStockReport(fmt) as Blob;
      downloadBlob(blob, `Low_Stock.${ext}`);
    }
  } finally {
    downloading.value[key] = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'stock' && !stockRows.value.length) loadStock();
  if (tab === 'lowstock' && !lowStockRows.value.length) loadLowStock();
});

loadStock();
</script>
