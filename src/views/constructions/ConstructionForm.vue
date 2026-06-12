<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { statusOptions, typeOptions } from './constructions'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { loading, error, fetchOne, save } = useCrud('/api/constructions/')

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  title: '',
  type: '',
  status: '',
  start_date: '',
  expected_end_date: '',
  total_value: '',
  location: '',
  company: '',
  employees: [],
  is_completed: false,
  photo: null,
  report: null,
})
const form = ref(emptyForm())

const photoFile = ref(null)
const reportFile = ref(null)

const locations = ref([])
const companies = ref([])
const allEmployees = ref([])

const employeeOptions = computed(() =>
  allEmployees.value
    .filter((e) => e.company === form.value.company)
    .map((e) => ({ label: `${e.first_name} ${e.last_name}`.trim(), value: e.id })),
)

onMounted(async () => {
  const [locRes, compRes, empRes] = await Promise.all([
    fetch('/api/locations/'),
    fetch('/api/companies/'),
    fetch('/api/employees/'),
  ])
  locations.value = (await locRes.json()).map((l) => ({ label: l.name, value: l.id }))
  companies.value = (await compRes.json()).map((c) => ({ label: c.corporate_name, value: c.id }))
  allEmployees.value = await empRes.json()
})

watchEffect(() => {
  if (!form.value.company || allEmployees.value.length === 0) return
  const validIds = new Set(employeeOptions.value.map((e) => e.value))
  form.value.employees = (form.value.employees ?? []).filter((id) => validIds.has(id))
})

watch(
  () => route.params.id,
  async (id) => {
    photoFile.value = null
    reportFile.value = null
    form.value = id ? (await fetchOne(id)) ?? emptyForm() : emptyForm()
  },
  { immediate: true },
)

const required = (v) => (!!v && String(v).trim().length > 0) || 'Campo obrigatório'

const apiErrors = computed(() =>
  error.value
    ? Object.entries(error.value).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
    : [],
)

async function submit() {
  const fd = new FormData()
  const skip = new Set(['photo', 'report', 'employees'])
  Object.entries(form.value).forEach(([k, v]) => {
    if (skip.has(k)) return
    if (v !== null && v !== undefined) fd.append(k, v)
  })
  ;(form.value.employees ?? []).forEach((id) => fd.append('employees', id))
  if (photoFile.value) fd.append('photo', photoFile.value)
  if (reportFile.value) fd.append('report', reportFile.value)

  const data = await save(fd, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({ type: 'positive', message: 'Obra salva com sucesso.', icon: 'check_circle', position: 'bottom-right' })
    router.push('/constructions')
  }
}
</script>

<template>
  <div>
    <FormHeader
      icon="construction"
      :title="isEdit ? 'Editar Obra' : 'Nova Obra'"
      :subtitle="isEdit ? 'Atualize os dados da obra' : 'Preencha os dados da obra'"
      back-to="/constructions"
    />

    <q-card flat class="form-card">
      <q-card-section>
        <q-form @submit.prevent="submit">
          <p class="section-label">Identificação</p>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.title"
                outlined
                dark
                color="indigo-3"
                label="Título"
                :rules="[required]"
                lazy-rules
                hide-bottom-space
              >
                <template #prepend><q-icon name="construction" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.type"
                outlined
                dark
                color="indigo-3"
                label="Tipo"
                emit-value
                map-options
                :options="typeOptions"
                :rules="[required]"
                lazy-rules
                hide-bottom-space
              >
                <template #prepend><q-icon name="category" /></template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.status"
                outlined
                dark
                color="indigo-3"
                label="Status"
                emit-value
                map-options
                :options="statusOptions"
                :rules="[required]"
                lazy-rules
                hide-bottom-space
              >
                <template #prepend><q-icon name="info" /></template>
              </q-select>
            </div>
          </div>

          <p class="section-label" style="margin-top: 16px">Datas e Valor</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.start_date"
                outlined
                dark
                color="indigo-3"
                label="Data de Início"
                type="date"
              >
                <template #prepend><q-icon name="event" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.expected_end_date"
                outlined
                dark
                color="indigo-3"
                label="Término Previsto"
                type="date"
              >
                <template #prepend><q-icon name="event_available" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.total_value"
                outlined
                dark
                color="indigo-3"
                label="Valor Total (R$)"
                type="number"
                step="0.01"
              >
                <template #prepend><q-icon name="attach_money" /></template>
              </q-input>
            </div>
          </div>

          <p class="section-label" style="margin-top: 16px">Vínculos</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.location"
                outlined
                dark
                color="indigo-3"
                label="Localização"
                emit-value
                map-options
                :options="locations"
                clearable
              >
                <template #prepend><q-icon name="place" /></template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.company"
                outlined
                dark
                color="indigo-3"
                label="Empresa"
                emit-value
                map-options
                :options="companies"
                :rules="[required]"
                lazy-rules
                hide-bottom-space
              >
                <template #prepend><q-icon name="business" /></template>
              </q-select>
            </div>

            <div class="col-12">
              <q-select
                v-model="form.employees"
                outlined
                dark
                color="indigo-3"
                label="Funcionários"
                emit-value
                map-options
                multiple
                use-chips
                :options="employeeOptions"
              >
                <template #prepend><q-icon name="groups" /></template>
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    color="indigo-8"
                    text-color="white"
                    class="q-ma-xs"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    {{ scope.opt.label }}
                  </q-chip>
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <div :class="['toggle-box', form.is_completed && 'on']">
                <div class="column">
                  <span class="toggle-title">Concluída</span>
                  <span class="toggle-sub">Marque quando a obra estiver finalizada</span>
                </div>
                <q-toggle v-model="form.is_completed" color="indigo" />
              </div>
            </div>
          </div>

          <p class="section-label">Arquivos</p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-file
                v-model="photoFile"
                outlined dark color="indigo-3"
                label="Foto"
                accept="image/*"
                clearable
              >
                <template #prepend><q-icon name="photo_camera" /></template>
              </q-file>
              <div v-if="form.photo && !photoFile" class="current-file">
                <q-icon name="photo_camera" size="14px" />
                <span>Atual:</span>
                <a :href="form.photo" target="_blank" class="current-file-link">
                  {{ form.photo.split('/').pop() }}
                </a>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <q-file
                v-model="reportFile"
                outlined dark color="indigo-3"
                label="Relatório"
                accept=".pdf,.doc,.docx"
                clearable
              >
                <template #prepend><q-icon name="description" /></template>
              </q-file>
              <div v-if="form.report && !reportFile" class="current-file">
                <q-icon name="description" size="14px" />
                <span>Atual:</span>
                <a :href="form.report" target="_blank" class="current-file-link">
                  {{ form.report.split('/').pop() }}
                </a>
              </div>
            </div>
          </div>

          <q-slide-transition>
            <q-banner v-if="apiErrors.length" rounded dark class="bg-negative q-mt-md">
              <template #avatar><q-icon name="error" /></template>
              <div v-for="msg in apiErrors" :key="msg">{{ msg }}</div>
            </q-banner>
          </q-slide-transition>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat no-caps label="Cancelar" color="grey-5" to="/constructions" />
            <q-btn
              type="submit"
              class="btn-accent"
              unelevated
              no-caps
              label="Salvar"
              icon="check_circle"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.form-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  max-width: 800px;
  margin: 20px auto 0;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  margin: 0 0 12px;
}

.toggle-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 32px;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.toggle-box.on {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.08);
}

.toggle-title {
  font-weight: 500;
  color: var(--text-1);
  font-size: 14px;
}

.toggle-sub {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.current-file {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-3);
}

.current-file-link {
  color: #818cf8;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
}

.current-file-link:hover {
  text-decoration: underline;
}
</style>
