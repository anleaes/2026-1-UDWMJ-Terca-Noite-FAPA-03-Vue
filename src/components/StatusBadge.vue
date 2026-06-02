<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: [Boolean, String],
  trueLabel: { type: String, default: 'Ativo' },
  falseLabel: { type: String, default: 'Inativo' },
  map: { type: Object, default: null },
})

const config = computed(() => {
  if (props.map && typeof props.value === 'string') {
    return props.map[props.value] ?? { label: props.value, cls: 'badge-soft-secondary' }
  }
  return props.value
    ? { label: props.trueLabel, cls: 'badge-soft-success' }
    : { label: props.falseLabel, cls: 'badge-soft-danger' }
})
</script>

<template>
  <span class="badge" :class="config.cls">{{ config.label }}</span>
</template>
