import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
    // implemented in STUR-20
  }

  async function markRead(_id: string) {
    // implemented in STUR-20
  }

  return { items, unreadCount, fetch, markRead };
});
