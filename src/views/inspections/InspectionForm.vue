<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { statusFoundMap } from '../constructions/constructions'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const constructionId = computed(() => Number(route.params.id))
const inspectionId = computed(() => (route.params.inspectionId ? Number(route.params.inspectionId) : null))
const isEdit = computed(() => !!inspectionId.value)
const backTo = computed(() => `/constructions/${constructionId.value}`)

const { loading, error, fetchOne, save } = useCrud('/api/inspections/')

const statusFoundOptions = Object.entries(statusFoundMap).map(([value, { label }]) => ({ label, value }))

const emptyForm = () => ({
  visit_date: '',
  status_found: '',
  description: '',
  is_compliant: false,
  score: '',
  employee: '',
})
const form = ref(emptyForm())
const employeeOptions = ref([])

onMounted(async () => {
  const [construction, allEmployees] = await Promise.all([
    fetch(`/api/constructions/${constructionId.value}/`).then((r) => r.json()),
    fetch('/api/employees/').then((r) => r.json()),
  ])
  employeeOptions.value = allEmployees
    .filter((e) => e.company === construction.company)
    .map((e) => ({ label: `${e.first_name} ${e.last_name}`.trim(), value: e.id }))
})

watch(
  () => route.params.inspectionId,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      form.value = data
        ? { ...data, visit_date: data.visit_date ? data.visit_date.slice(0, 16) : '' }
        : emptyForm()
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

const apiErrors = computed(() =>
  error.value
    ? Object.entries(error.value).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
    : [],
)

const required = (v) => (!!v && String(v).trim().length > 0) || 'Campo obrigatório'
const requiredNum = (v) => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'

async function submit() {
  const payload = { ...form.value, construction: constructionId.value }
  const data = await save(payload, inspectionId.value)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Inspeção atualizada com sucesso.' : 'Inspeção cadastrada com sucesso.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push(backTo.value)
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'edit_note' : 'fact_check'"
        :title="isEdit ? 'Editar Inspeção' : 'Nova Inspeção'"
        subtitle="Preencha os dados da visita de inspeção"
        :back-to="backTo"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados da Visita</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.visit_date"
              dark
              outlined
              color="indigo-3"
              label="Data da Visita *"
              type="datetime-local"
              class="date-input"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="event" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="form.status_found"
              dark
              outlined
              color="indigo-3"
              label="Status Encontrado *"
              :options="statusFoundOptions"
              emit-value
              map-options
              popup-content-class="dark-popup"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="assessment" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.score"
              dark
              outlined
              color="indigo-3"
              label="Pontuação *"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="0.0 – 10.0"
              :rules="[requiredNum]"
              lazy-rules
            >
              <template #prepend><q-icon name="grade" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="form.employee"
              dark
              outlined
              color="indigo-3"
              label="Fiscal *"
              :options="employeeOptions"
              emit-value
              map-options
              popup-content-class="dark-popup"
              hint="Apenas funcionários da empresa desta obra"
              :rules="[requiredNum]"
              lazy-rules
            >
              <template #prepend><q-icon name="badge" /></template>
            </q-select>
          </div>

          <div class="col-12">
            <q-input
              v-model="form.description"
              dark
              outlined
              color="indigo-3"
              label="Descrição *"
              type="textarea"
              autogrow
              placeholder="Descreva as condições encontradas na visita..."
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="description" /></template>
            </q-input>
          </div>

          <div class="col-12">
            <div class="toggle-box" :class="{ on: form.is_compliant }">
              <div class="toggle-info">
                <q-icon name="verified" size="22px" />
                <div>
                  <div class="toggle-title">Em conformidade</div>
                  <div class="toggle-hint">A obra está dentro das normas?</div>
                </div>
              </div>
              <q-toggle v-model="form.is_compliant" color="indigo-4" size="lg" />
            </div>
          </div>
        </div>

        <q-slide-transition>
          <q-banner v-if="apiErrors.length" class="api-error q-mt-lg" rounded>
            <template #avatar><q-icon name="error" color="negative" /></template>
            <div class="text-weight-medium" style="color: #fb7185">Verifique os campos:</div>
            <ul class="q-my-xs q-pl-md">
              <li v-for="(msg, i) in apiErrors" :key="i">{{ msg }}</li>
            </ul>
          </q-banner>
        </q-slide-transition>

        <div class="form-actions">
          <q-btn flat no-caps color="grey-5" label="Cancelar" :to="backTo" />
          <q-btn
            type="submit"
            unelevated
            no-caps
            icon="check"
            label="Salvar"
            class="btn-accent"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<style scoped>
.date-input :deep(input[type='datetime-local']) {
  color-scheme: dark;
}
</style>
