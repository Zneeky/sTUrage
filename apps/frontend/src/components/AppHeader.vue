<template>
  <q-header elevated style="background: #1565C0; height: 56px;">
    <q-toolbar style="height: 56px;">
      <q-btn
        flat
        dense
        round
        icon="menu"
        color="white"
        aria-label="Menu"
        @click="emit('toggle-drawer')"
      />

      <q-toolbar-title class="text-white text-weight-medium">
        {{ pageTitle }}
      </q-toolbar-title>

      <NotificationBell v-if="notificationBellLoaded" />

      <q-btn
        flat
        round
        dense
        icon="account_circle"
        color="white"
        class="q-ml-sm"
      >
        <q-menu>
          <q-list style="min-width: 160px;">
            <q-item>
              <q-item-section>
                <q-item-label>{{ authStore.user?.email }}</q-item-label>
                <q-item-label caption>{{ authStore.user?.role }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Logout</q-item-section>
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
  '/stock-movements': 'Stock Movements',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/users': 'User Management',
};

const pageTitle = computed(() => {
  if (route.path.startsWith('/products/')) return 'Product Detail';
  return pageTitles[route.path] ?? 'STURage';
});

async function handleLogout() {
  await authStore.logoutApi();
  router.push('/login');
}
</script>
