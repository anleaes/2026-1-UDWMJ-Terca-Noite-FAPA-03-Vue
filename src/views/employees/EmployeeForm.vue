<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { useMask } from '../../composables/useMask'
import { positionOptions } from './positions'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { loading, error, fetchOne, save } = useCrud('/api/employees/')
const { isValidCPF } = useMask()

const companyId = computed(() => (route.params.companyId ? Number(route.params.companyId) : null))
const fromCompany = computed(() => !!companyId.value)
const isEdit = computed(() => !!route.params.id)

const backRoute = computed(() =>
  fromCompany.value ? `/companies/${companyId.value}/employees` : '/employees',
)

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  national_id: '',
  phone: '',
  email: '',
  address: '',
  position: '',
  hire_date: '',
  salary: '',
  company: companyId.value ?? '',
  is_active: true,
})
const form = ref(emptyForm())

const companies = ref([])
onMounted(async () => {
  if (!fromCompany.value) {
    const res = await fetch('/api/companies/')
    companies.value = await res.json()
  }
})

const companyOptions = computed(() =>
  companies.value.map((c) => ({ label: c.corporate_name, value: c.id })),
)

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

const apiErrors = computed(() => {
  if (!error.value) return []
  return Object.entries(error.value).map(
    ([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
  )
})

const required = (v) => (!!v && String(v).trim().length > 0) || 'Campo obrigatório'
const requiredNum = (v) => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'
const cpfRule = (v) => isValidCPF(v || '') || 'CPF inválido'

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value
        ? 'Funcionário atualizado com sucesso.'
        : 'Funcionário cadastrado com sucesso.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push(backRoute.value)
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'badge' : 'person_add'"
        :title="isEdit ? 'Editar Funcionário' : 'Novo Funcionário'"
        subtitle="Preencha os dados do funcionário"
        :back-to="backRoute"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados pessoais</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.first_name"
              dark
              label="Nome *"
              outlined
              color="indigo-3"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.last_name"
              dark
              label="Sobrenome *"
              outlined
              color="indigo-3"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="person_outline" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.national_id"
              dark
              label="CPF *"
              outlined
              color="indigo-3"
              mask="###.###.###-##"
              placeholder="000.000.000-00"
              :rules="[required, cpfRule]"
              lazy-rules
            >
              <template #prepend><q-icon name="badge" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.phone"
              dark
              label="Telefone"
              outlined
              color="indigo-3"
              mask="(##) #####-####"
              placeholder="(00) 00000-0000"
            >
              <template #prepend><q-icon name="call" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.email" dark type="email" label="E-mail" outlined color="indigo-3">
              <template #prepend><q-icon name="mail" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.address" dark label="Endereço" outlined color="indigo-3">
              <template #prepend><q-icon name="home" /></template>
            </q-input>
          </div>
        </div>

        <div class="section-label q-mt-lg">Dados profissionais</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.position"
              dark
              :options="positionOptions"
              label="Cargo *"
              outlined
              color="indigo-3"
              popup-content-class="dark-popup"
              emit-value
              map-options
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="work" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.hire_date"
              dark
              type="date"
              label="Data de Contratação"
              outlined
              color="indigo-3"
              class="date-input"
            >
              <template #prepend><q-icon name="event" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.salary"
              dark
              type="number"
              step="0.01"
              label="Salário (R$)"
              outlined
              color="indigo-3"
            >
              <template #prepend><q-icon name="payments" /></template>
            </q-input>
          </div>

          <div v-if="!fromCompany" class="col-12 col-md-6">
            <q-select
              v-model="form.company"
              dark
              :options="companyOptions"
              label="Empresa *"
              outlined
              color="indigo-3"
              popup-content-class="dark-popup"
              emit-value
              map-options
              :rules="[requiredNum]"
              lazy-rules
            >
              <template #prepend><q-icon name="domain" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <div class="toggle-box" :class="{ on: form.is_active }">
              <div class="toggle-info">
                <q-icon name="how_to_reg" size="22px" />
                <div>
                  <div class="toggle-title">Funcionário ativo</div>
                  <div class="toggle-hint">Está atualmente na ativa?</div>
                </div>
              </div>
              <q-toggle v-model="form.is_active" color="indigo-4" size="lg" />
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
          <q-btn flat no-caps color="grey-5" label="Cancelar" :to="backRoute" />
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
.form-page {
  max-width: 720px;
  margin: 0 auto;
}

.form-card {
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}

.form-body {
  padding: 26px 28px 28px;
}
.section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-3);
  font-weight: 600;
  margin-bottom: 16px;
}

.date-input :deep(input[type='date']) {
  color-scheme: dark;
}

.toggle-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-soft);
  transition: all 0.2s var(--ease);
}
.toggle-box.on {
  background: rgba(99, 102, 241, 0.12);
  border-color: var(--border-accent);
}
.toggle-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd2e0;
}
.toggle-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e9edf5;
  line-height: 1.1;
}
.toggle-hint {
  font-size: 0.74rem;
  color: var(--text-3);
}

.api-error {
  background: rgba(251, 113, 133, 0.08);
  border: 1px solid rgba(251, 113, 133, 0.3);
  color: #e9edf5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}
.btn-accent {
  padding: 8px 22px;
}
</style>
