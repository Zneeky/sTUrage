<template>
  <div>
    <q-btn flat round dense icon="notifications" color="white" ref="bellBtn">
      <q-badge v-if="store.unreadCount > 0" color="negative" floating>
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </q-badge>
      <q-menu anchor="bottom right" self="top right" style="min-width: 320px; max-width: 360px;">
        <div class="row items-center q-px-md q-pt-sm q-pb-xs">
          <span class="text-subtitle2 text-weight-medium">Notifications</span>
          <q-space />
          <q-btn
            v-if="store.unreadCount > 0"
            flat dense size="sm" label="Mark all read"
            color="primary"
            @click.stop="markAll"
          />
        </div>
        <q-separator />

        <q-scroll-area style="height: 300px;" v-if="store.items.length">
          <q-list separator>
            <NotificationItem
              v-for="n in store.items.slice(0, 10)"
              :key="n.id"
              :notification="n"
            />
          </q-list>
        </q-scroll-area>

        <div v-else class="text-center text-grey-5 text-caption q-pa-lg">
          No notifications
        </div>

        <q-separator />
        <div class="row justify-center q-pa-xs">
          <q-btn flat size="sm" label="View all" color="primary" to="/notifications" v-close-popup />
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import NotificationItem from './NotificationItem.vue';

const store = useNotificationsStore();
const bellBtn = ref(null);
let es: EventSource | null = null;

async function markAll() {
  await store.markAllRead();
}

function connectSSE() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  es = new EventSource(`${base}/api/notifications/stream?token=${encodeURIComponent(token)}`);

  es.addEventListener('notification', () => {
    store.fetch();
  });

  es.onerror = () => {
    es?.close();
    es = null;
    // Reconnect after 10 s on error
    setTimeout(connectSSE, 10000);
  };
}

onMounted(() => {
  store.fetch();
  connectSSE();
});

onUnmounted(() => {
  es?.close();
  es = null;
});
</script>
