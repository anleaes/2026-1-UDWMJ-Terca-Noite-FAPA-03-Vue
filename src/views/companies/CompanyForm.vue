<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { useMask } from '../../composables/useMask'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { loading, error, fetchOne, save } = useCrud('/api/companies/')
const { isValidCNPJ } = useMask()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  corporate_name: '',
  corporate_tax_id: '',
  email: '',
  phone: '',
  is_active: true,
})
const form = ref(emptyForm())

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
const cnpjRule = (v) => isValidCNPJ(v || '') || 'CNPJ inválido'
const emailRule = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v || '') || 'E-mail inválido'

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Empresa atualizada com sucesso.' : 'Empresa cadastrada com sucesso.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push('/companies')
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'domain' : 'add_business'"
        :title="isEdit ? 'Editar Empresa' : 'Nova Empresa'"
        subtitle="Preencha os dados da empresa"
        back-to="/companies"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados da Empresa</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="form.corporate_name"
              dark
              label="Razão Social *"
              outlined
              color="indigo-3"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="business" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.corporate_tax_id"
              dark
              label="CNPJ *"
              outlined
              color="indigo-3"
              mask="##.###.###/####-##"
              placeholder="00.000.000/0000-00"
              :rules="[required, cnpjRule]"
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

          <div class="col-12">
            <q-input
              v-model="form.email"
              dark
              type="email"
              label="E-mail *"
              outlined
              color="indigo-3"
              :rules="[required, emailRule]"
              lazy-rules
            >
              <template #prepend><q-icon name="mail" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <div class="toggle-box" :class="{ on: form.is_active }">
              <div class="toggle-info">
                <q-icon name="domain" size="22px" />
                <div>
                  <div class="toggle-title">Empresa ativa</div>
                  <div class="toggle-hint">A empresa está em atividade?</div>
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
          <q-btn flat no-caps color="grey-5" label="Cancelar" to="/companies" />
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
