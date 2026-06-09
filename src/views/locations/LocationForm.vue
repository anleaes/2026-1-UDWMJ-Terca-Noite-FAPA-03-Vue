<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'

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
      <header class="form-header">
        <div class="form-header-glow"></div>
        <div class="form-header-content">
          <q-btn flat round dense color="white" icon="arrow_back" to="/locations" class="back-btn">
            <q-tooltip>Voltar</q-tooltip>
          </q-btn>
          <div class="form-icon">
            <q-icon name="location_on" size="24px" />
          </div>
          <div>
            <h1 class="form-title">{{ isEdit ? 'Editar Local' : 'Novo Local' }}</h1>
            <p class="form-subtitle">Preencha os dados do local de obra</p>
          </div>
        </div>
      </header>

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
            <div class="paved-box" :class="{ on: form.is_paved }">
              <div class="paved-info">
                <q-icon name="add_road" size="22px" />
                <div>
                  <div class="paved-title">Pavimentado</div>
                  <div class="paved-hint">O local possui pavimentação?</div>
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
            class="btn-save"
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
  border-radius: 22px;
  overflow: hidden;
  background: #181b26;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 18px 50px rgba(8, 10, 20, 0.45);
}

.form-header {
  position: relative;
  overflow: hidden;
  padding: 24px 28px;
  background:
    radial-gradient(120% 160% at 0% 0%, #2b2f55 0%, transparent 55%),
    linear-gradient(135deg, #1b1e2e 0%, #14161f 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.form-header-glow {
  position: absolute;
  top: -80px;
  right: -40px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
  filter: blur(20px);
}
.form-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}
.back-btn {
  background: rgba(255, 255, 255, 0.06);
}
.form-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8px 22px rgba(99, 102, 241, 0.5);
}
.form-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f1f5f9;
}
.form-subtitle {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #8b93a7;
}

.form-body {
  padding: 26px 28px 28px;
}
.section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #7c8499;
  font-weight: 600;
  margin-bottom: 16px;
}

.paved-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}
.paved-box.on {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
}
.paved-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd2e0;
}
.paved-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e9edf5;
  line-height: 1.1;
}
.paved-hint {
  font-size: 0.74rem;
  color: #7c8499;
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
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.btn-save {
  border-radius: 12px;
  padding: 8px 22px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}
</style>
