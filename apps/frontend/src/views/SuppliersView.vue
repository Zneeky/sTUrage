<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Suppliers</div>
      <q-space />
      <q-btn v-if="canEdit" label="Add Supplier" icon="add" color="primary" unelevated @click="openForm(null)" />
    </div>

    <q-table
      :rows="suppliers"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :rows-per-page-options="[]"
      hide-bottom
    >
      <template #body-cell-actions="{ row }">
        <q-td class="text-right">
          <template v-if="canEdit">
            <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openForm(row)" />
            <q-btn v-if="canDelete" flat round dense icon="delete" size="sm" color="negative" @click="confirmDelete(row)" />
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

    <SupplierFormDialog v-model="showForm" :supplier="selected" @saved="load" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listSuppliersPaginated, deleteSupplier } from '@/api/suppliers.api';
import { useAuthStore } from '@/stores/auth';
import SupplierFormDialog from '@/components/SupplierFormDialog.vue';
import type { Supplier } from '@/api/suppliers.api';

const $q = useQuasar();
const authStore = useAuthStore();
const canEdit   = computed(() => ['ADMIN', 'MANAGER'].includes(authStore.user?.role ?? ''));
const canDelete = computed(() => authStore.user?.role === 'ADMIN');

const suppliers = ref<Supplier[]>([]);
const page = ref(1);
const limit = ref(5);
const total = ref(0);
const loading = ref(false);
const showForm = ref(false);
const selected = ref<Supplier | null>(null);

const columns = [
  { name: 'name',        label: 'Name',         field: 'name',        align: 'left' as const, sortable: true },
  { name: 'contactName', label: 'Contact',      field: (r: Supplier) => r.contactName ?? '—', align: 'left' as const },
  { name: 'email',       label: 'Email',        field: (r: Supplier) => r.email       ?? '—', align: 'left' as const },
  { name: 'phone',       label: 'Phone',        field: (r: Supplier) => r.phone       ?? '—', align: 'left' as const },
  { name: 'address',     label: 'Address',      field: (r: Supplier) => r.address     ?? '—', align: 'left' as const },
  { name: 'actions',     label: '',             field: 'id',          align: 'right' as const },
];

async function load() {
  loading.value = true;
  try {
    const res = await listSuppliersPaginated({ page: page.value, limit: limit.value });
    suppliers.value = res.data;
    total.value = res.total;
  } finally { loading.value = false; }
}

watch(page, load);

function openForm(s: Supplier | null) {
  selected.value = s;
  showForm.value = true;
}

function confirmDelete(s: Supplier) {
  $q.dialog({
    title: 'Delete Supplier',
    message: `Delete "${s.name}"?`,
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    try {
      await deleteSupplier(s.id);
      $q.notify({ type: 'positive', message: 'Supplier deleted' });
      page.value = 1;
      await load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      $q.notify({
        type: 'warning',
        message: status === 409 ? 'Supplier has linked products' : (msg ?? 'Failed to delete supplier'),
      });
    }
  });
}

onMounted(load);
</script>
