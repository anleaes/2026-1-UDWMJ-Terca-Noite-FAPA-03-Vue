<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { loading, error, fetchOne, save } = useCrud('/api/locations/')

const isEdit = computed(() => !!route.params.id)

const typeOptions = [
  { label: 'Rua', value: 'STREET' },
  { label: 'Avenida', value: 'AVENUE' },
  { label: 'Praça', value: 'SQUARE' },
  { label: 'Parque', value: 'PARK' },
  { label: 'Viela', value: 'ALLEY' },
  { label: 'Outro', value: 'OTHER' },
]

const emptyForm = () => ({ name: '', neighborhood: '', city: '', type: '', is_paved: false })
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

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Local atualizado com sucesso.' : 'Local cadastrado com sucesso.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push('/locations')
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'edit_location_alt' : 'add_location_alt'"
        :title="isEdit ? 'Editar Local' : 'Novo Local'"
        subtitle="Preencha os dados do local de obra"
        back-to="/locations"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados do Local</div>

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
              <template #prepend><q-icon name="badge" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.neighborhood" dark label="Bairro" outlined color="indigo-3">
              <template #prepend><q-icon name="holiday_village" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.city" dark label="Cidade" outlined color="indigo-3">
              <template #prepend><q-icon name="location_city" /></template>
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
            <div class="toggle-box" :class="{ on: form.is_paved }">
              <div class="toggle-info">
                <q-icon name="add_road" size="22px" />
                <div>
                  <div class="toggle-title">Pavimentado</div>
                  <div class="toggle-hint">O local possui pavimentação?</div>
                </div>
              </div>
              <q-toggle v-model="form.is_paved" color="indigo-4" size="lg" />
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
          <q-btn flat no-caps color="grey-5" label="Cancelar" to="/locations" />
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
