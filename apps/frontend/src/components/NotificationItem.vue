<template>
  <q-item
    clickable v-ripple
    :class="rowClass"
    @click="handleRead"
  >
    <q-item-section avatar>
      <q-icon :name="iconName" :color="iconColor" size="20px" />
    </q-item-section>
    <q-item-section>
      <q-item-label lines="2">{{ notification.message }}</q-item-label>
      <q-item-label caption>
        {{ notification.product.name }} · {{ relativeTime(notification.createdAt) }}
      </q-item-label>
    </q-item-section>
    <q-item-section side v-if="dismissible">
      <q-btn
        flat round dense size="sm"
        icon="close"
        color="grey-6"
        @click.stop="handleDelete"
      >
        <q-tooltip>Dismiss</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import type { Notification } from '@/stores/notifications';

const props = withDefaults(
  defineProps<{ notification: Notification; dismissible?: boolean }>(),
  { dismissible: false },
);
const store = useNotificationsStore();

const isOut = computed(() => props.notification.type === 'OUT_OF_STOCK');

const iconName  = computed(() => isOut.value ? 'error' : 'warning');
const iconColor = computed(() => {
  if (props.notification.isRead) return 'grey-5';
  return isOut.value ? 'negative' : 'warning';
});
const rowClass = computed(() => {
  if (props.notification.isRead) return '';
  return isOut.value ? 'bg-red-1' : 'bg-orange-1';
});

function handleRead() {
  if (!props.notification.isRead) store.markRead(props.notification.id);
}

async function handleDelete() {
  await store.remove(props.notification.id);
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
