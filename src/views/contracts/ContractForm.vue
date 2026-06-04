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
const contractId = computed(() => (route.params.contractId ? Number(route.params.contractId) : null))
const isEdit = computed(() => !!contractId.value)

const { loading, error, fetchOne, save } = useCrud('/api/contracts/')

const emptyForm = () => ({
  number: '', signing_date: '', value: '', validity_days: '', is_active: true, company: '',
})
const form = ref(emptyForm())
const companies = ref([])

onMounted(async () => {
  const res = await fetch('/api/companies/')
  companies.value = await res.json()
})

watch(
  () => route.params.contractId,
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
  const payload = { ...form.value, construction: constructionId.value }
  const data = await save(payload, contractId.value)
  if (data) {
    toast.add(isEdit.value ? 'Contrato atualizado.' : 'Contrato cadastrado.')
    router.push(`/constructions/${constructionId.value}`)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-file-earmark-check' : 'bi-file-earmark-plus'"
        :title="isEdit ? 'Editar Contrato' : 'Cadastro de Contrato'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados do Contrato</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Número <span class="text-danger">*</span></label>
                <input v-model="form.number" type="text" class="form-control" required placeholder="Ex: CT-2024-001" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Data de Assinatura <span class="text-danger">*</span></label>
                <input v-model="form.signing_date" type="date" class="form-control" required />
              </div>

              <div class="col-md-6">
                <label class="form-label">Valor (R$) <span class="text-danger">*</span></label>
                <input v-model="form.value" type="number" step="0.01" class="form-control" required placeholder="0.00" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Validade (dias) <span class="text-danger">*</span></label>
                <input v-model="form.validity_days" type="number" step="1" min="1" class="form-control" required placeholder="365" />
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
                  <input v-model="form.is_active" type="checkbox" class="form-check-input" id="isActive" role="switch" />
                  <label class="form-check-label" for="isActive">Contrato ativo</label>
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
