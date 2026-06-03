<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import SearchInput from '../../components/SearchInput.vue'

const { items: equipments, loading, fetchAll, remove } = useCrud('/api/equipments/')
const toast = useToast()

const search = ref('')
const confirmTarget = ref(null)

const typeMap = {
  excavator:      { label: 'Escavadeira', cls: 'badge-soft-warning'   },
  crane:          { label: 'Guindaste',   cls: 'badge-soft-info'      },
  truck:          { label: 'Caminhão',    cls: 'badge-soft-secondary' },
  bulldozer:      { label: 'Bulldozer',   cls: 'badge-soft-warning'   },
  concrete_mixer: { label: 'Betoneira',   cls: 'badge-soft-secondary' },
  compactor:      { label: 'Compactador', cls: 'badge-soft-secondary' },
  other:          { label: 'Outro',       cls: 'badge-soft-secondary' },
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return equipments.value
  return equipments.value.filter((e) => e.name.toLowerCase().includes(q))
})

function askDelete(equipment) {
  confirmTarget.value = { id: equipment.id, name: equipment.name }
}

async function confirmDelete() {
  const { id, name } = confirmTarget.value
  confirmTarget.value = null
  const ok = await remove(id)
  if (ok !== null) {
    equipments.value = equipments.value.filter((e) => e.id !== id)
    toast.add(`"${name}" excluído com sucesso.`)
  } else {
    toast.add('Erro ao excluir equipamento.', 'error')
  }
}

onMounted(fetchAll)
</script>

<template>
  <AppCard icon="bi-tools" title="Equipamentos" :count="equipments.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar equipamento..." />
        <RouterLink to="/equipments/new" class="btn btn-light btn-sm text-nowrap">
          <i class="bi bi-plus-lg me-1"></i>Novo
        </RouterLink>
      </div>
    </template>

    <div v-if="loading" class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th class="ps-4">#</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Diária</th>
            <th>Empresa</th>
            <th>Disponível</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 150px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 90px; height: 20px; border-radius: 20px"></span></td>
            <td><span class="skeleton" style="width: 70px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 120px; height: 14px"></span></td>
            <td><span class="skeleton" style="width: 80px; height: 20px; border-radius: 20px"></span></td>
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
            <th>Nome</th>
            <th>Tipo</th>
            <th>Diária</th>
            <th>Empresa</th>
            <th>Disponível</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento cadastrado.' }}
              <div v-if="!search" class="mt-2">
                <RouterLink to="/equipments/new" class="btn btn-primary btn-sm">
                  Cadastrar o primeiro
                </RouterLink>
              </div>
            </td>
          </tr>
          <tr v-for="equipment in filtered" :key="equipment.id">
            <td class="ps-4 text-muted">{{ equipment.id }}</td>
            <td class="fw-semibold">{{ equipment.name }}</td>
            <td><StatusBadge :value="equipment.type" :map="typeMap" /></td>
            <td>R$ {{ Number(equipment.daily_rate).toFixed(2) }}</td>
            <td>{{ equipment.company_name ?? equipment.company }}</td>
            <td><StatusBadge :value="equipment.is_available" true-label="Disponível" false-label="Indisponível" /></td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/equipments/${equipment.id}/edit`"
                  class="btn btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </RouterLink>
                <button class="btn btn-outline-danger" title="Excluir" @click="askDelete(equipment)">
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
