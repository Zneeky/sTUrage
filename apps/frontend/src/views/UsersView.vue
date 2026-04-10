<template>
  <q-page>
    <div class="page-title">User Management</div>

    <q-tabs v-model="activeTab" align="left" color="primary" class="q-mb-md">
      <q-tab name="users"    label="Users"     icon="manage_accounts" />
      <q-tab name="auditlog" label="Audit Log" icon="history" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- Users tab -->
      <q-tab-panel name="users" class="q-pa-none">
        <div class="row justify-end q-mb-md">
          <q-btn label="Add User" icon="person_add" color="primary" unelevated @click="openForm(null)" />
        </div>

        <q-table
          :rows="store.users"
          :columns="userColumns"
          row-key="id"
          :loading="store.loading"
          flat bordered
          :rows-per-page-options="[]"
          hide-bottom
        >
          <template #body-cell-role="{ value }">
            <q-td>
              <q-badge :color="roleColor(value)" :label="value" />
            </q-td>
          </template>
          <template #body-cell-status="{ row }">
            <q-td>
              <q-badge :color="row.isActive ? 'positive' : 'grey'" :label="row.isActive ? 'Active' : 'Inactive'" />
            </q-td>
          </template>
          <template #body-cell-actions="{ row }">
            <q-td class="text-right">
              <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openForm(row)" />
              <q-btn
                flat round dense icon="block" size="sm" color="warning"
                :disable="!row.isActive"
                @click="confirmDeactivate(row)"
              >
                <q-tooltip>Deactivate</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Audit log tab -->
      <q-tab-panel name="auditlog" class="q-pa-none">
        <q-table
          :rows="store.auditLog"
          :columns="auditColumns"
          row-key="id"
          :loading="store.auditLoading"
          flat bordered dense
          :rows-per-page-options="[]"
          hide-bottom
        >
          <template #body-cell-createdAt="{ value }">
            <q-td>{{ formatDate(value) }}</q-td>
          </template>
        </q-table>
        <div class="row justify-center q-mt-md">
          <q-pagination
            v-model="store.auditPage"
            :max="Math.ceil(store.auditTotal / 20) || 1"
            :max-pages="7"
            boundary-numbers
            color="primary"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <UserFormDialog v-model="showForm" :user="selectedUser" @saved="store.fetchUsers()" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUsersStore } from '@/stores/users';
import UserFormDialog from '@/components/UserFormDialog.vue';
import type { User } from '@/api/users.api';

const $q = useQuasar();
const store = useUsersStore();
const activeTab = ref('users');
const showForm = ref(false);
const selectedUser = ref<User | null>(null);

const roleColor = (role: string) => ({ ADMIN: 'negative', MANAGER: 'warning', OPERATOR: 'primary', VIEWER: 'secondary' }[role] ?? 'grey');

const userColumns = [
  { name: 'name',    label: 'Name',   field: (r: User) => `${r.firstName} ${r.lastName}`, align: 'left' as const },
  { name: 'email',   label: 'Email',  field: 'email',   align: 'left' as const },
  { name: 'role',    label: 'Role',   field: 'role',    align: 'left' as const },
  { name: 'status',  label: 'Status', field: 'isActive', align: 'left' as const },
  { name: 'actions', label: '',       field: 'id',       align: 'right' as const },
];

const auditColumns = [
  { name: 'createdAt', label: 'Time',   field: 'createdAt', align: 'left' as const },
  { name: 'action',    label: 'Action', field: 'action',    align: 'left' as const },
  { name: 'entity',    label: 'Entity', field: 'entity',    align: 'left' as const },
  { name: 'entityId',  label: 'ID',     field: 'entityId',  align: 'left' as const },
  { name: 'user',      label: 'By',     field: (r: { user: { email: string } }) => r.user?.email, align: 'left' as const },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function openForm(user: User | null) {
  selectedUser.value = user;
  showForm.value = true;
}

function confirmDeactivate(user: User) {
  $q.dialog({
    title: 'Deactivate User',
    message: `Deactivate ${user.firstName} ${user.lastName}?`,
    ok: { label: 'Deactivate', color: 'warning', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(async () => {
    try {
      await store.deactivate(user.id);
      $q.notify({ type: 'positive', message: 'User deactivated' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed';
      $q.notify({ type: 'negative', message: msg });
    }
  });
}

watch(() => store.auditPage, () => store.fetchAuditLog());
watch(activeTab, (tab) => { if (tab === 'auditlog' && !store.auditLog.length) store.fetchAuditLog(); });
onMounted(() => store.fetchUsers());
</script>
