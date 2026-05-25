<template>
  <div class="kpi-card">
    <div class="kpi-icon-wrap" :style="{ background: iconBg, color: iconColor }">
      <q-icon :name="icon" size="24px" />
    </div>
    <div class="kpi-text">
      <div class="kpi-value">{{ value }}</div>
      <div class="kpi-label">{{ label }}</div>
      <div v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</div>
    </div>
  </div>
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

const colorMap: Record<string, { bg: string; fg: string }> = {
  primary: { bg: 'var(--stu-primary-50)',    fg: 'var(--stu-primary)' },
  blue:    { bg: 'var(--stu-primary-50)',    fg: 'var(--stu-primary)' },
  positive:{ bg: 'var(--stu-success-light)', fg: 'var(--stu-success)' },
  warning: { bg: 'var(--stu-warning-light)', fg: 'var(--stu-warning)' },
  negative:{ bg: 'var(--stu-danger-light)',  fg: 'var(--stu-danger)' },
  info:    { bg: 'var(--stu-info-light)',    fg: 'var(--stu-info)' },
  accent:  { bg: 'var(--stu-danger-light)',  fg: 'var(--stu-danger)' },
};

const iconBg = computed(() => (colorMap[props.color] ?? colorMap.primary).bg);
const iconColor = computed(() => (colorMap[props.color] ?? colorMap.primary).fg);
</script>

<style scoped>
.kpi-card {
  background: #ffffff;
  border-radius: var(--stu-radius);
  box-shadow: var(--stu-shadow-sm);
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--stu-shadow-md);
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
  color: var(--stu-gray-900);
}

.kpi-label {
  font-size: 0.8rem;
  color: var(--stu-gray-500);
  margin-top: 5px;
}

.kpi-subtitle {
  font-size: 0.75rem;
  color: var(--stu-gray-400);
  margin-top: 2px;
}
</style>
