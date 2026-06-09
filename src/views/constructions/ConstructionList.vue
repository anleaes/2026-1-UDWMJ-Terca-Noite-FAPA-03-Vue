<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { useCompanyMap } from '../../composables/useCompanyMap'
import { statusOf, typeOf } from './constructions'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: constructions, loading, fetchAll, remove } = useCrud('/api/constructions/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')
const { companyMap, fetchCompanyMap } = useCompanyMap()

const columns = [
  { name: 'title', label: 'Título', field: 'title', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'start_date', label: 'Início', field: 'start_date', align: 'left', sortable: true },
  {
    name: 'expected_end_date',
    label: 'Término Previsto',
    field: 'expected_end_date',
    align: 'left',
    sortable: true,
  },
  { name: 'company', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'title' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return constructions.value
  return constructions.value.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      typeOf(c.type).label.toLowerCase().includes(q) ||
      statusOf(c.status).label.toLowerCase().includes(q),
  )
})

const inProgressCount = computed(
  () => constructions.value.filter((c) => c.status === 'in_progress').length,
)
const completedCount = computed(
  () => constructions.value.filter((c) => c.status === 'completed').length,
)

function goNew() {
  router.push('/constructions/new')
}

function goEdit(id) {
  router.push(`/constructions/${id}/edit`)
}

function goDetail(id) {
  router.push(`/constructions/${id}`)
}

function askDelete(construction) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Excluir <strong>${construction.title}</strong>?`,
    html: true,
    dark: true,
    persistent: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
  }).onOk(() => doDelete(construction))
}

async function doDelete({ id, title }) {
  const ok = await remove(id)
  if (ok !== null) {
    constructions.value = constructions.value.filter((c) => c.id !== id)
    $q.notify({
      type: 'positive',
      message: `"${title}" excluída.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir obra.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(() => Promise.all([fetchAll(), fetchCompanyMap()]))
</script>

<template>
  <div>
    <HeroHeader
      v-model:search="search"
      icon="construction"
      title="Obras"
      subtitle="Gerencie as obras cadastradas"
      search-placeholder="Buscar obra..."
      new-label="Nova obra"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="constructions.length" label="Total" icon="construction" color="#818cf8" />
        <StatCard :value="inProgressCount" label="Em Andamento" icon="pending" color="#38bdf8" />
        <StatCard :value="completedCount" label="Concluídas" icon="check_circle" color="#34d399" />
      </template>
    </HeroHeader>

    <TableSkeleton v-if="loading" :columns="columns" :rows="6" />
    <q-card v-else flat class="table-card">
      <q-table
        dark
        flat
        :rows="filtered"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        @row-click="(_, row) => goDetail(row.id)"
      >
        <template #body-cell-title="props">
          <q-td :props="props">
            <div class="row items-center no-wrap title-cell">
              <div
                class="type-tile"
                :style="{
                  background: typeOf(props.row.type).color + '22',
                  color: typeOf(props.row.type).color,
                }"
              >
                <q-icon :name="typeOf(props.row.type).icon" size="16px" />
              </div>
              <span class="text-weight-medium">{{ props.row.title }}</span>
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

        <template #body-cell-status="props">
          <q-td :props="props">
            <SoftChip
              :color="statusOf(props.row.status).color"
              :icon="statusOf(props.row.status).icon"
              :label="statusOf(props.row.status).label"
            />
          </q-td>
        </template>

        <template #body-cell-start_date="props">
          <q-td :props="props">
            <span class="mono">{{ props.row.start_date ?? '—' }}</span>
          </q-td>
        </template>

        <template #body-cell-expected_end_date="props">
          <q-td :props="props">
            <span class="mono">{{ props.row.expected_end_date ?? '—' }}</span>
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props">
            {{ companyMap[props.row.company] ?? '—' }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="indigo-3"
                @click.stop="goDetail(props.row.id)"
              >
                <q-tooltip>Detalhe</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="indigo-3"
                @click.stop="goEdit(props.row.id)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click.stop="askDelete(props.row)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center empty-state">
            <div class="empty-tile">
              <q-icon name="construction" size="32px" />
            </div>
            <p class="text-weight-medium q-mt-md q-mb-xs" style="color: var(--text-1)">
              {{ search ? 'Nenhuma obra encontrada.' : 'Nenhuma obra cadastrada.' }}
            </p>
            <q-btn
              v-if="!search"
              class="btn-accent q-mt-sm"
              unelevated
              no-caps
              label="Cadastrar a primeira"
              icon="add"
              @click="goNew"
            />
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style scoped>
.table-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-top: 20px;
}

.title-cell {
  gap: 10px;
}

.type-tile {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s;
}

:deep(tr:hover) .row-actions {
  opacity: 1;
}

@media (hover: none) {
  .row-actions {
    opacity: 1;
  }
}

.empty-state {
  padding: 48px;
}

.empty-tile {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--grad-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.mono {
  font-variant-numeric: tabular-nums;
}
</style>
