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
const allocationId = computed(() => (route.params.allocationId ? Number(route.params.allocationId) : null))
const isEdit = computed(() => !!allocationId.value)

const { loading, error, fetchOne, save } = useCrud('/api/constructionequipments/')

const emptyForm = () => ({ equipment: '', allocation_date: '', return_date: '' })
const form = ref(emptyForm())
const equipments = ref([])

onMounted(async () => {
  const constructionData = await fetch(`/api/constructions/${constructionId.value}/`).then((r) => r.json())
  const all = await fetch('/api/equipments/').then((r) => r.json())
  const fromSameCompany = all.filter((e) => e.company === constructionData.company)
  equipments.value = isEdit.value ? fromSameCompany : fromSameCompany.filter((e) => e.is_available)
})

watch(
  () => route.params.allocationId,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      if (data) form.value = { equipment: data.equipment, allocation_date: data.allocation_date, return_date: data.return_date ?? '' }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

async function submit() {
  const payload = { ...form.value, construction: constructionId.value }
  if (!payload.return_date) delete payload.return_date
  const data = await save(payload, allocationId.value)
  if (data) {
    toast.add(isEdit.value ? 'Alocação atualizada.' : 'Equipamento alocado.')
    router.push(`/constructions/${constructionId.value}`)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-pencil-square' : 'bi-plus-square'"
        :title="isEdit ? 'Editar Alocação' : 'Alocar Equipamento'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados da Alocação</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Equipamento <span class="text-danger">*</span></label>
                <select v-model="form.equipment" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option v-for="e in equipments" :key="e.id" :value="e.id">
                    {{ e.name }}
                  </option>
                </select>
                <div v-if="!isEdit" class="form-text">Exibindo apenas equipamentos disponíveis da empresa desta obra.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Data de Alocação <span class="text-danger">*</span></label>
                <input v-model="form.allocation_date" type="date" class="form-control" required />
              </div>

              <div class="col-md-6">
                <label class="form-label">Data de Devolução</label>
                <input v-model="form.return_date" type="date" class="form-control" />
                <div class="form-text">Preencher ao devolver o equipamento. O custo será calculado automaticamente.</div>
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
