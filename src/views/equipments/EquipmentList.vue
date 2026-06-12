<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { typeOf } from './types'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: equipments, loading, fetchAll, remove } = useCrud('/api/equipments/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left', sortable: true },
  { name: 'daily_rate', label: 'Diária', field: 'daily_rate', align: 'left', sortable: true },
  { name: 'company', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'is_available', label: 'Disponível', field: 'is_available', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return equipments.value
  return equipments.value.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      typeOf(e.type).label.toLowerCase().includes(q) ||
      (e.company_name ?? '').toLowerCase().includes(q),
  )
})

const availableCount = computed(() => equipments.value.filter((e) => e.is_available).length)

function goNew() {
  router.push('/equipments/new')
}

function goEdit(id) {
  router.push(`/equipments/${id}/edit`)
}

function askDelete(equipment) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o equipamento <strong>${equipment.name}</strong>?<br><span class="text-grey-5">Esta ação não pode ser desfeita.</span>`,
    html: true,
    dark: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
    persistent: true,
  }).onOk(() => doDelete(equipment))
}

async function doDelete(equipment) {
  const ok = await remove(equipment.id)
  if (ok !== null) {
    equipments.value = equipments.value.filter((e) => e.id !== equipment.id)
    $q.notify({
      type: 'positive',
      message: `Equipamento "${equipment.name}" excluído.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir equipamento.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="list-page">
    <HeroHeader
      v-model:search="search"
      icon="precision_manufacturing"
      title="Equipamentos"
      subtitle="Maquinário e frota cadastrados"
      search-placeholder="Buscar equipamento..."
      new-label="Novo equipamento"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="equipments.length" label="Total" icon="precision_manufacturing" color="#818cf8" />
        <StatCard :value="availableCount" label="Disponíveis" icon="check_circle" color="#34d399" />
        <StatCard :value="equipments.length - availableCount" label="Indisponíveis" icon="remove_circle" color="#fb7185" />
      </template>
    </HeroHeader>

    <TableSkeleton v-if="loading" :columns="columns" :rows="6" />

    <q-card v-else flat class="table-card">
      <q-table
        :rows="filtered"
        :columns="columns"
        row-key="id"
        flat
        dark
        :pagination="pagination"
        :rows-per-page-options="[8, 16, 30, 0]"
        class="list-table"
        rows-per-page-label="Por página"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="name-cell">
              <div class="type-tile" :style="{ background: typeOf(props.row.type).color + '22', color: typeOf(props.row.type).color }">
                <q-icon :name="typeOf(props.row.type).icon" size="18px" />
              </div>
              <span class="name-text">{{ props.row.name }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-type="props">
          <q-td :props="props">
            <SoftChip
              :color="typeOf(props.row.type).color"
              :icon="typeOf(props.row.type).icon"
              :label="typeOf(props.row.type).label"
            />
          </q-td>
        </template>

        <template #body-cell-daily_rate="props">
          <q-td :props="props" class="mono text-grey-4">
            R$ {{ Number(props.row.daily_rate).toFixed(2) }}
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props" class="text-grey-4">
            {{ props.row.company_name ?? '—' }}
          </q-td>
        </template>

        <template #body-cell-is_available="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_available ? '#34d399' : '#94a3b8'"
              :icon="props.row.is_available ? 'check_circle' : 'remove_circle'"
              :label="props.row.is_available ? 'Disponível' : 'Indisponível'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn flat round dense color="indigo-3" icon="edit" @click="goEdit(props.row.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense color="red-4" icon="delete" @click="askDelete(props.row)">
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center empty">
            <div class="empty-tile">
              <q-icon name="precision_manufacturing" size="30px" />
            </div>
            <div class="empty-text">
              {{ search ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento cadastrado.' }}
            </div>
            <q-btn
              v-if="!search"
              unelevated
              no-caps
              icon="add"
              label="Cadastrar primeiro equipamento"
              class="btn-accent q-mt-md"
              @click="goNew"
            />
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style scoped>
.type-tile {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
</style>
