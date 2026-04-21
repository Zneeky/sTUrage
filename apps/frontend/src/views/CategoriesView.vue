<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Categories</div>
      <q-space />
      <q-btn v-if="canEdit" label="Add Category" icon="add" color="primary" unelevated @click="openForm(null)" />
    </div>

    <q-table
      :rows="categories"
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
            <q-btn flat round dense icon="delete" size="sm" color="negative" @click="confirmDelete(row)" />
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

    <CategoryFormDialog v-model="showForm" :category="selected" @saved="load" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listCategoriesPaginated, deleteCategory } from '@/api/categories.api';
import { useAuthStore } from '@/stores/auth';
import CategoryFormDialog from '@/components/CategoryFormDialog.vue';
import type { Category } from '@/api/categories.api';

const $q = useQuasar();
const authStore = useAuthStore();
const canEdit = computed(() => ['ADMIN', 'MANAGER'].includes(authStore.user?.role ?? ''));

const categories = ref<Category[]>([]);
const page = ref(1);
const limit = ref(5);
const total = ref(0);
const loading = ref(false);
const showForm = ref(false);
const selected = ref<Category | null>(null);

const columns = [
  { name: 'name',        label: 'Name',        field: 'name',        align: 'left' as const, sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'actions',     label: '',            field: 'id',          align: 'right' as const },
];

async function load() {
  loading.value = true;
  try {
    const res = await listCategoriesPaginated({ page: page.value, limit: limit.value });
    categories.value = res.data;
    total.value = res.total;
  } finally { loading.value = false; }
}

watch(page, load);

function openForm(cat: Category | null) {
  selected.value = cat;
  showForm.value = true;
}

function confirmDelete(cat: Category) {
  $q.dialog({
    title: 'Delete Category',
    message: `Delete "${cat.name}"?`,
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    try {
      await deleteCategory(cat.id);
      $q.notify({ type: 'positive', message: 'Category deleted' });
      page.value = 1;
      await load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      $q.notify({ type: 'warning', message: status === 409 ? 'Category has linked products' : 'Failed to delete' });
    }
  });
}

onMounted(load);
</script>
