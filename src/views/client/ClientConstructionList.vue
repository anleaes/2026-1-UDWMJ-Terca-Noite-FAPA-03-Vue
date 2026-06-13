<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SoftChip from '../../components/ui/SoftChip.vue'
import { statusOf, typeOf } from '../constructions/constructions'

const router = useRouter()

const items = ref([])
const loading = ref(true)
const search = ref('')
const showFilters = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.location_city?.toLowerCase().includes(q) ||
      c.location_neighborhood?.toLowerCase().includes(q),
  )
})

onMounted(async () => {
  try {
    const res = await fetch('/api/constructions/client/')
    items.value = await res.json()
  } finally {
    loading.value = false
  }
})

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
</script>

<template>
  <div class="client-list">
    <!-- HEADER COMPACTO -->
    <div class="list-header">
      <div class="list-title-wrap">
        <div class="list-icon">
          <q-icon name="construction" size="20px" />
        </div>
        <h1 class="list-title">Obras</h1>
      </div>

      <div class="list-tools">
        <q-input
          v-model="search"
          dark dense borderless
          placeholder="Buscar obra..."
          class="list-search"
          clearable
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn
          unelevated no-caps
          class="filter-btn"
          icon="tune"
          label="Filtros"
          @click="showFilters = true"
        />
      </div>
    </div>

    <!-- LISTA -->
    <div v-if="loading" class="construction-list">
      <div v-for="i in 4" :key="i" class="card-skeleton">
        <div class="skeleton-block">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
        </div>
        <div class="skeleton-block right">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>
    </div>

    <div v-else-if="filtered.length" class="construction-list">
      <q-card
        v-for="item in filtered"
        :key="item.id"
        flat
        class="construction-card"
        @click="router.push(`/client/constructions/${item.id}`)"
      >
        <div class="card-main">
          <div class="card-chips">
            <SoftChip
              :color="statusOf(item.status).color"
              :icon="statusOf(item.status).icon"
              :label="statusOf(item.status).label"
            />
            <SoftChip
              :color="typeOf(item.type).color"
              :icon="typeOf(item.type).icon"
              :label="typeOf(item.type).label"
            />
          </div>
          <h2 class="card-title">{{ item.title }}</h2>
        </div>

        <div class="card-meta">
          <p class="card-line">
            <q-icon name="location_on" size="15px" />
            {{ item.location_neighborhood }} · {{ item.location_city }}
          </p>
          <p class="card-line mono">
            <q-icon name="calendar_today" size="15px" />
            {{ fmtDate(item.start_date) }} → {{ fmtDate(item.expected_end_date) }}
          </p>
        </div>

        <div class="card-arrow">
          <q-icon name="arrow_outward" size="18px" />
        </div>
      </q-card>
    </div>

    <div v-else class="empty-state">
      <div class="empty-tile">
        <q-icon name="construction" size="32px" />
      </div>
      <p class="empty-text">
        {{ search ? 'Nenhuma obra encontrada para a busca.' : 'Nenhuma obra cadastrada.' }}
      </p>
    </div>

    <!-- MODAL DE FILTROS (esboço) -->
    <q-dialog v-model="showFilters" position="right">
      <q-card dark flat class="filter-panel">
        <div class="filter-head">
          <div class="filter-head-title">
            <q-icon name="tune" size="20px" />
            <span>Filtros</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>

        <div class="filter-body">
          <p class="filter-hint">
            Em breve você poderá filtrar as obras por status, tipo e localização.
          </p>

          <div class="filter-group">
            <span class="filter-label">Status</span>
            <div class="filter-placeholder">Seletor de status</div>
          </div>
          <div class="filter-group">
            <span class="filter-label">Tipo</span>
            <div class="filter-placeholder">Seletor de tipo</div>
          </div>
          <div class="filter-group">
            <span class="filter-label">Localização</span>
            <div class="filter-placeholder">Seletor de cidade</div>
          </div>
        </div>

        <div class="filter-actions">
          <q-btn flat no-caps label="Limpar" color="grey-5" />
          <q-btn unelevated no-caps class="filter-btn" label="Aplicar" v-close-popup />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.client-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* HEADER COMPACTO */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: var(--grad-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.list-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
  flex-shrink: 0;
}

.list-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-1);
}

.list-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.list-search {
  min-width: 220px;
  padding: 0 12px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-soft);
}

.filter-btn {
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--grad-accent);
  color: #fff;
  font-weight: 600;
}

/* LISTA — 1 CARD POR FILA */
.construction-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.construction-card {
  position: relative;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 24px;
  transition:
    transform 0.18s var(--ease),
    box-shadow 0.18s var(--ease),
    border-color 0.18s var(--ease);
}

.construction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 50px rgba(8, 10, 20, 0.45);
  border-color: var(--border-accent);
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.card-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-title {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-1);
  line-height: 1.3;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 24px;
  border-left: 1px solid var(--border-subtle);
  flex-shrink: 0;
  min-width: 240px;
}

.card-line {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}

.card-line .q-icon { color: var(--text-3); }

.card-arrow {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--text-2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  flex-shrink: 0;
  transition: all 0.18s var(--ease);
}

.construction-card:hover .card-arrow {
  color: #fff;
  background: var(--grad-accent);
  border-color: transparent;
}

.mono { font-variant-numeric: tabular-nums; }

@media (max-width: 720px) {
  .construction-card { flex-direction: column; align-items: flex-start; gap: 16px; }
  .card-meta {
    padding-left: 0;
    padding-top: 14px;
    border-left: none;
    border-top: 1px solid var(--border-subtle);
    width: 100%;
    min-width: 0;
  }
  .card-arrow { position: absolute; top: 18px; right: 20px; }
}

/* SKELETON */
.card-skeleton {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.skeleton-block.right { flex: 0 0 240px; }
.skeleton-line {
  height: 13px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
  background-size: 800px 100%;
  animation: infra-shimmer 1.5s infinite;
}
.skeleton-line.short  { width: 35%; }
.skeleton-line.long   { width: 60%; height: 18px; }
.skeleton-line.medium { width: 80%; }

/* EMPTY */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
}
.empty-tile {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--grad-accent);
  display: grid;
  place-items: center;
  color: #fff;
}
.empty-text {
  margin: 0;
  color: var(--text-2);
  font-size: 14px;
}

/* MODAL DE FILTROS */
.filter-panel {
  width: 360px;
  max-width: 90vw;
  height: 100vh;
  background: var(--surface);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}
.filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.filter-head-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
}
.filter-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.filter-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
}
.filter-placeholder {
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-soft);
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-size: 13px;
  color: var(--text-3);
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}
</style>
