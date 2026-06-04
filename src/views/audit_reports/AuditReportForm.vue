<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const constructionId = computed(() => Number(route.params.id))
const inspectionId = computed(() => Number(route.params.inspectionId))

const { loading, error, save } = useCrud('/api/audit-reports/')

const emptyForm = () => ({ number: '', issue_date: '', conclusion: '', is_approved: false })
const form = ref(emptyForm())
const existingId = ref(null)
const isEdit = computed(() => !!existingId.value)
const pageLoading = ref(true)

onMounted(async () => {
  const allReports = await fetch('/api/audit-reports/').then((r) => r.json())
  const found = allReports.find((r) => r.inspection === inspectionId.value) ?? null
  if (found) {
    existingId.value = found.id
    form.value = { number: found.number, issue_date: found.issue_date, conclusion: found.conclusion, is_approved: found.is_approved }
  }
  pageLoading.value = false
})

async function submit() {
  const payload = { ...form.value, inspection: inspectionId.value }
  const data = await save(payload, existingId.value)
  if (data) {
    toast.add(isEdit.value ? 'Laudo atualizado.' : 'Laudo emitido.')
    router.push(`/constructions/${constructionId.value}`)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        icon="bi-file-earmark-check"
        :title="isEdit ? 'Editar Laudo de Auditoria' : 'Emitir Laudo de Auditoria'"
      >
        <div v-if="pageLoading" class="p-4">
          <div class="row g-3">
            <div v-for="i in 4" :key="i" class="col-md-6">
              <span class="skeleton d-block mb-2" style="width: 80px; height: 14px"></span>
              <span class="skeleton d-block" style="height: 38px; border-radius: 6px"></span>
            </div>
          </div>
        </div>

        <div v-else class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados do Laudo</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Número do Laudo <span class="text-danger">*</span></label>
                <input v-model="form.number" type="text" class="form-control" required placeholder="Ex: LAU-2024-001" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Data de Emissão <span class="text-danger">*</span></label>
                <input v-model="form.issue_date" type="date" class="form-control" required />
              </div>

              <div class="col-12">
                <label class="form-label">Conclusão <span class="text-danger">*</span></label>
                <textarea v-model="form.conclusion" class="form-control" rows="5" required placeholder="Descreva a conclusão da auditoria..."></textarea>
              </div>

              <div class="col-12">
                <div class="form-check form-switch">
                  <input v-model="form.is_approved" type="checkbox" class="form-check-input" id="isApproved" role="switch" />
                  <label class="form-check-label" for="isApproved">Aprovado</label>
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
                {{ isEdit ? 'Atualizar' : 'Emitir Laudo' }}
              </button>
            </div>
          </form>
        </div>
      </AppCard>
    </div>
  </div>
</template>
