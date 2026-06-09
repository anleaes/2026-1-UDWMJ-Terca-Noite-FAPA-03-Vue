<script setup>
defineProps({
  color: { type: String, default: '#94a3b8' },
  icon: { type: String, default: '' },
  label: { type: [String, Number], default: '' },
})
</script>

<template>
  <span
    class="soft-chip"
    :style="{ background: `${color}22`, color, border: `1px solid ${color}33` }"
  >
    <q-icon v-if="icon" :name="icon" size="14px" />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.soft-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
