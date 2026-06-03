<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, fetchOne, save } = useCrud('/api/constructions/')
const toast = useToast()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  title: '', type: '', status: '', start_date: '', expected_end_date: '',
  total_value: '', location: '', company: '', is_completed: false,
})
const form = ref(emptyForm())

const locations = ref([])
const companies = ref([])

onMounted(async () => {
  const [locRes, compRes] = await Promise.all([
    fetch('/api/locations/'),
    fetch('/api/companies/'),
  ])
  locations.value = await locRes.json()
  companies.value = await compRes.json()
})

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
    toast.add(isEdit.value ? 'Obra atualizada.' : 'Obra cadastrada.')
    router.push('/constructions')
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-cone-striped' : 'bi-plus-square'"
        :title="isEdit ? 'Editar Obra' : 'Cadastro de Obra'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>

            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Identificação</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Título <span class="text-danger">*</span></label>
                <input v-model="form.title" type="text" class="form-control" required placeholder="Título da obra" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Tipo <span class="text-danger">*</span></label>
                <select v-model="form.type" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="road">Rodovia</option>
                  <option value="bridge">Ponte</option>
                  <option value="building">Edifício</option>
                  <option value="sanitation">Saneamento</option>
                  <option value="urban">Urbanização</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Status <span class="text-danger">*</span></label>
                <select v-model="form.status" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="planned">Planejada</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="paused">Pausada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <h6 class="text-uppercase text-muted mb-3 mt-4 small fw-semibold">Datas e Valor</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Data de Início</label>
                <input v-model="form.start_date" type="date" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Término Previsto</label>
                <input v-model="form.expected_end_date" type="date" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Valor Total (R$)</label>
                <input v-model="form.total_value" type="number" step="0.01" class="form-control" placeholder="0.00" />
              </div>
            </div>

            <h6 class="text-uppercase text-muted mb-3 mt-4 small fw-semibold">Vínculos</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Localização</label>
                <select v-model="form.location" class="form-select">
                  <option value="">Selecione...</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                    {{ loc.name }}
                  </option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label">Empresa <span class="text-danger">*</span></label>
                <select v-model="form.company" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option v-for="c in companies" :key="c.id" :value="c.id">
                    {{ c.corporate_name }}
                  </option>
                </select>
              </div>

              <div class="col-12">
                <div class="form-check form-switch">
                  <input
                    v-model="form.is_completed"
                    type="checkbox"
                    class="form-check-input"
                    id="isCompleted"
                    role="switch"
                  />
                  <label class="form-check-label" for="isCompleted">Concluída</label>
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
              <RouterLink to="/constructions" class="btn btn-outline-secondary">Cancelar</RouterLink>
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
