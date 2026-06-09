<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: companies, loading, fetchAll, remove } = useCrud('/api/companies/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')

const columns = [
  { name: 'name', label: 'Razão Social', field: 'corporate_name', align: 'left', sortable: true },
  { name: 'tax_id', label: 'CNPJ', field: 'corporate_tax_id', align: 'left', sortable: true },
  { name: 'contact', label: 'Contato', field: 'email', align: 'left' },
  { name: 'status', label: 'Status', field: 'is_active', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return companies.value
  return companies.value.filter(
    (c) =>
      c.corporate_name.toLowerCase().includes(q) ||
      c.corporate_tax_id.includes(q) ||
      c.email?.toLowerCase().includes(q),
  )
})

const activeCount = computed(() => companies.value.filter((c) => c.is_active).length)
const inactiveCount = computed(() => companies.value.filter((c) => !c.is_active).length)

function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0])
  return letters.join('').toUpperCase() || '?'
}

function goNew() {
  router.push('/companies/new')
}

function goEdit(id) {
  router.push(`/companies/${id}/edit`)
}

function goEmployees(id) {
  router.push(`/companies/${id}/employees`)
}

function goEquipments(id) {
  router.push(`/companies/${id}/equipments`)
}

function askDelete(company) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir a empresa <strong>${company.corporate_name}</strong>?<br><span class="text-grey-5">Esta ação não pode ser desfeita.</span>`,
    html: true,
    dark: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
    persistent: true,
  }).onOk(() => doDelete(company))
}

async function doDelete({ id, corporate_name }) {
  const ok = await remove(id)
  if (ok !== null) {
    companies.value = companies.value.filter((c) => c.id !== id)
    $q.notify({
      type: 'positive',
      message: `Empresa "${corporate_name}" excluída.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir empresa.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="comp-page">
    <HeroHeader
      v-model:search="search"
      icon="domain"
      title="Empresas"
      subtitle="Empresas contratadas e prestadoras de serviço"
      search-placeholder="Buscar por nome, CNPJ..."
      new-label="Nova empresa"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="companies.length" label="Total" icon="domain" color="#818cf8" />
        <StatCard :value="activeCount" label="Ativas" icon="check_circle" color="#34d399" />
        <StatCard :value="inactiveCount" label="Inativas" icon="cancel" color="#fb7185" />
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
        class="comp-table"
        rows-per-page-label="Por página"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="name-cell">
              <div class="avatar">{{ initials(props.row.corporate_name) }}</div>
              <span class="name-text">{{ props.row.corporate_name }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-tax_id="props">
          <q-td :props="props" class="mono text-grey-5">{{ props.row.corporate_tax_id || '—' }}</q-td>
        </template>

        <template #body-cell-contact="props">
          <q-td :props="props">
            <div class="contact-cell">
              <span class="contact-email">{{ props.row.email || '—' }}</span>
              <span v-if="props.row.phone" class="contact-phone">{{ props.row.phone }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_active ? '#34d399' : '#94a3b8'"
              :icon="props.row.is_active ? 'check_circle' : 'remove_circle'"
              :label="props.row.is_active ? 'Ativa' : 'Inativa'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn
                flat
                round
                dense
                color="green-4"
                icon="groups"
                @click="goEmployees(props.row.id)"
              >
                <q-tooltip>Funcionários</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="cyan-4"
                icon="construction"
                @click="goEquipments(props.row.id)"
              >
                <q-tooltip>Equipamentos</q-tooltip>
              </q-btn>
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
              <q-icon name="domain_disabled" size="30px" />
            </div>
            <div class="empty-text">
              {{ search ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa cadastrada ainda.' }}
            </div>
            <q-btn
              v-if="!search"
              unelevated
              no-caps
              icon="add"
              label="Cadastrar a primeira"
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
.comp-page {
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
.comp-table {
  background: transparent;
}
.comp-table :deep(thead th) {
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
.comp-table :deep(tbody td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 0.9rem;
}
.comp-table :deep(tbody tr) {
  transition: background 0.15s ease;
}
.comp-table :deep(tbody tr:hover) {
  background: rgba(99, 102, 241, 0.08);
}
.comp-table :deep(.q-table__bottom) {
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

.contact-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.contact-email {
  color: #e9edf5;
}
.contact-phone {
  font-size: 0.78rem;
  color: var(--text-3);
}

.row-actions {
  display: inline-flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.18s var(--ease);
}
.comp-table :deep(tbody tr:hover) .row-actions,
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
