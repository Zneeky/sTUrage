<template>
  <q-item
    clickable v-ripple
    :class="notification.isRead ? '' : 'bg-blue-1'"
    @click="handleRead"
  >
    <q-item-section avatar>
      <q-icon
        name="circle"
        :color="notification.isRead ? 'grey-4' : 'primary'"
        size="10px"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label lines="2">{{ notification.message }}</q-item-label>
      <q-item-label caption>
        {{ notification.product.name }} · {{ relativeTime(notification.createdAt) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications';
import type { Notification } from '@/stores/notifications';

const props = defineProps<{ notification: Notification }>();
const store = useNotificationsStore();

function handleRead() {
  if (!props.notification.isRead) store.markRead(props.notification.id);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
</script>
