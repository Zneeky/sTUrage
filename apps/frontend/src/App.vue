<template>
  <component :is="layout"><RouterView /></component>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const layout = computed(() =>
  route.meta.layout === 'AuthLayout' ? AuthLayout : AppLayout
);

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchMe();
  }
});
</script>
