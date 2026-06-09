<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import { positionOf } from '../employees/positions'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { remove } = useCrud('/api/employees/')

const companyId = computed(() => Number(route.params.companyId))

const companyName = ref('')
const employees = ref([])
const loading = ref(true)
const search = ref('')

const columns = [
  { name: 'name', label: 'Nome completo', field: 'first_name', align: 'left', sortable: true },
  { name: 'national_id', label: 'CPF', field: 'national_id', align: 'left', sortable: true },
  { name: 'position', label: 'Cargo', field: 'position', align: 'left', sortable: true },
  { name: 'is_active', label: 'Ativo', field: 'is_active', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

onMounted(async () => {
  const [companyData, allEmployees] = await Promise.all([
    fetch(`/api/companies/${companyId.value}/`).then((r) => r.json()),
    fetch('/api/employees/').then((r) => r.json()),
  ])
  companyName.value = companyData.corporate_name
  employees.value = allEmployees.filter((e) => e.company === companyId.value)
  loading.value = false
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return employees.value
  return employees.value.filter(
    (e) =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      e.national_id?.includes(q) ||
      positionOf(e.position).label.toLowerCase().includes(q),
  )
})

const activeCount = computed(() => employees.value.filter((e) => e.is_active).length)

function fullName(e) {
  return `${e.first_name} ${e.last_name}`.trim()
}

function initials(e) {
  return `${e.first_name?.[0] ?? ''}${e.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

function goNew() {
  router.push(`/companies/${companyId.value}/employees/new`)
}

function goEdit(id) {
  router.push(`/companies/${companyId.value}/employees/${id}/edit`)
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
</script>

<template>
  <div class="emp-page">
    <HeroHeader
      v-model:search="search"
      icon="groups"
      :title="companyName ? `Funcionários — ${companyName}` : 'Funcionários'"
      subtitle="Equipe vinculada a esta empresa"
      search-placeholder="Buscar funcionário..."
      new-label="Novo funcionário"
      back-to="/companies"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="employees.length" label="Total" icon="groups" color="#818cf8" />
        <StatCard :value="activeCount" label="Ativos" icon="check_circle" color="#34d399" />
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
        class="emp-table"
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
          <div class="empty">
            <div class="empty-tile">
              <q-icon name="person_off" size="30px" />
            </div>
            <div class="empty-text">
              {{ search ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário nesta empresa.' }}
            </div>
            <q-btn
              v-if="!search"
              unelevated
              no-caps
              icon="add"
              label="Adicionar funcionário"
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
.emp-page {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.table-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}
.emp-table {
  background: transparent;
}
.emp-table :deep(thead th) {
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-3);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle);
  padding-top: 16px;
  padding-bottom: 16px;
}
.emp-table :deep(tbody td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 0.9rem;
}
.emp-table :deep(tbody tr) {
  transition: background 0.15s ease;
}
.emp-table :deep(tbody tr:hover) {
  background: rgba(99, 102, 241, 0.08);
}
.emp-table :deep(.q-table__bottom) {
  border-top: 1px solid var(--border-subtle);
  color: var(--text-3);
}

.mono {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}
.name-text {
  font-weight: 600;
  color: #e9edf5;
}

.row-actions {
  display: inline-flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.18s var(--ease);
}
.emp-table :deep(tbody tr:hover) .row-actions,
.row-actions:focus-within {
  opacity: 1;
}
@media (hover: none) {
  .row-actions {
    opacity: 1;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 20px;
  color: var(--text-3);
}
.empty-tile {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
  margin-bottom: 16px;
}
.empty-text {
  font-size: 1rem;
}
</style>
