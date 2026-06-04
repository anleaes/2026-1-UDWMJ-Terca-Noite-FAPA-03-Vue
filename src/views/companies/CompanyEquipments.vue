<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import SearchInput from '../../components/SearchInput.vue'

const route = useRoute()
const companyId = computed(() => Number(route.params.companyId))

const companyName = ref('')
const equipments = ref([])
const loading = ref(true)
const search = ref('')

const typeMap = {
  excavator:      { label: 'Escavadeira', cls: 'badge-soft-warning'   },
  crane:          { label: 'Guindaste',   cls: 'badge-soft-info'      },
  truck:          { label: 'Caminhão',    cls: 'badge-soft-secondary' },
  bulldozer:      { label: 'Bulldozer',   cls: 'badge-soft-warning'   },
  concrete_mixer: { label: 'Betoneira',   cls: 'badge-soft-secondary' },
  compactor:      { label: 'Compactador', cls: 'badge-soft-secondary' },
  other:          { label: 'Outro',       cls: 'badge-soft-secondary' },
}

onMounted(async () => {
  const [companyData, allEquipments] = await Promise.all([
    fetch(`/api/companies/${companyId.value}/`).then((r) => r.json()),
    fetch('/api/equipments/').then((r) => r.json()),
  ])
  companyName.value = companyData.corporate_name
  equipments.value = allEquipments.filter((e) => e.company === companyId.value)
  loading.value = false
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return equipments.value
  return equipments.value.filter((e) => e.name.toLowerCase().includes(q))
})
</script>

<template>
  <AppCard icon="bi-tools" :title="`Equipamentos — ${companyName}`" :count="equipments.length">
    <template #actions>
      <div class="d-flex gap-2 align-items-center">
        <SearchInput v-model="search" placeholder="Buscar equipamento..." />
        <RouterLink :to="`/companies/${companyId}`" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Voltar
        </RouterLink>
        <RouterLink :to="`/companies/${companyId}/equipments/new`" class="btn btn-light btn-sm text-nowrap">
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
            <td><span class="skeleton" style="width: 80px; height: 20px; border-radius: 20px"></span></td>
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
            <th>Nome</th>
            <th>Tipo</th>
            <th>Diária</th>
            <th>Disponível</th>
            <th class="text-end pe-4">Ações</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="list">
          <tr v-if="filtered.length === 0" key="empty">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              {{ search ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento nesta empresa.' }}
            </td>
          </tr>
          <tr v-for="equipment in filtered" :key="equipment.id">
            <td class="ps-4 text-muted">{{ equipment.id }}</td>
            <td class="fw-semibold">{{ equipment.name }}</td>
            <td><StatusBadge :value="equipment.type" :map="typeMap" /></td>
            <td>R$ {{ Number(equipment.daily_rate).toFixed(2) }}</td>
            <td><StatusBadge :value="equipment.is_available" true-label="Disponível" false-label="Indisponível" /></td>
            <td class="text-end pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="`/companies/${companyId}/equipments/${equipment.id}/edit`"
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
