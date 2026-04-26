import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listUsers, createUser, updateUser, deactivateUser, listAuditLog } from '@/api/users.api';
import type { User, AuditEntry, CreateUserDto, UpdateUserDto } from '@/api/users.api';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const auditLog = ref<AuditEntry[]>([]);
  const auditPage = ref(1);
  const auditTotal = ref(0);
  const loading = ref(false);
  const auditLoading = ref(false);

  async function fetchUsers() {
    loading.value = true;
    try { users.value = await listUsers(); }
    finally { loading.value = false; }
  }

  async function addUser(data: CreateUserDto) {
    await createUser(data);
    await fetchUsers();
  }

  async function editUser(id: string, data: UpdateUserDto) {
    await updateUser(id, data);
    await fetchUsers();
  }

  async function deactivate(id: string) {
    await deactivateUser(id);
    await fetchUsers();
  }

  async function fetchAuditLog() {
    auditLoading.value = true;
    try {
      const res = await listAuditLog({ page: auditPage.value, limit: 20 });
      auditLog.value = res.data;
      auditTotal.value = res.total;
    } finally {
      auditLoading.value = false; }
  }

  return { users, auditLog, auditPage, auditTotal, loading, auditLoading, fetchUsers, addUser, editUser, deactivate, fetchAuditLog };
});
