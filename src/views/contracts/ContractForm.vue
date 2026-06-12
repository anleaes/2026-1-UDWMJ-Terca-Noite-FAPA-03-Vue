<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const constructionId = computed(() => Number(route.params.id))
const contractId = computed(() => (route.params.contractId ? Number(route.params.contractId) : null))
const isEdit = computed(() => !!contractId.value)
const backTo = computed(() => `/constructions/${constructionId.value}`)

const { loading, error, fetchOne, save } = useCrud('/api/contracts/')

const emptyForm = () => ({
  number: '',
  signing_date: '',
  value: '',
  validity_days: '',
  is_active: true,
  company: '',
})
const form = ref(emptyForm())
const companies = ref([])

onMounted(async () => {
  const res = await fetch('/api/companies/')
  const data = await res.json()
  companies.value = data.map((c) => ({ label: c.corporate_name, value: c.id }))
})

watch(
  () => route.params.contractId,
  async (id) => {
    form.value = id ? (await fetchOne(id)) ?? emptyForm() : emptyForm()
  },
  { immediate: true },
)

const apiErrors = computed(() =>
  error.value
    ? Object.entries(error.value).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
    : [],
)

const required = (v) => (!!v && String(v).trim().length > 0) || 'Campo obrigatório'

async function submit() {
  const payload = { ...form.value, construction: constructionId.value }
  const data = await save(payload, contractId.value)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Contrato atualizado com sucesso.' : 'Contrato cadastrado com sucesso.',
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
        :icon="isEdit ? 'edit_document' : 'post_add'"
        :title="isEdit ? 'Editar Contrato' : 'Novo Contrato'"
        subtitle="Preencha os dados do contrato"
        :back-to="backTo"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados do Contrato</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.number"
              dark
              outlined
              color="indigo-3"
              label="Número *"
              placeholder="Ex: CT-2024-001"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="tag" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.signing_date"
              dark
              outlined
              color="indigo-3"
              label="Data de Assinatura *"
              type="date"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="calendar_today" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.value"
              dark
              outlined
              color="indigo-3"
              label="Valor (R$) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="attach_money" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.validity_days"
              dark
              outlined
              color="indigo-3"
              label="Validade (dias) *"
              type="number"
              step="1"
              min="1"
              placeholder="365"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="hourglass_top" /></template>
            </q-input>
          </div>

          <div class="col-12">
            <q-select
              v-model="form.company"
              dark
              outlined
              color="indigo-3"
              label="Empresa *"
              :options="companies"
              emit-value
              map-options
              popup-content-class="dark-popup"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="business" /></template>
            </q-select>
          </div>

          <div class="col-12">
            <div class="toggle-box" :class="{ on: form.is_active }">
              <div class="toggle-info">
                <q-icon name="verified" size="22px" />
                <div>
                  <div class="toggle-title">Contrato ativo</div>
                  <div class="toggle-hint">O contrato está em vigor?</div>
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
