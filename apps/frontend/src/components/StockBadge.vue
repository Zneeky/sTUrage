<template>
  <span :class="['badge-soft', variantClass]">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ quantity: number; minStock: number }>();

const variantClass = computed(() => {
  if (props.quantity === 0) return 'badge-soft--red';
  if (props.quantity < props.minStock) return 'badge-soft--amber';
  return 'badge-soft--green';
});

const label = computed(() => {
  if (props.quantity === 0) return 'Out of stock';
  if (props.quantity < props.minStock) return `Low (${props.quantity})`;
  return String(props.quantity);
});
</script>
