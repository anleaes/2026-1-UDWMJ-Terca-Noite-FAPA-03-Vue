<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, fetchOne, save } = useCrud('/api/locations/')
const toast = useToast()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({ name: '', neighborhood: '', city: '', type: '', is_paved: false })
const form = ref(emptyForm())

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      if (data) form.value = data
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    toast.add(isEdit.value ? 'Local atualizado com sucesso.' : 'Local cadastrado com sucesso.')
    router.push('/locations')
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        icon="bi-geo-alt"
        :title="isEdit ? 'Editar Local' : 'Cadastro de Local'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados do Local</h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Nome</label>
                <input v-model="form.name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Bairro</label>
                <input v-model="form.neighborhood" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Cidade</label>
                <input v-model="form.city" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Tipo</label>
                <select v-model="form.type" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="STREET">Rua</option>
                  <option value="AVENUE">Avenida</option>
                  <option value="SQUARE">Praça</option>
                  <option value="PARK">Parque</option>
                  <option value="ALLEY">Viela</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
              <div class="col-12">
                <div class="form-check form-switch">
                  <input
                    v-model="form.is_paved"
                    type="checkbox"
                    class="form-check-input"
                    id="isPaved"
                    role="switch"
                  />
                  <label class="form-check-label" for="isPaved">Pavimentado</label>
                </div>
              </div>
            </div>

            <Transition name="slide-down">
              <div v-if="error" class="alert alert-danger mt-4">
                <strong><i class="bi bi-exclamation-circle me-1"></i>Verifique os campos:</strong>
                <ul class="mb-0 mt-1">
                  <li v-for="(msgs, field) in error" :key="field">
                    {{ field }}: {{ Array.isArray(msgs) ? msgs.join(', ') : msgs }}
                  </li>
                </ul>
              </div>
            </Transition>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <RouterLink to="/locations" class="btn btn-outline-secondary">Cancelar</RouterLink>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </AppCard>
    </div>
  </div>
</template>
