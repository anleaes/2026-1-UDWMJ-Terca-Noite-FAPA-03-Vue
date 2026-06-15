<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import FormHeader from '../../components/ui/FormHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const constructionId = computed(() => Number(route.params.id))
const inspectionId = computed(() => Number(route.params.inspectionId))

const { loading, error, save } = useCrud('/api/audit-reports/')

const emptyForm = () => ({ number: '', issue_date: '', conclusion: '', is_approved: false })
const form = ref(emptyForm())
const existingId = ref(null)
const isEdit = computed(() => !!existingId.value)
const pageLoading = ref(true)

const backTo = computed(() => `/constructions/${constructionId.value}`)

onMounted(async () => {
  const allReports = await fetch('/api/audit-reports/').then((r) => r.json())
  const found = allReports.find((r) => r.inspection === inspectionId.value) ?? null
  if (found) {
    existingId.value = found.id
    form.value = {
      number: found.number,
      issue_date: found.issue_date,
      conclusion: found.conclusion,
      is_approved: found.is_approved,
    }
  }
  pageLoading.value = false
})

const apiErrors = computed(() => {
  if (!error.value) return []
  return Object.entries(error.value).map(
    ([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
  )
})

const required = (v) => (!!v && String(v).trim().length > 0) || 'Campo obrigatório'

async function submit() {
  const payload = { ...form.value, inspection: inspectionId.value }
  const data = await save(payload, existingId.value)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Laudo atualizado.' : 'Laudo emitido.',
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
        icon="fact_check"
        :title="isEdit ? 'Editar Laudo de Auditoria' : 'Emitir Laudo de Auditoria'"
        subtitle="Preencha os dados do laudo de auditoria"
        :back-to="backTo"
      />

      <div v-if="pageLoading" class="form-body">
        <q-skeleton type="text" width="140px" class="q-mb-lg" />
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6"><q-skeleton height="56px" /></div>
          <div class="col-12 col-md-6"><q-skeleton height="56px" /></div>
          <div class="col-12"><q-skeleton height="130px" /></div>
          <div class="col-12 col-md-6"><q-skeleton height="56px" /></div>
        </div>
      </div>

      <q-form v-else @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados do Laudo</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.number"
              dark
              label="Número do Laudo *"
              outlined
              color="indigo-3"
              placeholder="Ex: LAU-2024-001"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="tag" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.issue_date"
              dark
              label="Data de Emissão *"
              outlined
              color="indigo-3"
              type="date"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="calendar_today" /></template>
            </q-input>
          </div>

          <div class="col-12">
            <q-input
              v-model="form.conclusion"
              dark
              label="Conclusão *"
              outlined
              color="indigo-3"
              type="textarea"
              rows="5"
              placeholder="Descreva a conclusão da auditoria..."
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="rate_review" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <div class="toggle-box" :class="{ on: form.is_approved }">
              <div class="toggle-info">
                <q-icon name="verified" size="22px" />
                <div>
                  <div class="toggle-title">Aprovado</div>
                  <div class="toggle-hint">O laudo aprova a obra?</div>
                </div>
              </div>
              <q-toggle v-model="form.is_approved" color="indigo-4" size="lg" />
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
            v-if="isEdit"
            flat
            no-caps
            icon="picture_as_pdf"
            label="Exportar PDF"
            color="negative"
            :href="`/api/audit-reports/${constructionId}/${inspectionId}/export-pdf/`"
            target="_blank"
          />
          <q-btn
            type="submit"
            unelevated
            no-caps
            icon="check"
            :label="isEdit ? 'Atualizar' : 'Emitir Laudo'"
            class="btn-accent"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>
