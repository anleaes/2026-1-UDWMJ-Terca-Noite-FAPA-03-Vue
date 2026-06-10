<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import StatCard from '../../components/ui/StatCard.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const { items: locations, loading, fetchAll, remove } = useCrud('/api/locations/')
const router = useRouter()
const $q = useQuasar()

const search = ref('')

const typeMap = {
  STREET: { label: 'Rua', color: '#60a5fa', icon: 'add_road' },
  AVENUE: { label: 'Avenida', color: '#818cf8', icon: 'signpost' },
  SQUARE: { label: 'Praça', color: '#2dd4bf', icon: 'forest' },
  PARK: { label: 'Parque', color: '#34d399', icon: 'park' },
  ALLEY: { label: 'Viela', color: '#fbbf24', icon: 'alt_route' },
  OTHER: { label: 'Outro', color: '#94a3b8', icon: 'place' },
}

const columns = [
  { name: 'name', label: 'Local', field: 'name', align: 'left', sortable: true },
  { name: 'neighborhood', label: 'Bairro', field: 'neighborhood', align: 'left', sortable: true },
  { name: 'city', label: 'Cidade', field: 'city', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'center', sortable: true },
  { name: 'is_paved', label: 'Pavimentado', field: 'is_paved', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pagination = ref({ rowsPerPage: 8, sortBy: 'name' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return locations.value
  return locations.value.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.neighborhood?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q),
  )
})

const pavedCount = computed(() => locations.value.filter((l) => l.is_paved).length)
const typesCount = computed(() => new Set(locations.value.map((l) => l.type)).size)

function typeOf(value) {
  return typeMap[value] ?? { label: value, color: '#94a3b8', icon: 'place' }
}

function goNew() {
  router.push('/locations/new')
}

function goEdit(id) {
  router.push(`/locations/${id}/edit`)
}

function askDelete(location) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o local <strong>${location.name}</strong>?<br><span class="text-grey-5">Esta ação não pode ser desfeita.</span>`,
    html: true,
    dark: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
    persistent: true,
  }).onOk(() => doDelete(location))
}

async function doDelete({ id, name }) {
  const ok = await remove(id)
  if (ok !== null) {
    locations.value = locations.value.filter((l) => l.id !== id)
    $q.notify({
      type: 'positive',
      message: `Local "${name}" excluído.`,
      icon: 'check_circle',
      position: 'bottom-right',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir local.',
      icon: 'error',
      position: 'bottom-right',
    })
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="loc-page">
    <HeroHeader
      v-model:search="search"
      icon="location_on"
      title="Locais"
      subtitle="Gestão dos locais de obra de infraestrutura"
      search-placeholder="Buscar local..."
      new-label="Novo local"
      @new="goNew"
    >
      <template #stats>
        <StatCard :value="locations.length" label="Total" icon="location_on" color="#818cf8" />
        <StatCard :value="pavedCount" label="Pavimentados" icon="add_road" color="#34d399" />
        <StatCard :value="typesCount" label="Tipos diferentes" icon="category" color="#22d3ee" />
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
        class="loc-table"
        rows-per-page-label="Por página"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="name-cell">
              <div class="type-tile" :style="{ background: `${typeOf(props.row.type).color}22` }">
                <q-icon
                  :name="typeOf(props.row.type).icon"
                  size="18px"
                  :style="{ color: typeOf(props.row.type).color }"
                />
              </div>
              <span class="name-text">{{ props.row.name }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-neighborhood="props">
          <q-td :props="props" class="text-grey-5">{{ props.row.neighborhood || '—' }}</q-td>
        </template>

        <template #body-cell-city="props">
          <q-td :props="props" class="text-grey-5">{{ props.row.city || '—' }}</q-td>
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

        <template #body-cell-is_paved="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_paved ? '#34d399' : '#94a3b8'"
              :icon="props.row.is_paved ? 'check_circle' : 'remove_circle'"
              :label="props.row.is_paved ? 'Sim' : 'Não'"
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
              <q-icon name="location_off" size="30px" />
            </div>
            <div class="empty-text">
              {{ search ? 'Nenhum local encontrado.' : 'Nenhum local cadastrado ainda.' }}
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
.loc-page {
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
.loc-table {
  background: transparent;
}
.loc-table :deep(thead th) {
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
.loc-table :deep(tbody td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 0.9rem;
}
.loc-table :deep(tbody tr) {
  transition: background 0.15s ease;
}
.loc-table :deep(tbody tr:hover) {
  background: rgba(99, 102, 241, 0.08);
}
.loc-table :deep(.q-table__bottom) {
  border-top: 1px solid var(--border-subtle);
  color: var(--text-3);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.type-tile {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
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
.loc-table :deep(tbody tr:hover) .row-actions,
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
