<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: employees, loading, fetchAll, remove } = useCrud('/api/employees/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

const positionMap = {
  engineer:  { label: 'Engenheiro(a)',   cls: 'badge-soft-info'      },
  architect: { label: 'Arquiteto(a)',    cls: 'badge-soft-info'      },
  foreman:   { label: 'Mestre de Obras', cls: 'badge-soft-warning'   },
  inspector: { label: 'Fiscal',          cls: 'badge-soft-secondary' },
  worker:    { label: 'Operário(a)',     cls: 'badge-soft-secondary' },
  manager:   { label: 'Gerente',         cls: 'badge-soft-success'   },
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return employees.value
  return employees.value.filter(
    (e) =>
      e.first_name.toLowerCase().includes(q) ||
      e.last_name.toLowerCase().includes(q) ||
      e.national_id?.toLowerCase().includes(q),
  )
})

function askDelete(employee) {
  confirmTarget.value = { id: employee.id, name: `${employee.first_name} ${employee.last_name}` }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    employees.value = employees.value.filter((e) => e.id !== id)
    toast.add(`"${name}" excluído com sucesso.`)
  } else {
    toast.add('Erro ao excluir funcionário.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-people-fill" title="Funcionários" :count="employees.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar funcionário..." />
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
            <th>Empresa</th>
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
            <td><span class="skeleton" style="width: 120px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 60px; height: 20px; border-radius: 20px"></span></td>
            <td class="text-end pe-4">
              <span class="skeleton" style="width: 64px; height: 28px; border-radius: 6px"></span>
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
            <th>Empresa</th>
            <th>Ativo</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/employees/new" class="btn btn-primary btn-sm">
                  Cadastrar o primeiro
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="employee in filtered" :key="employee.id">
            <td class="ps-4 text-muted">{{ employee.id }}</td>
            <td class="fw-semibold">{{ employee.first_name }} {{ employee.last_name }}</td>
            <td>{{ employee.national_id }}</td>
            <td><StatusBadge :value="employee.position" :map="positionMap" /></td>
            <td>{{ employee.company_name ?? employee.company }}</td>
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
                <button class="btn btn-outline-danger" title="Excluir" @click="askDelete(employee)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <ConfirmModal
      :show="!!confirmTarget"
      :item-name="confirmTarget?.name"
      @confirm="confirmDelete"
      @cancel="confirmTarget = null"
    />
  </AppCard>
</template>
