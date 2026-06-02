<script setup>
defineProps({
  icon: String,
  title: String,
  count: { type: Number, default: undefined },
})
</script>

<template>
  <div class="card app-card">
    <div class="card-header d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i v-if="icon" :class="`bi ${icon} fs-4 me-2`"></i>
        <h4 class="mb-0">{{ title }}</h4>
        <span v-if="count !== undefined" class="badge bg-white bg-opacity-25 ms-2 fw-normal fs-6">
          {{ count }}
        </span>
      </div>
      <slot name="actions" />
    </div>
    <div class="card-body p-0">
      <slot />
    </div>
  </div>
</template>
