<template>
  <span :class="['badge-soft', colorClass]">{{ type }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' }>();

const colorClass = computed(() => {
  const map: Record<string, string> = {
    INBOUND:    'badge-soft--green',
    OUTBOUND:   'badge-soft--red',
    TRANSFER:   'badge-soft--blue',
    ADJUSTMENT: 'badge-soft--amber',
  };
  return map[props.type] ?? 'badge-soft--gray';
});
</script>
