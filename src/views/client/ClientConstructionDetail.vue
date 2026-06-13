<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SoftChip from '../../components/ui/SoftChip.vue'
import { statusOf, typeOf, statusFoundOf } from '../constructions/constructions'

const route = useRoute()
const router = useRouter()
const constructionId = computed(() => Number(route.params.id))

const construction = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`/api/constructions/client/${constructionId.value}/`)
    construction.value = await res.json()
  } finally {
    loading.value = false
  }
})

function fmtDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('pt-BR')
}

function fmtDay(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
</script>

<template>
  <div class="detail-page">
    <button class="back-btn" @click="router.push('/client')">
      <q-icon name="arrow_back" size="18px" />
      Voltar para obras
    </button>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-icon">
          <q-icon name="construction" size="30px" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">{{ construction?.title ?? 'Carregando...' }}</h1>
          <div v-if="!loading" class="hero-chips">
            <SoftChip
              :color="statusOf(construction.status).color"
              :icon="statusOf(construction.status).icon"
              :label="statusOf(construction.status).label"
            />
            <SoftChip
              :color="typeOf(construction.type).color"
              :icon="typeOf(construction.type).icon"
              :label="typeOf(construction.type).label"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- INFO GRID -->
    <section class="info-grid">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="info-card placeholder">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
        </div>
      </template>
      <template v-else>
        <div class="info-card">
          <span class="info-label"><q-icon name="event_available" size="15px" /> Início</span>
          <span class="info-value mono">{{ fmtDay(construction.start_date) }}</span>
        </div>
        <div class="info-card">
          <span class="info-label"><q-icon name="event" size="15px" /> Término Previsto</span>
          <span class="info-value mono">{{ fmtDay(construction.expected_end_date) }}</span>
        </div>
        <div class="info-card wide">
          <span class="info-label"><q-icon name="location_on" size="15px" /> Localização</span>
          <span class="info-value">
            {{ construction.location_name }}, {{ construction.location_neighborhood }} — {{ construction.location_city }}
          </span>
        </div>
      </template>
    </section>

    <!-- INSPEÇÕES -->
    <section class="section">
      <div class="section-head">
        <div class="section-icon"><q-icon name="fact_check" size="18px" /></div>
        <span class="section-title">Inspeções</span>
        <span v-if="!loading" class="section-count">{{ construction?.inspections?.length ?? 0 }}</span>
      </div>

      <div v-if="loading" class="insp-list">
        <div v-for="i in 3" :key="i" class="insp-card placeholder">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>

      <div v-else-if="construction?.inspections?.length" class="insp-list">
        <div v-for="insp in construction.inspections" :key="insp.id" class="insp-card">
          <div class="insp-date">
            <q-icon name="calendar_today" size="15px" />
            <span class="mono">{{ fmtDate(insp.visit_date) }}</span>
          </div>
          <div class="insp-chips">
            <SoftChip
              :color="statusFoundOf(insp.status_found).color"
              :icon="statusFoundOf(insp.status_found).icon"
              :label="statusFoundOf(insp.status_found).label"
            />
            <SoftChip
              :color="insp.is_compliant ? '#34d399' : '#fb7185'"
              :icon="insp.is_compliant ? 'check_circle' : 'cancel'"
              :label="insp.is_compliant ? 'Conforme' : 'Não conforme'"
            />
          </div>
          <div class="insp-score">
            <span class="score-value mono">{{ insp.score ?? '—' }}</span>
            <span class="score-label">pontos</span>
          </div>
        </div>
      </div>

      <div v-else class="insp-empty">
        <div class="empty-tile"><q-icon name="fact_check" size="28px" /></div>
        <p>Nenhuma inspeção registrada.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-2);
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
  transition: color 0.2s var(--ease);
}
.back-btn:hover { color: var(--text-1); }

/* HERO */
.hero {
  position: relative;
  overflow: hidden;
  padding: 30px 32px;
  border-radius: var(--radius-card);
  background: var(--grad-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}
.hero-glow {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 240px;
  height: 240px;
  background: var(--glow-accent);
  pointer-events: none;
}
.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
}
.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
  flex-shrink: 0;
}
.hero-title {
  margin: 0 0 10px;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-1);
  line-height: 1.2;
}
.hero-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.info-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-card.wide { grid-column: span 2; }
.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
}
.info-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-1);
}

/* SECTION */
.section {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-subtle);
}
.section-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  flex-shrink: 0;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
}
.section-count {
  margin-left: auto;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

/* INSPEÇÕES */
.insp-list {
  display: flex;
  flex-direction: column;
}
.insp-card {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-subtle);
}
.insp-card:last-child { border-bottom: none; }
.insp-date {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 130px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}
.insp-date .q-icon { color: var(--text-3); }
.insp-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}
.insp-score {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.score-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-1);
}
.score-label {
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.insp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 48px 24px;
  color: var(--text-2);
}
.insp-empty p { margin: 0; font-size: 14px; }
.empty-tile {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--grad-accent);
  display: grid;
  place-items: center;
  color: #fff;
}

.mono { font-variant-numeric: tabular-nums; }

/* skeleton */
.placeholder { pointer-events: none; }
.skeleton-line {
  height: 13px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
  background-size: 800px 100%;
  animation: infra-shimmer 1.5s infinite;
}
.skeleton-line.short { width: 40%; }
.skeleton-line.medium { width: 60%; }
.skeleton-line.long { width: 80%; }

@media (max-width: 600px) {
  .info-card.wide { grid-column: span 1; }
  .hero-content { flex-direction: column; align-items: flex-start; }
}
</style>
