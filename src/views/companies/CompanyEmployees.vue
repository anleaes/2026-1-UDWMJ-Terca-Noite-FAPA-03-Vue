<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import SearchInput from '../../components/SearchInput.vue'

const route = useRoute()
const companyId = computed(() => Number(route.params.id))

const companyName = ref('')
const employees = ref([])
const loading = ref(true)
const search = ref('')

const positionMap = {
  engineer:  { label: 'Engenheiro(a)',   cls: 'badge-soft-info'      },
  architect: { label: 'Arquiteto(a)',    cls: 'badge-soft-info'      },
  foreman:   { label: 'Mestre de Obras', cls: 'badge-soft-warning'   },
  inspector: { label: 'Fiscal',          cls: 'badge-soft-secondary' },
  worker:    { label: 'Operário(a)',     cls: 'badge-soft-secondary' },
  manager:   { label: 'Gerente',         cls: 'badge-soft-success'   },
}

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
      e.national_id?.includes(q),
  )
})
</script>

<template>
  <AppCard icon="bi-people-fill" :title="`Funcionários — ${companyName}`" :count="employees.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar funcionário..." />
        <RouterLink :to="`/companies/${companyId}`" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Voltar
        </RouterLink>
        <RouterLink to="/employees/new" class="btn btn-light btn-sm text-nowrap">
          <i class="bi bi-plus-lg me-1"></i>Novo
        </RouterLink>
      </div>
    </template>

    <div v-if="loading" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Nome completo</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Ativo</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 160px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 110px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 80px; height: 20px; border-radius: 20px"></span></td>
            <td><span class="skeleton" style="width: 60px; height: 20px; border-radius: 20px"></span></td>
            <td class="text-end pe-4">
              <span class="skeleton" style="width: 40px; height: 28px; border-radius: 6px"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Nome completo</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Ativo</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário nesta empresa.' }}
            </td>
          </tr>
          <tr v-for="employee in filtered" :key="employee.id">
            <td class="ps-4 text-muted">{{ employee.id }}</td>
            <td class="fw-semibold">{{ employee.first_name }} {{ employee.last_name }}</td>
            <td>{{ employee.national_id }}</td>
            <td><StatusBadge :value="employee.position" :map="positionMap" /></td>
            <td><StatusBadge :value="employee.is_active" true-label="Sim" false-label="Não" /></td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/employees/${employee.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </AppCard>
</template>
