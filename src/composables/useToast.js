import { ref, inject } from 'vue'

export const TOAST_KEY = Symbol('toast')

export function createToastService() {
  const toasts = ref([])
  let nextId = 0

  function add(message, type = 'success') {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), 4000)
  }

  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, add, remove }
}

export function useToast() {
  return inject(TOAST_KEY)
}
