<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { useCompanyMap } from '../../composables/useCompanyMap'
import { positionOf } from './positions'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: employees, loading, fetchAll, remove } = useCrud('/api/employees/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')
const { companyMap, fetchCompanyMap } = useCompanyMap()

const columns = [
  { name: 'name', label: 'Nome completo', field: 'first_name', align: 'left', sortable: true },
  { name: 'national_id', label: 'CPF', field: 'national_id', align: 'left', sortable: true },
  { name: 'position', label: 'Cargo', field: 'position', align: 'left', sortable: true },
  { name: 'company', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'is_active', label: 'Ativo', field: 'is_active', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return employees.value
  return employees.value.filter(
    (e) =>
      e.first_name.toLowerCase().includes(q) ||
      e.last_name.toLowerCase().includes(q) ||
      e.national_id?.toLowerCase().includes(q) ||
      positionOf(e.position).label.toLowerCase().includes(q),
  )
})

const activeCount = computed(() => employees.value.filter((e) => e.is_active).length)
const positionsCount = computed(
  () => new Set(employees.value.map((e) => e.position).filter(Boolean)).size,
)

function fullName(e) {
  return `${e.first_name} ${e.last_name}`.trim()
}

function initials(e) {
  return `${e.first_name?.[0] ?? ''}${e.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

function goNew() {
  router.push('/employees/new')
}

function goEdit(id) {
  router.push(`/employees/${id}/edit`)
}

function askDelete(employee) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o funcionário <strong>${fullName(employee)}</strong>?<br><span class="text-grey-5">Esta ação não pode ser desfeita.</span>`,
    html: true,
    dark: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
    persistent: true,
  }).onOk(() => doDelete(employee))
}

async function doDelete(employee) {
  const name = fullName(employee)
  const ok = await remove(employee.id)
  if (ok !== null) {
    employees.value = employees.value.filter((e) => e.id !== employee.id)
    $q.notify({
      type: 'positive',
      message: `Funcionário "${name}" excluído.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir funcionário.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(() => Promise.all([fetchAll(), fetchCompanyMap()]))
</script>

<template>
  <div class="list-page">
    <HeroHeader
      v-model:search="search"
      icon="badge"
      title="Funcionários"
      subtitle="Equipe das empresas contratadas"
      search-placeholder="Buscar por nome, CPF, cargo..."
      new-label="Novo funcionário"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="employees.length" label="Total" icon="groups" color="#818cf8" />
        <StatCard :value="activeCount" label="Ativos" icon="check_circle" color="#34d399" />
        <StatCard :value="positionsCount" label="Cargos" icon="work" color="#22d3ee" />
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
              <div class="avatar">{{ initials(props.row) }}</div>
              <span class="name-text">{{ fullName(props.row) }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-national_id="props">
          <q-td :props="props" class="mono text-grey-5">{{ props.row.national_id || '—' }}</q-td>
        </template>

        <template #body-cell-position="props">
          <q-td :props="props">
            <SoftChip
              :color="positionOf(props.row.position).color"
              :icon="positionOf(props.row.position).icon"
              :label="positionOf(props.row.position).label"
            />
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props" class="text-grey-5">
            {{ companyMap[props.row.company] ?? '—' }}
          </q-td>
        </template>

        <template #body-cell-is_active="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_active ? '#34d399' : '#94a3b8'"
              :icon="props.row.is_active ? 'check_circle' : 'remove_circle'"
              :label="props.row.is_active ? 'Sim' : 'Não'"
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
              <q-icon name="person_off" size="30px" />
            </div>
            <div class="empty-text">
              {{ search ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado ainda.' }}
            </div>
            <q-btn
              v-if="!search"
              unelevated
              no-caps
              icon="add"
              label="Cadastrar o primeiro"
              class="btn-accent q-mt-md"
              @click="goNew"
            />
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>
