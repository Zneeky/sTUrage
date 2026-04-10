<template>
  <q-chip
    dense
    :color="colorMap[type]"
    text-color="white"
    :label="type"
    class="text-weight-medium"
    style="font-size: 0.7rem;"
  />
</template>

<script setup lang="ts">
defineProps<{ type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' }>();

const colorMap = {
  INBOUND:    'positive',
  OUTBOUND:   'negative',
  TRANSFER:   'info',
  ADJUSTMENT: 'warning',
} as const;
</script>
