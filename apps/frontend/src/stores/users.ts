import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listUsers, createUser, updateUser, deactivateUser, listAuditLog } from '@/api/users.api';
import type { User, AuditEntry, CreateUserDto, UpdateUserDto } from '@/api/users.api';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const usersPage = ref(1);
  const usersLimit = ref(5);
  const usersTotal = ref(0);

  const auditLog = ref<AuditEntry[]>([]);
  const auditPage = ref(1);
  const auditLimit = ref(5);
  const auditTotal = ref(0);

  const loading = ref(false);
  const auditLoading = ref(false);

  async function fetchUsers() {
    loading.value = true;
    try {
      const res = await listUsers({ page: usersPage.value, limit: usersLimit.value });
      users.value = res.data;
      usersTotal.value = res.total;
    } catch (err) {
      // Do not clear existing data on error — preserve whatever was loaded before
      throw err;
    } finally { loading.value = false; }
  }

  function resetUsersPage() { usersPage.value = 1; }

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
      const res = await listAuditLog({ page: auditPage.value, limit: auditLimit.value });
      auditLog.value = res.data;
      auditTotal.value = res.total;
    } catch (err) {
      throw err;
    } finally { auditLoading.value = false; }
  }

  return {
    users, usersPage, usersLimit, usersTotal,
    auditLog, auditPage, auditLimit, auditTotal,
    loading, auditLoading,
    fetchUsers, resetUsersPage, addUser, editUser, deactivate, fetchAuditLog,
  };
});
