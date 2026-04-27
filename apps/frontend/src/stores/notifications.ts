import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/api/notifications.api';

export type NotificationType = 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  product: { id: string; name: string; sku: string };
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([]);
  const unreadCount = computed(() => items.value.filter(n => !n.isRead).length);
  const seenIds = new Set<string>();
  let initialized = false;

  async function fetch() {
    const fresh = await listNotifications();

    // After the first load, surface a toast for any newly-arrived unread alerts.
    if (initialized) {
      for (const n of fresh) {
        if (!n.isRead && !seenIds.has(n.id)) {
          Notify.create({
            type: n.type === 'OUT_OF_STOCK' ? 'negative' : 'warning',
            icon: n.type === 'OUT_OF_STOCK' ? 'error' : 'warning',
            message: n.message,
            position: 'top-right',
            timeout: 6000,
            actions: [{ label: 'Dismiss', color: 'white' }],
          });
        }
      }
    }

    items.value = fresh;
    seenIds.clear();
    fresh.forEach(n => seenIds.add(n.id));
    initialized = true;
  }

  async function markRead(id: string) {
    const updated = await markNotificationRead(id);
    const idx = items.value.findIndex(n => n.id === id);
    if (idx !== -1) items.value[idx] = updated;
  }

  async function markAllRead() {
    await markAllNotificationsRead();
    items.value = items.value.map(n => ({ ...n, isRead: true }));
  }

  async function remove(id: string) {
    await deleteNotification(id);
    items.value = items.value.filter(n => n.id !== id);
    seenIds.delete(id);
  }

  return { items, unreadCount, fetch, markRead, markAllRead, remove };
});
