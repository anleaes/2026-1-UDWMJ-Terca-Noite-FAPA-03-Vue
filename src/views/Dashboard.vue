<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroHeader from '../components/ui/HeroHeader.vue'

defineOptions({ name: 'DashboardView' })

const router = useRouter()

const stats = ref([
  { label: 'Empresas', icon: 'domain', color: '#818cf8', to: '/companies', endpoint: '/api/companies/', count: null },
  { label: 'Locais', icon: 'location_on', color: '#a78bfa', to: '/locations', endpoint: '/api/locations/', count: null },
  { label: 'Funcionários', icon: 'groups', color: '#34d399', to: '/employees', endpoint: '/api/employees/', count: null },
  { label: 'Equipamentos', icon: 'construction', color: '#fb923c', to: '/equipments', endpoint: '/api/equipments/', count: null },
  { label: 'Cidadãos', icon: 'badge', color: '#22d3ee', to: '/citizens', endpoint: '/api/citizens/', count: null },
  { label: 'Obras', icon: 'engineering', color: '#fbbf24', to: '/constructions', endpoint: '/api/constructions/', count: null },
])

const loading = ref(true)

const total = computed(() =>
  stats.value.reduce((sum, s) => sum + (typeof s.count === 'number' ? s.count : 0), 0),
)

onMounted(async () => {
  await Promise.all(
    stats.value.map(async (s) => {
      try {
        const res = await fetch(s.endpoint)
        const data = await res.json()
        s.count = Array.isArray(data) ? data.length : '—'
      } catch {
        s.count = '—'
      }
    }),
  )
  loading.value = false
})
</script>

<template>
  <div class="dash-page">
    <HeroHeader
      icon="dashboard"
      title="Dashboard"
      subtitle="Visão geral do sistema de infraestrutura"
      :show-search="false"
    >
      <template #stats>
        <div class="hero-total">
          <span class="hero-total-value">
            <q-skeleton v-if="loading" type="text" width="48px" dark />
            <template v-else>{{ total }}</template>
          </span>
          <span class="hero-total-label">Registros no total</span>
        </div>
      </template>
    </HeroHeader>

    <div class="row q-col-gutter-md dash-grid">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          class="dash-card"
          :style="{ '--tile': stat.color }"
          @click="router.push(stat.to)"
        >
          <div class="dash-tile">
            <q-icon :name="stat.icon" size="26px" />
          </div>
          <div class="dash-info">
            <div class="dash-count">
              <q-skeleton v-if="loading" type="text" width="44px" dark />
              <template v-else>{{ stat.count }}</template>
            </div>
            <div class="dash-label">{{ stat.label }}</div>
          </div>
          <q-icon name="arrow_forward" size="18px" class="dash-arrow" />
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-page {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero-total {
  display: flex;
  flex-direction: column;
  padding: 12px 22px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
}
.hero-total-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.1;
}
.hero-total-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-3);
  margin-top: 2px;
}

.dash-grid {
  margin-top: 0;
}

.dash-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  cursor: pointer;
  border-radius: var(--radius-card);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.25s var(--ease),
    border-color 0.25s var(--ease),
    background 0.25s var(--ease);
}
.dash-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--tile) 45%, transparent);
  background: color-mix(in srgb, var(--tile) 7%, var(--surface));
}

.dash-tile {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: var(--tile);
  background: color-mix(in srgb, var(--tile) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--tile) 28%, transparent);
}

.dash-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.dash-count {
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.05;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}
.dash-label {
  font-size: 0.85rem;
  color: var(--text-2);
  margin-top: 2px;
}

.dash-arrow {
  color: var(--text-3);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease),
    color 0.25s var(--ease);
}
.dash-card:hover .dash-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--tile);
}
</style>
