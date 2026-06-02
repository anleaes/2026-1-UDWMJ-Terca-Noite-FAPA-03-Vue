<script setup>
defineProps({
  show: Boolean,
  itemName: String,
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop-custom" @click.self="emit('cancel')">
        <div class="modal-dialog-custom card shadow-lg">
          <div
            class="card-header d-flex align-items-center"
            style="background: linear-gradient(135deg, #dc3545, #b02a37); color: #fff; border-radius: 14px 14px 0 0;"
          >
            <i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
            <h5 class="mb-0 fw-semibold">Confirmar Exclusão</h5>
          </div>
          <div class="card-body p-4">
            <p class="mb-0 text-dark">
              Tem certeza que deseja excluir
              <strong>{{ itemName }}</strong>?
            </p>
            <small class="text-muted">Esta ação não pode ser desfeita.</small>
          </div>
          <div class="card-footer bg-white d-flex justify-content-end gap-2 border-0 pb-4 pe-4">
            <button class="btn btn-outline-secondary btn-sm" @click="emit('cancel')">
              <i class="bi bi-x-lg me-1"></i>Cancelar
            </button>
            <button class="btn btn-danger btn-sm" @click="emit('confirm')">
              <i class="bi bi-trash me-1"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
