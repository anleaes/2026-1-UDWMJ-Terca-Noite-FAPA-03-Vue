<script setup>
defineProps({
  value: { type: [Number, String], default: 0 },
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  color: { type: String, default: '#818cf8' },
})
</script>

<template>
  <div class="stat">
    <div v-if="icon" class="stat-icon" :style="{ background: `${color}22`, color }">
      <q-icon :name="icon" size="20px" />
    </div>
    <div class="stat-body">
      <span class="stat-value">{{ value }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  min-width: 130px;
  transition:
    transform 0.25s var(--ease),
    border-color 0.25s var(--ease),
    background 0.25s var(--ease);
}
.stat:hover {
  transform: translateY(-3px);
  border-color: var(--border-accent);
  background: rgba(99, 102, 241, 0.08);
}
.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.stat-body {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.1;
}
.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-3);
  margin-top: 2px;
}
</style>
