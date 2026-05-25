<template>
  <q-drawer
    v-model="open"
    show-if-above
    :width="260"
    :breakpoint="600"
    content-class="sidebar"
  >
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <q-icon name="warehouse" size="22px" color="white" />
      </div>
      <span class="sidebar-title">STURage</span>
    </div>

    <q-list padding class="nav-list">
      <template v-for="item in navItems" :key="item.to">
        <q-item
          v-if="!item.adminOnly || isAdmin"
          :to="item.to"
          exact
          clickable
          v-ripple
          active-class="nav-item--active"
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </template>
    </q-list>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">
          {{ initials }}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
          <div class="sidebar-user-role">{{ authStore.user?.role }}</div>
        </div>
      </div>
      <button class="sidebar-logout-btn" title="Logout" @click="handleLogout">
        <q-icon name="logout" size="18px" />
      </button>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const authStore = useAuthStore();
const router = useRouter();
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const initials = computed(() => {
  const f = authStore.user?.firstName?.[0] ?? '';
  const l = authStore.user?.lastName?.[0] ?? '';
  return (f + l).toUpperCase() || 'U';
});

const navItems = [
  { label: 'Dashboard',       icon: 'dashboard',        to: '/dashboard' },
  { label: 'Products',        icon: 'inventory_2',       to: '/products' },
  { label: 'Categories',      icon: 'category',          to: '/categories' },
  { label: 'Suppliers',       icon: 'local_shipping',    to: '/suppliers' },
  { label: 'Warehouses',      icon: 'warehouse',          to: '/warehouses' },
  { label: 'Stock Movements', icon: 'swap_horiz',        to: '/stock-movements' },
  { label: 'Reports',         icon: 'bar_chart',         to: '/reports' },
  { label: 'Users',           icon: 'manage_accounts',   to: '/users', adminOnly: true },
];

async function handleLogout() {
  await authStore.logoutApi();
  router.push('/login');
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
}

.sidebar-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--stu-primary);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--stu-gray-800);
  letter-spacing: 0.3px;
}

.nav-list {
  flex: 1;
  padding: 8px 12px;
}

.nav-item {
  border-radius: 8px;
  margin: 2px 0;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-item--active {
  background: var(--stu-primary-50) !important;
  font-weight: 600;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--stu-gray-100);
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.sidebar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--stu-primary-50);
  color: var(--stu-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.sidebar-user-info {
  min-width: 0;
}

.sidebar-user-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--stu-gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: 0.675rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: var(--stu-gray-400);
}

.sidebar-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--stu-gray-400);
  transition: all 0.15s;
}

.sidebar-logout-btn:hover {
  background: var(--stu-gray-100);
  color: var(--stu-gray-600);
}
</style>
