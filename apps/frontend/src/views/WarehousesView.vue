<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Warehouses</div>
      <q-space />
      <q-btn
        v-if="canEdit"
        label="Add Warehouse"
        icon="add"
        color="primary"
        unelevated
        @click="openForm(null)"
      />
    </div>

    <q-table
      :rows="warehouses"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :rows-per-page-options="[]"
      hide-bottom
    >
      <template #body-cell-status="{ row }">
        <q-td>
          <span :class="row.isActive ? 'badge-soft badge-soft--green' : 'badge-soft badge-soft--gray'">
            {{ row.isActive ? 'Active' : 'Inactive' }}
          </span>
        </q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-td class="text-right">
          <template v-if="canEdit">
            <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openForm(row)" />
            <q-btn
              v-if="canDelete"
              flat round dense icon="delete" size="sm" color="negative"
              @click="confirmDelete(row)"
            />
          </template>
        </q-td>
      </template>
    </q-table>

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="page"
        :max="Math.ceil(total / limit) || 1"
        :max-pages="7"
        boundary-numbers
        color="primary"
      />
    </div>

    <WarehouseFormDialog v-model="showForm" :warehouse="selected" @saved="load" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listWarehousesPaginated, deleteWarehouse } from '@/api/warehouses.api';
import { useAuthStore } from '@/stores/auth';
import WarehouseFormDialog from '@/components/WarehouseFormDialog.vue';
import type { Warehouse } from '@/api/warehouses.api';

const $q = useQuasar();
const authStore = useAuthStore();
const canEdit   = computed(() => ['ADMIN', 'MANAGER'].includes(authStore.user?.role ?? ''));
const canDelete = computed(() => authStore.user?.role === 'ADMIN');

const warehouses = ref<Warehouse[]>([]);
const page  = ref(1);
const limit = ref(10);
const total = ref(0);
const loading  = ref(false);
const showForm = ref(false);
const selected = ref<Warehouse | null>(null);

const columns = [
  { name: 'name',        label: 'Name',        field: 'name',        align: 'left' as const, sortable: true },
  { name: 'location',    label: 'Location',    field: 'location',    align: 'left' as const },
  { name: 'description', label: 'Description', field: (r: Warehouse) => r.description ?? '-', align: 'left' as const },
  { name: 'status',      label: 'Status',      field: 'isActive',    align: 'left' as const },
  { name: 'actions',     label: '',            field: 'id',          align: 'right' as const },
];

async function load() {
  loading.value = true;
  try {
    const res = await listWarehousesPaginated({ page: page.value, limit: limit.value });
    warehouses.value = res.data;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

watch(page, load);

function openForm(w: Warehouse | null) {
  selected.value = w;
  showForm.value = true;
}

function confirmDelete(w: Warehouse) {
  $q.dialog({
    title: 'Deactivate Warehouse',
    message: `Deactivate "${w.name}"? This will make it unavailable for new stock movements.`,
    ok:     { label: 'Deactivate', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    try {
      await deleteWarehouse(w.id);
      $q.notify({ type: 'positive', message: 'Warehouse deactivated' });
      page.value = 1;
      await load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      const msg    = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      $q.notify({
        type: 'warning',
        message: status === 409
          ? 'Cannot deactivate: warehouse still has active stock items'
          : (msg ?? 'Failed to deactivate warehouse'),
      });
    }
  });
}

onMounted(load);
</script>
