<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const constructionId = computed(() => Number(route.params.id))
const inspectionId = computed(() => (route.params.inspectionId ? Number(route.params.inspectionId) : null))
const isEdit = computed(() => !!inspectionId.value)

const { loading, error, fetchOne, save } = useCrud('/api/inspections/')

const emptyForm = () => ({
  visit_date: '', status_found: '', description: '', is_compliant: false, score: '', employee: '',
})
const form = ref(emptyForm())
const employees = ref([])

onMounted(async () => {
  const constructionData = await fetch(`/api/constructions/${constructionId.value}/`).then((r) => r.json())
  const all = await fetch('/api/employees/').then((r) => r.json())
  employees.value = all.filter((e) => e.company === constructionData.company)
})

watch(
  () => route.params.inspectionId,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      if (data) {
        form.value = {
          ...data,
          visit_date: data.visit_date ? data.visit_date.slice(0, 16) : '',
        }
      }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

async function submit() {
  const payload = { ...form.value, construction: constructionId.value }
  const data = await save(payload, inspectionId.value)
  if (data) {
    toast.add(isEdit.value ? 'Inspeção atualizada.' : 'Inspeção cadastrada.')
    router.push(`/constructions/${constructionId.value}`)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-clipboard2-check' : 'bi-clipboard2-plus'"
        :title="isEdit ? 'Editar Inspeção' : 'Nova Inspeção'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados da Visita</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Data da Visita <span class="text-danger">*</span></label>
                <input v-model="form.visit_date" type="datetime-local" class="form-control" required />
              </div>

              <div class="col-md-6">
                <label class="form-label">Status Encontrado <span class="text-danger">*</span></label>
                <select v-model="form.status_found" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                  <option value="partial">Parcialmente Regular</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Pontuação <span class="text-danger">*</span></label>
                <input v-model="form.score" type="number" step="0.1" min="0" max="10" class="form-control" required placeholder="0.0 – 10.0" />
              </div>

              <div class="col-md-6 d-flex align-items-end">
                <div class="form-check form-switch pb-2">
                  <input v-model="form.is_compliant" type="checkbox" class="form-check-input" id="isCompliant" role="switch" />
                  <label class="form-check-label" for="isCompliant">Em conformidade</label>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">Fiscal (Funcionário) <span class="text-danger">*</span></label>
                <select v-model="form.employee" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option v-for="e in employees" :key="e.id" :value="e.id">
                    {{ e.first_name }} {{ e.last_name }}
                  </option>
                </select>
                <div class="form-text">Exibindo apenas funcionários da empresa desta obra.</div>
              </div>

              <div class="col-12">
                <label class="form-label">Descrição <span class="text-danger">*</span></label>
                <textarea v-model="form.description" class="form-control" rows="4" required placeholder="Descreva as condições encontradas na visita..."></textarea>
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
              <RouterLink :to="`/constructions/${constructionId}`" class="btn btn-outline-secondary">Cancelar</RouterLink>
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
