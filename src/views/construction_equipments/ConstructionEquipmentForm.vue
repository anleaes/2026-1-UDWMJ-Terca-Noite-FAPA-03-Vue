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
const allocationId = computed(() => (route.params.allocationId ? Number(route.params.allocationId) : null))
const isEdit = computed(() => !!allocationId.value)

const { loading, error, fetchOne, save } = useCrud('/api/constructionequipments/')

const emptyForm = () => ({ equipment: '', allocation_date: '', return_date: '' })
const form = ref(emptyForm())
const equipmentOptions = ref([])

onMounted(async () => {
  const constructionData = await fetch(`/api/constructions/${constructionId.value}/`).then((r) => r.json())
  const all = await fetch('/api/equipments/').then((r) => r.json())
  const fromSameCompany = all.filter((e) => e.company === constructionData.company)
  const filtered = isEdit.value ? fromSameCompany : fromSameCompany.filter((e) => e.is_available)
  equipmentOptions.value = filtered.map((e) => ({ label: e.name, value: e.id }))
})

watch(
  () => route.params.allocationId,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      if (data)
        form.value = {
          equipment: data.equipment,
          allocation_date: data.allocation_date,
          return_date: data.return_date ?? '',
        }
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
  const payload = { ...form.value, construction: constructionId.value }
  if (!payload.return_date) delete payload.return_date
  const data = await save(payload, allocationId.value)
  if (data) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Alocação atualizada.' : 'Equipamento alocado.',
      icon: 'check_circle',
      position: 'bottom-right',
    })
    router.push(`/constructions/${constructionId.value}`)
  }
}
</script>

<template>
  <div class="form-page">
    <q-card flat class="form-card">
      <FormHeader
        :icon="isEdit ? 'edit' : 'handyman'"
        :title="isEdit ? 'Editar Alocação' : 'Alocar Equipamento'"
        subtitle="Dados da alocação de equipamento na obra"
        :back-to="`/constructions/${constructionId}`"
      />

      <q-form @submit.prevent="submit" class="form-body">
        <div class="section-label">Dados da Alocação</div>

        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-select
              v-model="form.equipment"
              dark
              :options="equipmentOptions"
              label="Equipamento *"
              outlined
              color="indigo-3"
              popup-content-class="dark-popup"
              emit-value
              map-options
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="construction" /></template>
              <template #hint>
                <span v-if="!isEdit">Exibindo apenas equipamentos disponíveis da empresa desta obra.</span>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.allocation_date"
              type="date"
              dark
              label="Data de Alocação *"
              outlined
              color="indigo-3"
              :rules="[required]"
              lazy-rules
            >
              <template #prepend><q-icon name="event" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.return_date"
              type="date"
              dark
              label="Data de Devolução"
              outlined
              color="indigo-3"
              hint="Preencher ao devolver. O custo será calculado automaticamente."
            >
              <template #prepend><q-icon name="event_available" /></template>
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
          <q-btn flat no-caps color="grey-5" label="Cancelar" :to="`/constructions/${constructionId}`" />
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
