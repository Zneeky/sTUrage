<template>
  <q-drawer
    v-model="open"
    show-if-above
    :width="240"
    :breakpoint="600"
    bordered
    class="sidebar"
  >
    <div class="sidebar-header">
      <q-icon name="warehouse" size="28px" color="white" />
      <span class="sidebar-title">STURage</span>
    </div>

    <q-list padding class="nav-list" dark>
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
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </template>
    </q-list>

    <div class="sidebar-footer">
      <q-chip
        :label="authStore.user?.role ?? ''"
        color="primary"
        text-color="white"
        size="sm"
        class="q-mb-xs"
      />
      <div class="sidebar-user-name">
        {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
      </div>
      <q-btn
        flat
        dense
        icon="logout"
        label="Logout"
        color="white"
        size="sm"
        class="q-mt-xs"
        @click="handleLogout"
      />
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const authStore = useAuthStore();
const router = useRouter();
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const navItems = [
  { label: 'Dashboard',       icon: 'dashboard',        to: '/dashboard' },
  { label: 'Products',        icon: 'inventory_2',       to: '/products' },
  { label: 'Categories',      icon: 'category',          to: '/categories' },
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
.sidebar {
  background: #1A2035;
  color: white;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 56px;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.nav-list {
  flex: 1;
}

.nav-item {
  color: rgba(255, 255, 255, 0.75);
  border-radius: 6px;
  margin: 2px 8px;
  min-height: 44px;
}

.nav-item :deep(.q-icon),
.nav-item :deep(.q-item__section) {
  color: rgba(255, 255, 255, 0.75) !important;
}

.nav-item--active {
  background: #1565C0 !important;
  color: white !important;
}

.nav-item--active :deep(.q-icon),
.nav-item--active :deep(.q-item__section) {
  color: white !important;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.sidebar-user-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
</style>
