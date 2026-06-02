<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar...' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="input-group input-group-sm search-input">
    <span class="input-group-text bg-white bg-opacity-15 border-0 text-black-50">
      <i class="bi bi-search"></i>
    </span>
    <input
      type="text"
      class="form-control bg-white bg-opacity-15 border-0 text-black placeholder-black"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
