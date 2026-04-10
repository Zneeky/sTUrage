import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { listNotifications, markNotificationRead } from '@/api/notifications.api';

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  product: { id: string; name: string; sku: string };
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([]);
  const unreadCount = computed(() => items.value.filter(n => !n.isRead).length);

  async function fetch() {
    items.value = await listNotifications();
  }

  async function markRead(id: string) {
    const updated = await markNotificationRead(id);
    const idx = items.value.findIndex(n => n.id === id);
    if (idx !== -1) items.value[idx] = updated;
  }

  return { items, unreadCount, fetch, markRead };
});
