<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const stats = ref([
  { label: 'Empresas', icon: 'bi-buildings-fill', color: '#0d6efd', to: '/companies', endpoint: '/api/companies/', count: null },
  { label: 'Locais', icon: 'bi-geo-alt-fill', color: '#6610f2', to: '/locations', endpoint: '/api/locations/', count: null },
  { label: 'Funcionários', icon: 'bi-people-fill', color: '#198754', to: '/employees', endpoint: '/api/employees/', count: null },
  { label: 'Equipamentos', icon: 'bi-tools', color: '#fd7e14', to: '/equipments', endpoint: '/api/equipments/', count: null },
  { label: 'Cidadãos', icon: 'bi-person-vcard-fill', color: '#0dcaf0', to: '/citizens', endpoint: '/api/citizens/', count: null },
  { label: 'Obras', icon: 'bi-cone-striped', color: '#ffc107', to: '/constructions', endpoint: '/api/constructions/', count: null },
])

const loading = ref(true)

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
  <div>
    <div class="mb-4">
      <h3 class="fw-bold mb-1">Dashboard</h3>
      <p class="text-muted mb-0">Visão geral do sistema de infraestrutura</p>
    </div>

    <div class="row g-3">
      <div v-for="stat in stats" :key="stat.label" class="col-sm-6 col-xl-4">
        <RouterLink :to="stat.to" class="text-decoration-none">
          <div class="card border-0 shadow-sm stat-card h-100">
            <div class="card-body d-flex align-items-center gap-3 p-4">
              <div
                class="stat-icon rounded-3 d-flex align-items-center justify-content-center"
                :style="`background: ${stat.color}1a; color: ${stat.color};`"
              >
                <i :class="`bi ${stat.icon} fs-3`"></i>
              </div>
              <div>
                <div class="stat-count fw-bold lh-1 mb-1">
                  <span v-if="loading" class="skeleton d-inline-block" style="width: 40px; height: 28px"></span>
                  <span v-else>{{ stat.count }}</span>
                </div>
                <div class="text-muted small">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
