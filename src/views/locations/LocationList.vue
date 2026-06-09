<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrud } from '../../composables/useCrud'

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

function softStyle(hex) {
  return { background: `${hex}22`, color: hex, border: `1px solid ${hex}33` }
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
    <header class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-top">
          <div class="hero-title-wrap">
            <div class="hero-icon">
              <q-icon name="location_on" size="26px" />
            </div>
            <div>
              <h1 class="hero-title">Locais</h1>
              <p class="hero-subtitle">Gestão dos locais de obra de infraestrutura</p>
            </div>
          </div>

          <div class="hero-actions">
            <q-input
              v-model="search"
              dark
              dense
              borderless
              placeholder="Buscar local..."
              class="hero-search"
              clearable
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <q-btn
              unelevated
              no-caps
              icon="add"
              label="Novo local"
              class="btn-new"
              @click="goNew"
            />
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ locations.length }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ pavedCount }}</span>
            <span class="stat-label">Pavimentados</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ typesCount }}</span>
            <span class="stat-label">Tipos diferentes</span>
          </div>
        </div>
      </div>
    </header>

    <q-card flat class="table-card">
      <q-table
        :rows="filtered"
        :columns="columns"
        row-key="id"
        flat
        dark
        :loading="loading"
        :pagination="pagination"
        :rows-per-page-options="[8, 16, 30, 0]"
        class="loc-table"
        rows-per-page-label="Por página"
      >
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>

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
            <span class="soft-chip" :style="softStyle(typeOf(props.row.type).color)">
              <q-icon :name="typeOf(props.row.type).icon" size="14px" />
              {{ typeOf(props.row.type).label }}
            </span>
          </q-td>
        </template>

        <template #body-cell-is_paved="props">
          <q-td :props="props">
            <span class="soft-chip" :style="softStyle(props.row.is_paved ? '#34d399' : '#94a3b8')">
              <q-icon :name="props.row.is_paved ? 'check_circle' : 'remove_circle'" size="14px" />
              {{ props.row.is_paved ? 'Sim' : 'Não' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense color="indigo-3" icon="edit" @click="goEdit(props.row.id)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="red-4" icon="delete" @click="askDelete(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="empty">
            <q-icon name="inbox" size="56px" />
            <div class="empty-text">
              {{ search ? 'Nenhum local encontrado.' : 'Nenhum local cadastrado ainda.' }}
            </div>
            <q-btn
              v-if="!search"
              unelevated
              no-caps
              icon="add"
              label="Cadastrar o primeiro"
              class="btn-new q-mt-md"
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

.hero {
  position: relative;
  border-radius: 22px;
  padding: 28px 30px;
  overflow: hidden;
  background:
    radial-gradient(120% 140% at 0% 0%, #2b2f55 0%, transparent 55%),
    linear-gradient(135deg, #1b1e2e 0%, #14161f 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 18px 50px rgba(8, 10, 20, 0.45);
}
.hero-glow {
  position: absolute;
  top: -90px;
  right: -40px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}
.hero-content {
  position: relative;
  z-index: 1;
}
.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.hero-title-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8px 22px rgba(99, 102, 241, 0.5);
}
.hero-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f1f5f9;
}
.hero-subtitle {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: #8b93a7;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hero-search {
  min-width: 230px;
  padding: 2px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-new {
  border-radius: 12px;
  padding: 8px 18px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.stats {
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.stat {
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  min-width: 120px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.1;
}
.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #7c8499;
  margin-top: 2px;
}

.table-card {
  border-radius: 20px;
  overflow: hidden;
  background: #181b26;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 18px 50px rgba(8, 10, 20, 0.4);
}
.loc-table {
  background: transparent;
}
.loc-table :deep(thead th) {
  background: rgba(255, 255, 255, 0.02);
  color: #7c8499;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
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
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  color: #7c8499;
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

.soft-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 20px;
  color: #6b7488;
}
.empty-text {
  margin-top: 10px;
  font-size: 1rem;
}
</style>
