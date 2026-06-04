<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: companies, loading, fetchAll, remove } = useCrud('/api/companies/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

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

function askDelete(company) {
  confirmTarget.value = { id: company.id, name: company.corporate_name }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    companies.value = companies.value.filter((c) => c.id !== id)
    toast.add(`Empresa "${name}" excluída com sucesso.`)
  } else {
    toast.add('Erro ao excluir empresa.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-buildings-fill" title="Empresas" :count="companies.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar empresa..." />
        <RouterLink to="/companies/new" class="btn btn-light btn-sm text-nowrap">
          <i class="bi bi-plus-lg me-1"></i>Nova
        </RouterLink>
      </div>
    </template>

    <!-- Skeleton loading -->
    <div v-if="loading" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Contato</th>
            <th class="text-center">Status</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 160px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 110px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 140px; height: 14px"></span></td>
            <td class="text-center"><span class="skeleton" style="width: 56px; height: 20px; border-radius: 8px"></span></td>
            <td class="text-end pe-4"><span class="skeleton" style="width: 140px; height: 28px; border-radius: 6px"></span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Data table -->
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Contato</th>
            <th class="text-center">Status</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa cadastrada.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/companies/new" class="btn btn-primary btn-sm">
                  Cadastrar a primeira
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="company in filtered" :key="company.id">
            <td class="ps-4 text-muted">{{ company.id }}</td>
            <td class="fw-semibold">{{ company.corporate_name }}</td>
            <td>{{ company.corporate_tax_id }}</td>
            <td>
              <div>{{ company.email }}</div>
              <small class="text-muted">{{ company.phone }}</small>
            </td>
            <td class="text-center">
              <StatusBadge :value="company.is_active" true-label="Ativa" false-label="Inativa" />
            </td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/companies/${company.id}/employees`"
                  class="btn btn-outline-success"
                  title="Funcionários"
                >
                  <i class="bi bi-people-fill"></i>
                </RouterLink>
                <RouterLink
                  :to="`/companies/${company.id}/equipments`"
                  class="btn btn-outline-info"
                  title="Equipamentos"
                >
                  <i class="bi bi-tools"></i>
                </RouterLink>
                <RouterLink
                  :to="`/companies/${company.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
                <button
                  class="btn btn-outline-danger"
                  title="Excluir"
                  @click="askDelete(company)"
                >
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
