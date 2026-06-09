<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: citizens, loading, fetchAll, remove } = useCrud('/api/citizens/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')

const columns = [
  { name: 'name', label: 'Nome completo', field: 'first_name', align: 'left', sortable: true },
  { name: 'national_id', label: 'CPF', field: 'national_id', align: 'left', sortable: true },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  {
    name: 'registration_number',
    label: 'Nº Cadastro',
    field: 'registration_number',
    align: 'left',
    sortable: true,
  },
  {
    name: 'neighborhood_association',
    label: 'Associação',
    field: 'neighborhood_association',
    align: 'left',
  },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return citizens.value
  return citizens.value.filter(
    (c) =>
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.national_id?.toLowerCase().includes(q) ||
      c.neighborhood_association?.toLowerCase().includes(q),
  )
})

const withEmail = computed(() => citizens.value.filter((c) => c.email).length)
const associations = computed(
  () => new Set(citizens.value.map((c) => c.neighborhood_association).filter(Boolean)).size,
)

function fullName(c) {
  return `${c.first_name} ${c.last_name}`.trim()
}

function initials(c) {
  return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

function goNew() {
  router.push('/citizens/new')
}

function goEdit(id) {
  router.push(`/citizens/${id}/edit`)
}

function askDelete(citizen) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o cidadão <strong>${fullName(citizen)}</strong>?<br><span class="text-grey-5">Esta ação não pode ser desfeita.</span>`,
    html: true,
    dark: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
    persistent: true,
  }).onOk(() => doDelete(citizen))
}

async function doDelete(citizen) {
  const name = fullName(citizen)
  const ok = await remove(citizen.id)
  if (ok !== null) {
    citizens.value = citizens.value.filter((c) => c.id !== citizen.id)
    $q.notify({
      type: 'positive',
      message: `Cidadão "${name}" excluído.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir cidadão.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="cit-page">
    <HeroHeader
      v-model:search="search"
      icon="badge"
      title="Cidadãos"
      subtitle="Cadastro de cidadãos e associações de bairro"
      search-placeholder="Buscar por nome, CPF..."
      new-label="Novo cidadão"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="citizens.length" label="Total" icon="groups" color="#818cf8" />
        <StatCard :value="withEmail" label="Com e-mail" icon="mail" color="#22d3ee" />
        <StatCard :value="associations" label="Associações" icon="diversity_3" color="#34d399" />
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
        class="cit-table"
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
          <q-td :props="props" class="mono">{{ props.row.national_id || '—' }}</q-td>
        </template>

        <template #body-cell-phone="props">
          <q-td :props="props" class="mono text-grey-5">{{ props.row.phone || '—' }}</q-td>
        </template>

        <template #body-cell-registration_number="props">
          <q-td :props="props" class="text-grey-5">{{ props.row.registration_number || '—' }}</q-td>
        </template>

        <template #body-cell-neighborhood_association="props">
          <q-td :props="props">
            <SoftChip
              v-if="props.row.neighborhood_association"
              color="#8b5cf6"
              icon="diversity_3"
              :label="props.row.neighborhood_association"
            />
            <span v-else class="text-grey-7">—</span>
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
              {{ search ? 'Nenhum cidadão encontrado.' : 'Nenhum cidadão cadastrado ainda.' }}
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

<style scoped>
.cit-page {
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
.cit-table {
  background: transparent;
}
.cit-table :deep(thead th) {
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
.cit-table :deep(tbody td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 0.9rem;
}
.cit-table :deep(tbody tr) {
  transition: background 0.15s ease;
}
.cit-table :deep(tbody tr:hover) {
  background: rgba(99, 102, 241, 0.08);
}
.cit-table :deep(.q-table__bottom) {
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
.cit-table :deep(tbody tr:hover) .row-actions,
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
