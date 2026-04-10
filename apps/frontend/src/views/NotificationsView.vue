<template>
  <q-page>
    <div class="row items-center q-mb-md">
      <div class="page-title q-mb-none">Notifications</div>
      <q-space />
      <q-btn
        v-if="store.unreadCount > 0"
        label="Mark all read"
        icon="done_all"
        outline color="primary"
        @click="markAll"
      />
    </div>

    <q-card flat bordered>
      <q-list separator v-if="store.items.length">
        <NotificationItem
          v-for="n in store.items"
          :key="n.id"
          :notification="n"
        />
      </q-list>
      <div v-else class="text-center text-grey-5 q-pa-xl">
        <q-icon name="notifications_none" size="48px" class="q-mb-md" />
        <div>No notifications</div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import NotificationItem from '@/components/NotificationItem.vue';

const store = useNotificationsStore();

async function markAll() {
  const unread = store.items.filter(n => !n.isRead);
  await Promise.all(unread.map(n => store.markRead(n.id)));
}

onMounted(() => store.fetch());
</script>
