<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const route = useRoute()
const toast = useToast()
const constructionId = computed(() => Number(route.params.id))

const construction = ref(null)
const contracts = ref([])
const allocations = ref([])
const inspections = ref([])

const companyMap = ref({})
const employeeMap = ref({})
const equipmentMap = ref({})
const reportByInspection = ref({})

const pageLoading = ref(true)
const confirmTarget = ref(null)

const statusMap = {
  planned: { label: 'Planejada', cls: 'badge-soft-secondary' },
  in_progress: { label: 'Em Andamento', cls: 'badge-soft-info' },
  paused: { label: 'Pausada', cls: 'badge-soft-warning' },
  completed: { label: 'Concluída', cls: 'badge-soft-success' },
  cancelled: { label: 'Cancelada', cls: 'badge-soft-danger' },
}

const typeMap = {
  road: { label: 'Rodovia', cls: 'badge-soft-warning' },
  bridge: { label: 'Ponte', cls: 'badge-soft-info' },
  building: { label: 'Edifício', cls: 'badge-soft-secondary' },
  sanitation: { label: 'Saneamento', cls: 'badge-soft-success' },
  urban: { label: 'Urbanização', cls: 'badge-soft-info' },
  other: { label: 'Outro', cls: 'badge-soft-secondary' },
}

const statusFoundMap = {
  regular: { label: 'Regular', cls: 'badge-soft-success' },
  irregular: { label: 'Irregular', cls: 'badge-soft-danger' },
  partial: { label: 'Parcialmente Regular', cls: 'badge-soft-warning' },
  critical: { label: 'Crítico', cls: 'badge-soft-danger' },
}

onMounted(async () => {
  const [
    constructionData,
    allContracts,
    allAllocations,
    allInspections,
    allCompanies,
    allEmployees,
    allEquipments,
    allReports,
  ] = await Promise.all([
    fetch(`/api/constructions/${constructionId.value}/`).then((r) => r.json()),
    fetch('/api/contracts/').then((r) => r.json()),
    fetch('/api/constructionequipments/').then((r) => r.json()),
    fetch('/api/inspections/').then((r) => r.json()),
    fetch('/api/companies/').then((r) => r.json()),
    fetch('/api/employees/').then((r) => r.json()),
    fetch('/api/equipments/').then((r) => r.json()),
    fetch('/api/audit-reports/').then((r) => r.json()),
  ])

  construction.value = constructionData
  contracts.value = allContracts.filter((c) => c.construction === constructionId.value)
  allocations.value = allAllocations.filter((a) => a.construction === constructionId.value)
  inspections.value = allInspections.filter((i) => i.construction === constructionId.value)

  companyMap.value = Object.fromEntries(allCompanies.map((c) => [c.id, c.corporate_name]))
  employeeMap.value = Object.fromEntries(
    allEmployees.map((e) => [e.id, `${e.first_name} ${e.last_name}`]),
  )
  equipmentMap.value = Object.fromEntries(allEquipments.map((e) => [e.id, e.name]))
  reportByInspection.value = Object.fromEntries(allReports.map((r) => [r.inspection, r]))

  pageLoading.value = false
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function fmtCurrency(v) {
  if (v === null || v === undefined || v === '') return '—'
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function askDelete(item, type, name) {
  confirmTarget.value = { id: item.id, type, name }
}

async function confirmDelete() {
  const { id, type, name } = confirmTarget.value
  confirmTarget.value = null

  const endpointMap = {
    contract: '/api/contracts/',
    allocation: '/api/constructionequipments/',
    inspection: '/api/inspections/',
  }

  const res = await fetch(`${endpointMap[type]}${id}/`, { method: 'DELETE' })
  if (res.ok || res.status === 204) {
    if (type === 'contract') contracts.value = contracts.value.filter((c) => c.id !== id)
    if (type === 'allocation') allocations.value = allocations.value.filter((a) => a.id !== id)
    if (type === 'inspection') inspections.value = inspections.value.filter((i) => i.id !== id)
    toast.add(`"${name}" excluído com sucesso.`)
  } else {
    toast.add('Erro ao excluir.', 'error')
  }
}
</script>

<template>
  <div>
    <AppCard icon="bi-cone-striped" :title="construction?.title ?? 'Carregando...'">
      <template #actions>
        <div class="d-flex gap-2">
          <RouterLink :to="`/constructions/${constructionId}/edit`" class="btn btn-light btn-sm">
            <i class="bi bi-pencil me-1"></i>Editar
          </RouterLink>
          <RouterLink to="/constructions" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i>Voltar
          </RouterLink>
        </div>
      </template>

      <div v-if="pageLoading" class="p-4">
        <div class="row g-3">
          <div v-for="i in 6" :key="i" class="col-md-3">
            <span class="skeleton d-block mb-1" style="width: 60px; height: 12px"></span>
            <span
              class="skeleton d-block"
              style="width: 110px; height: 20px; border-radius: 20px"
            ></span>
          </div>
        </div>
      </div>

      <div v-else class="p-4">
        <div class="row g-3">
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Status</small>
            <StatusBadge :value="construction.status" :map="statusMap" />
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Tipo</small>
            <StatusBadge :value="construction.type" :map="typeMap" />
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Início</small>
            <span>{{ construction.start_date ?? '—' }}</span>
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Término Previsto</small>
            <span>{{ construction.expected_end_date ?? '—' }}</span>
          </div>
          <div class="col-md-6">
            <small class="text-muted d-block mb-1">Empresa</small>
            <span class="fw-semibold">{{ companyMap[construction.company] ?? '—' }}</span>
          </div>
          <div class="col-md-6">
            <small class="text-muted d-block mb-1">Valor Total</small>
            <span class="fw-semibold">{{ fmtCurrency(construction.total_value) }}</span>
          </div>
        </div>
      </div>
    </AppCard>

    <AppCard
      icon="bi-file-earmark-text-fill"
      title="Contratos"
      :count="contracts.length"
      class="mt-4"
    >
      <template #actions>
        <RouterLink
          :to="`/constructions/${constructionId}/contracts/new`"
          class="btn btn-light btn-sm"
        >
          <i class="bi bi-plus-lg me-1"></i>Novo
        </RouterLink>
      </template>

      <div v-if="pageLoading" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="ps-4">#</th>
              <th>Número</th>
              <th>Data Assinatura</th>
              <th>Valor</th>
              <th>Validade (dias)</th>
              <th>Empresa</th>
              <th>Ativo</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 2" :key="i">
              <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 100px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 80px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 90px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 50px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 120px; height: 14px"></span></td>
              <td>
                <span
                  class="skeleton"
                  style="width: 60px; height: 20px; border-radius: 20px"
                ></span>
              </td>
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
              <th>Número</th>
              <th>Data Assinatura</th>
              <th>Valor</th>
              <th>Validade (dias)</th>
              <th>Empresa</th>
              <th>Ativo</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-if="contracts.length === 0" key="empty-contracts">
              <td colspan="8" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-1"></i>Nenhum contrato cadastrado.
                <div class="mt-2">
                  <RouterLink
                    :to="`/constructions/${constructionId}/contracts/new`"
                    class="btn btn-primary btn-sm"
                    >Cadastrar o primeiro</RouterLink
                  >
                </div>
              </td>
            </tr>
            <tr v-for="contract in contracts" :key="contract.id">
              <td class="ps-4 text-muted">{{ contract.id }}</td>
              <td class="fw-semibold">{{ contract.number }}</td>
              <td>{{ contract.signing_date }}</td>
              <td>{{ fmtCurrency(contract.value) }}</td>
              <td>{{ contract.validity_days }}</td>
              <td>{{ companyMap[contract.company] ?? '—' }}</td>
              <td>
                <StatusBadge
                  :value="contract.is_active"
                  true-label="Ativo"
                  false-label="Encerrado"
                />
              </td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm" role="group">
                  <RouterLink
                    :to="`/constructions/${constructionId}/contracts/${contract.id}/edit`"
                    class="btn btn-outline-primary"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button
                    class="btn btn-outline-danger"
                    title="Excluir"
                    @click="askDelete(contract, 'contract', contract.number)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </AppCard>

    <AppCard icon="bi-tools" title="Equipamentos Alocados" :count="allocations.length" class="mt-4">
      <template #actions>
        <RouterLink
          :to="`/constructions/${constructionId}/equipments/new`"
          class="btn btn-light btn-sm"
        >
          <i class="bi bi-plus-lg me-1"></i>Alocar
        </RouterLink>
      </template>

      <div v-if="pageLoading" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="ps-4">#</th>
              <th>Equipamento</th>
              <th>Data Alocação</th>
              <th>Data Devolução</th>
              <th>Custo de Uso</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 2" :key="i">
              <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 130px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 80px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 80px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 90px; height: 14px"></span></td>
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
              <th>Equipamento</th>
              <th>Data Alocação</th>
              <th>Data Devolução</th>
              <th>Custo de Uso</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-if="allocations.length === 0" key="empty-alloc">
              <td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-1"></i>Nenhum equipamento alocado.
                <div class="mt-2">
                  <RouterLink
                    :to="`/constructions/${constructionId}/equipments/new`"
                    class="btn btn-primary btn-sm"
                    >Alocar o primeiro</RouterLink
                  >
                </div>
              </td>
            </tr>
            <tr v-for="alloc in allocations" :key="alloc.id">
              <td class="ps-4 text-muted">{{ alloc.id }}</td>
              <td class="fw-semibold">{{ equipmentMap[alloc.equipment] ?? alloc.equipment }}</td>
              <td>{{ alloc.allocation_date }}</td>
              <td>{{ alloc.return_date ?? '—' }}</td>
              <td>{{ fmtCurrency(alloc.usage_cost) }}</td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm" role="group">
                  <RouterLink
                    :to="`/constructions/${constructionId}/equipments/${alloc.id}/edit`"
                    class="btn btn-outline-primary"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button
                    class="btn btn-outline-danger"
                    title="Excluir"
                    @click="
                      askDelete(
                        alloc,
                        'allocation',
                        equipmentMap[alloc.equipment] ?? `Alocação #${alloc.id}`,
                      )
                    "
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </AppCard>

    <AppCard
      icon="bi-clipboard2-check-fill"
      title="Inspeções"
      :count="inspections.length"
      class="mt-4"
    >
      <template #actions>
        <RouterLink
          :to="`/constructions/${constructionId}/inspections/new`"
          class="btn btn-light btn-sm"
        >
          <i class="bi bi-plus-lg me-1"></i>Nova
        </RouterLink>
      </template>

      <div v-if="pageLoading" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="ps-4">#</th>
              <th>Data da Visita</th>
              <th>Status</th>
              <th>Pontuação</th>
              <th>Fiscal</th>
              <th>Conforme</th>
              <th>Laudo</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 2" :key="i">
              <td class="ps-4"><span class="skeleton" style="width: 24px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 100px; height: 14px"></span></td>
              <td>
                <span
                  class="skeleton"
                  style="width: 100px; height: 20px; border-radius: 20px"
                ></span>
              </td>
              <td><span class="skeleton" style="width: 40px; height: 14px"></span></td>
              <td><span class="skeleton" style="width: 130px; height: 14px"></span></td>
              <td>
                <span
                  class="skeleton"
                  style="width: 50px; height: 20px; border-radius: 20px"
                ></span>
              </td>
              <td>
                <span class="skeleton" style="width: 36px; height: 28px; border-radius: 6px"></span>
              </td>
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
              <th>Data da Visita</th>
              <th>Status</th>
              <th>Pontuação</th>
              <th>Fiscal</th>
              <th>Conforme</th>
              <th>Laudo</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-if="inspections.length === 0" key="empty-insp">
              <td colspan="8" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-1"></i>Nenhuma inspeção cadastrada.
                <div class="mt-2">
                  <RouterLink
                    :to="`/constructions/${constructionId}/inspections/new`"
                    class="btn btn-primary btn-sm"
                    >Cadastrar a primeira</RouterLink
                  >
                </div>
              </td>
            </tr>
            <tr v-for="insp in inspections" :key="insp.id">
              <td class="ps-4 text-muted">{{ insp.id }}</td>
              <td>{{ fmtDate(insp.visit_date) }}</td>
              <td><StatusBadge :value="insp.status_found" :map="statusFoundMap" /></td>
              <td>{{ insp.score }}</td>
              <td>{{ employeeMap[insp.employee] ?? '—' }}</td>
              <td><StatusBadge :value="insp.is_compliant" true-label="Sim" false-label="Não" /></td>
              <td>
                <div class="d-flex gap-1">
                  <RouterLink
                    :to="`/constructions/${constructionId}/inspections/${insp.id}/audit-report`"
                    class="btn btn-outline-secondary btn-sm"
                    :title="reportByInspection[insp.id] ? 'Ver Laudo' : 'Criar Laudo'"
                  >
                    <i
                      :class="
                        reportByInspection[insp.id]
                          ? 'bi bi-file-earmark-check'
                          : 'bi bi-file-earmark-plus'
                      "
                    ></i>
                  </RouterLink>
                  <a
                    v-if="reportByInspection[insp.id]"
                    :href="`/api/audit-reports/${constructionId}/${insp.id}/export-pdf/`"
                    target="_blank"
                    class="btn btn-outline-danger btn-sm"
                    title="Exportar PDF"
                  >
                    <i class="bi bi-file-earmark-pdf"></i>
                  </a>
                </div>
              </td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm" role="group">
                  <RouterLink
                    :to="`/constructions/${constructionId}/inspections/${insp.id}/edit`"
                    class="btn btn-outline-primary"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button
                    class="btn btn-outline-danger"
                    title="Excluir"
                    @click="askDelete(insp, 'inspection', `Inspeção #${insp.id}`)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </AppCard>

    <ConfirmModal
      :show="!!confirmTarget"
      :item-name="confirmTarget?.name"
      @confirm="confirmDelete"
      @cancel="confirmTarget = null"
    />
  </div>
</template>
