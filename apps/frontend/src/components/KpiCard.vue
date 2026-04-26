<template>
  <q-card flat bordered class="kpi-card">
    <q-card-section class="kpi-body">
      <div class="kpi-icon-wrap" :style="{ background: iconBg }">
        <q-icon :name="icon" :color="color" size="24px" />
      </div>
      <div class="kpi-text">
        <div class="kpi-value">{{ value }}</div>
        <div class="kpi-label">{{ label }}</div>
        <div v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</div>
      </div>
    </q-card-section>
    <div class="kpi-border" :style="{ background: `var(--q-${color})` }" />
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
}>();

const iconBg = computed(() => `color-mix(in srgb, var(--q-${props.color}) 15%, transparent)`);
</script>

<style scoped>
.kpi-card {
  position: relative;
  overflow: hidden;
  background: white;
}

.kpi-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.kpi-body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 20px 20px 24px;
}

.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: #212121;
}

.kpi-label {
  font-size: 0.8rem;
  color: #757575;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-subtitle {
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-top: 2px;
}
</style>
