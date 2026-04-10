<template>
  <q-badge
    :color="badgeColor"
    :label="quantity"
    class="text-weight-medium"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ quantity: number; minStock: number }>();

const badgeColor = computed(() => {
  if (props.quantity === 0) return 'negative';
  if (props.quantity < props.minStock) return 'warning';
  return 'positive';
});
</script>
