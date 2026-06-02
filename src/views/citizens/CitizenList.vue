<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: citizens, loading, fetchAll, remove } = useCrud('/api/citizens/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return citizens.value
  return citizens.value.filter(
    (c) =>
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.national_id?.toLowerCase().includes(q),
  )
})

function askDelete(citizen) {
  confirmTarget.value = { id: citizen.id, name: `${citizen.first_name} ${citizen.last_name}` }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    citizens.value = citizens.value.filter((c) => c.id !== id)
    toast.add(`"${name}" excluído com sucesso.`)
  } else {
    toast.add('Erro ao excluir cidadão.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-person-vcard-fill" title="Cidadãos" :count="citizens.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar cidadão..." />
        <RouterLink to="/citizens/new" class="btn btn-light btn-sm text-nowrap">
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
            <th>Telefone</th>
            <th>Nº Cadastro</th>
            <th>Associação</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 160px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 110px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 100px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 90px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 120px; height: 14px"></span></td>
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
            <th>Telefone</th>
            <th>Nº Cadastro</th>
            <th>Associação</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum cidadão encontrado.' : 'Nenhum cidadão cadastrado.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/citizens/new" class="btn btn-primary btn-sm">
                  Cadastrar o primeiro
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="citizen in filtered" :key="citizen.id">
            <td class="ps-4 text-muted">{{ citizen.id }}</td>
            <td class="fw-semibold">{{ citizen.first_name }} {{ citizen.last_name }}</td>
            <td>{{ citizen.national_id }}</td>
            <td>{{ citizen.phone }}</td>
            <td>{{ citizen.registration_number }}</td>
            <td>{{ citizen.neighborhood_association }}</td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/citizens/${citizen.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
                <button class="btn btn-outline-danger" title="Excluir" @click="askDelete(citizen)">
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
