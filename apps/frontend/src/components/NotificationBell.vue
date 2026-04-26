<template>
  <q-btn flat round dense icon="notifications" color="white">
    <q-badge v-if="unreadCount > 0" color="negative" floating>{{ unreadCount }}</q-badge>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const unreadCount = computed(() => 0);
</script>
