<template>
  <q-header class="stu-topbar">
    <q-toolbar style="height: 64px; padding: 0 32px; gap: 16px;">
      <q-btn
        flat
        dense
        round
        icon="menu"
        class="topbar-menu-btn"
        aria-label="Menu"
        @click="emit('toggle-drawer')"
      />

      <q-toolbar-title class="topbar-title">
        {{ pageTitle }}
      </q-toolbar-title>

      <NotificationBell v-if="notificationBellLoaded" />

      <q-btn
        flat
        round
        dense
        class="topbar-icon-btn"
      >
        <div class="topbar-user-avatar">
          {{ initials }}
        </div>
        <q-menu anchor="bottom right" self="top right" style="min-width: 180px;">
          <q-list style="min-width: 180px;">
            <q-item class="q-pb-xs q-pt-sm">
              <q-item-section>
                <q-item-label class="text-weight-medium" style="color: var(--stu-gray-800);">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </q-item-label>
                <q-item-label caption style="color: var(--stu-gray-500);">
                  {{ authStore.user?.email }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" color="grey-6" size="18px" />
              </q-item-section>
              <q-item-section style="color: var(--stu-gray-700);">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const NotificationBell = defineAsyncComponent(() => import('@/components/NotificationBell.vue'));
const notificationBellLoaded = computed(() => true);

const emit = defineEmits<{ (e: 'toggle-drawer'): void }>();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/warehouses': 'Warehouses',
  '/stock-movements': 'Stock Movements',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/users': 'User Management',
};

const pageTitle = computed(() => {
  if (route.path.startsWith('/products/')) return 'Product Detail';
  return pageTitles[route.path] ?? 'STURage';
});

const initials = computed(() => {
  const f = authStore.user?.firstName?.[0] ?? '';
  const l = authStore.user?.lastName?.[0] ?? '';
  return (f + l).toUpperCase() || 'U';
});

async function handleLogout() {
  await authStore.logoutApi();
  router.push('/login');
}
</script>

<style scoped>
.stu-topbar {
  background: #ffffff !important;
  border-bottom: 1px solid var(--stu-gray-100) !important;
  box-shadow: none !important;
}

.topbar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--stu-gray-900) !important;
}

.topbar-menu-btn {
  color: var(--stu-gray-600) !important;
}

.topbar-icon-btn {
  padding: 0 !important;
  min-width: unset !important;
  border-radius: 8px !important;
}

.topbar-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--stu-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
