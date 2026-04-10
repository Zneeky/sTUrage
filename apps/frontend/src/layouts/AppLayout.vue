<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader @toggle-drawer="drawer = !drawer" />
    <NavSidebar v-model="drawer" />
    <q-page-container style="background: var(--stu-bg)">
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import NavSidebar from '@/components/NavSidebar.vue';

const drawer = ref(true);
</script>
