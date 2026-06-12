<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { typeOptions } from './types'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { loading, error, fetchOne, save } = useCrud('/api/equipments/')

const companyId = computed(() => (route.params.companyId ? Number(route.params.companyId) : null))
const fromCompany = computed(() => !!companyId.value)
const isEdit = computed(() => !!route.params.id)

const backRoute = computed(() =>
  fromCompany.value ? `/companies/${companyId.value}/equipments` : '/equipments',
)

const emptyForm = () => ({
  name: '',
  type: '',
  daily_rate: '',
  company: companyId.value ?? '',
  is_available: true,
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

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value
        ? 'Equipamento atualizado com sucesso.'
        : 'Equipamento cadastrado com sucesso.',
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
        :icon="isEdit ? 'build' : 'add_box'"
        :title="isEdit ? 'Editar Equipamento' : 'Novo Equipamento'"
        subtitle="Preencha os dados do equipamento"
        :back-to="backRoute"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados do equipamento</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="form.name"
              dark
              label="Nome *"
              outlined
              color="indigo-3"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="precision_manufacturing" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="form.type"
              dark
              :options="typeOptions"
              label="Tipo *"
              outlined
              color="indigo-3"
              popup-content-class="dark-popup"
              emit-value
              map-options
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="category" /></template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.daily_rate"
              dark
              type="number"
              step="0.01"
              label="Diária (R$)"
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
            <div class="toggle-box" :class="{ on: form.is_available }">
              <div class="toggle-info">
                <q-icon name="check_circle" size="22px" />
                <div>
                  <div class="toggle-title">Disponível para uso</div>
                  <div class="toggle-hint">Equipamento está disponível?</div>
                </div>
              </div>
              <q-toggle v-model="form.is_available" color="indigo-4" size="lg" />
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
