<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: constructions, loading, fetchAll, remove } = useCrud('/api/constructions/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

const statusMap = {
  planned:     { label: 'Planejada',    cls: 'badge-soft-secondary' },
  in_progress: { label: 'Em Andamento', cls: 'badge-soft-info'      },
  paused:      { label: 'Pausada',      cls: 'badge-soft-warning'   },
  completed:   { label: 'Concluída',    cls: 'badge-soft-success'   },
  cancelled:   { label: 'Cancelada',    cls: 'badge-soft-danger'    },
}

const typeMap = {
  road:        { label: 'Rodovia',     cls: 'badge-soft-warning'   },
  bridge:      { label: 'Ponte',       cls: 'badge-soft-info'      },
  building:    { label: 'Edifício',    cls: 'badge-soft-secondary' },
  sanitation:  { label: 'Saneamento',  cls: 'badge-soft-success'   },
  urban:       { label: 'Urbanização', cls: 'badge-soft-info'      },
  other:       { label: 'Outro',       cls: 'badge-soft-secondary' },
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return constructions.value
  return constructions.value.filter((c) => c.title.toLowerCase().includes(q))
})

function askDelete(construction) {
  confirmTarget.value = { id: construction.id, name: construction.title }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    constructions.value = constructions.value.filter((c) => c.id !== id)
    toast.add(`"${name}" excluída com sucesso.`)
  } else {
    toast.add('Erro ao excluir obra.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-cone-striped" title="Obras" :count="constructions.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar obra..." />
        <RouterLink to="/constructions/new" class="btn btn-light btn-sm text-nowrap">
          <i class="bi bi-plus-lg me-1"></i>Nova
        </RouterLink>
      </div>
    </template>

    <div v-if="loading" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Início</th>
            <th>Término Previsto</th>
            <th>Empresa</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 180px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 90px; height: 20px; border-radius: 20px"></span></td>
            <td><span class="skeleton" style="width: 100px; height: 20px; border-radius: 20px"></span></td>
            <td><span class="skeleton" style="width: 80px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 80px; height: 14px"></span></td>
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
            <th>Título</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Início</th>
            <th>Término Previsto</th>
            <th>Empresa</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="8" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhuma obra encontrada.' : 'Nenhuma obra cadastrada.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/constructions/new" class="btn btn-primary btn-sm">
                  Cadastrar a primeira
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="construction in filtered" :key="construction.id">
            <td class="ps-4 text-muted">{{ construction.id }}</td>
            <td class="fw-semibold">{{ construction.title }}</td>
            <td><StatusBadge :value="construction.type" :map="typeMap" /></td>
            <td><StatusBadge :value="construction.status" :map="statusMap" /></td>
            <td>{{ construction.start_date ?? '—' }}</td>
            <td>{{ construction.expected_end_date ?? '—' }}</td>
            <td>{{ construction.company_name ?? construction.company }}</td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/constructions/${construction.id}`"
                  class="btn btn-outline-info"
                  title="Detalhe"
                >
                  <i class="bi bi-eye"></i>
                </RouterLink>
                <RouterLink
                  :to="`/constructions/${construction.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
                <button class="btn btn-outline-danger" title="Excluir" @click="askDelete(construction)">
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
