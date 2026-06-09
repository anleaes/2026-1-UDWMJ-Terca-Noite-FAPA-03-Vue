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
const { loading, error, fetchOne, save } = useCrud('/api/citizens/')
const { isValidCPF } = useMask()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  national_id: '',
  phone: '',
  email: '',
  address: '',
  registration_number: '',
  neighborhood_association: '',
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
const cpfRule = (v) => isValidCPF(v || '') || 'CPF inválido'
const emailRule = (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'E-mail inválido'

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Cidadão atualizado com sucesso.' : 'Cidadão cadastrado com sucesso.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push('/citizens')
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'badge' : 'person_add'"
        :title="isEdit ? 'Editar Cidadão' : 'Novo Cidadão'"
        subtitle="Preencha os dados do cidadão"
        back-to="/citizens"
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
        </div>

        <div class="section-label q-mt-lg">Contato</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.email"
              dark
              type="email"
              label="E-mail"
              outlined
              color="indigo-3"
              :rules="[emailRule]"
              lazy-rules
            >
              <template #prepend><q-icon name="mail" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.address" dark label="Endereço" outlined color="indigo-3">
              <template #prepend><q-icon name="home" /></template>
            </q-input>
          </div>
        </div>

        <div class="section-label q-mt-lg">Cadastro</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.registration_number"
              dark
              label="Nº de Cadastro"
              outlined
              color="indigo-3"
            >
              <template #prepend><q-icon name="tag" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.neighborhood_association"
              dark
              label="Associação de Bairro"
              outlined
              color="indigo-3"
            >
              <template #prepend><q-icon name="diversity_3" /></template>
            </q-input>
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
          <q-btn flat no-caps color="grey-5" label="Cancelar" to="/citizens" />
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
