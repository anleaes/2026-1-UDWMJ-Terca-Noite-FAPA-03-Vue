<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: locations, loading, fetchAll, remove } = useCrud('/api/locations/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

const typeMap = {
  STREET: { label: 'Rua',     cls: 'badge-soft-secondary' },
  AVENUE: { label: 'Avenida', cls: 'badge-soft-info'      },
  SQUARE: { label: 'Praça',   cls: 'badge-soft-success'   },
  PARK:   { label: 'Parque',  cls: 'badge-soft-success'   },
  ALLEY:  { label: 'Viela',   cls: 'badge-soft-warning'   },
  OTHER:  { label: 'Outro',   cls: 'badge-soft-secondary' },
}

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

function askDelete(location) {
  confirmTarget.value = { id: location.id, name: location.name }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    locations.value = locations.value.filter((l) => l.id !== id)
    toast.add(`Local "${name}" excluído com sucesso.`)
  } else {
    toast.add('Erro ao excluir local.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-geo-alt-fill" title="Locais" :count="locations.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar local..." />
        <RouterLink to="/locations/new" class="btn btn-light btn-sm text-nowrap">
          <i class="bi bi-plus-lg me-1"></i>Novo
        </RouterLink>
      </div>
    </template>

    <!-- Skeleton loading -->
    <div v-if="loading" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Nome</th>
            <th>Bairro</th>
            <th>Cidade</th>
            <th class="text-center">Tipo</th>
            <th class="text-center">Pavimentado</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 140px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 110px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 100px; height: 14px"></span></td>
            <td class="text-center"><span class="skeleton" style="width: 64px; height: 20px; border-radius: 8px"></span></td>
            <td class="text-center"><span class="skeleton" style="width: 48px; height: 20px; border-radius: 8px"></span></td>
            <td class="text-end pe-4"><span class="skeleton" style="width: 64px; height: 28px; border-radius: 6px"></span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabela de dados -->
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Nome</th>
            <th>Bairro</th>
            <th>Cidade</th>
            <th class="text-center">Tipo</th>
            <th class="text-center">Pavimentado</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum local encontrado.' : 'Nenhum local cadastrado.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/locations/new" class="btn btn-primary btn-sm">
                  Cadastrar o primeiro
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="location in filtered" :key="location.id">
            <td class="ps-4 text-muted">{{ location.id }}</td>
            <td class="fw-semibold">{{ location.name }}</td>
            <td>{{ location.neighborhood }}</td>
            <td>{{ location.city }}</td>
            <td class="text-center">
              <StatusBadge :value="location.type" :map="typeMap" />
            </td>
            <td class="text-center">
              <StatusBadge :value="location.is_paved" true-label="Sim" false-label="Não" />
            </td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/locations/${location.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
                <button
                  class="btn btn-outline-danger"
                  title="Excluir"
                  @click="askDelete(location)"
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
