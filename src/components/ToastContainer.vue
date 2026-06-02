<script setup>
import { useToast } from '../composables/useToast'

const toast = useToast()
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
    <TransitionGroup name="toast">
      <div
        v-for="t in toast.toasts.value"
        :key="t.id"
        class="toast show align-items-center border-0 mb-2"
        :class="t.type === 'error' ? 'text-bg-danger' : 'text-bg-success'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i :class="`bi ${t.type === 'error' ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`"></i>
            {{ t.message }}
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            @click="toast.remove(t.id)"
          ></button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
