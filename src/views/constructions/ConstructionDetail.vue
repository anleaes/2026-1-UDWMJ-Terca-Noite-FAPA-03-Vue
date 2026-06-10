<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { statusOf, typeOf, statusFoundOf } from './constructions'
import HeroHeader from '../../components/ui/HeroHeader.vue'
import SoftChip from '../../components/ui/SoftChip.vue'
import TableSkeleton from '../../components/ui/TableSkeleton.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
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

const contractColumns = [
  { name: 'number', label: 'Número', field: 'number', align: 'left', sortable: true },
  { name: 'signing_date', label: 'Data Assinatura', field: 'signing_date', align: 'left', sortable: true },
  { name: 'value', label: 'Valor', field: 'value', align: 'left', sortable: true },
  { name: 'validity_days', label: 'Validade (dias)', field: 'validity_days', align: 'left', sortable: true },
  { name: 'company', label: 'Empresa', field: 'company', align: 'left', sortable: true },
  { name: 'is_active', label: 'Ativo', field: 'is_active', align: 'center', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const allocationColumns = [
  { name: 'equipment', label: 'Equipamento', field: 'equipment', align: 'left', sortable: true },
  { name: 'allocation_date', label: 'Data Alocação', field: 'allocation_date', align: 'left', sortable: true },
  { name: 'return_date', label: 'Data Devolução', field: 'return_date', align: 'left', sortable: true },
  { name: 'usage_cost', label: 'Custo de Uso', field: 'usage_cost', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const inspectionColumns = [
  { name: 'visit_date', label: 'Data da Visita', field: 'visit_date', align: 'left', sortable: true },
  { name: 'status_found', label: 'Status', field: 'status_found', align: 'left', sortable: true },
  { name: 'score', label: 'Pontuação', field: 'score', align: 'left', sortable: true },
  { name: 'employee', label: 'Fiscal', field: 'employee', align: 'left', sortable: true },
  { name: 'is_compliant', label: 'Conforme', field: 'is_compliant', align: 'center', sortable: true },
  { name: 'audit_report', label: 'Laudo', field: 'audit_report', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

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
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Excluir <strong>${name}</strong>?`,
    html: true,
    dark: true,
    persistent: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-5' },
    ok: { label: 'Excluir', unelevated: true, color: 'negative', icon: 'delete' },
  }).onOk(() => doDelete(item, type, name))
}

async function doDelete(item, type, name) {
  const endpointMap = {
    contract: '/api/contracts/',
    allocation: '/api/constructionequipments/',
    inspection: '/api/inspections/',
  }

  const res = await fetch(`${endpointMap[type]}${item.id}/`, { method: 'DELETE' })
  if (res.ok || res.status === 204) {
    if (type === 'contract') contracts.value = contracts.value.filter((c) => c.id !== item.id)
    if (type === 'allocation') allocations.value = allocations.value.filter((a) => a.id !== item.id)
    if (type === 'inspection') inspections.value = inspections.value.filter((i) => i.id !== item.id)
    $q.notify({ type: 'positive', message: `"${name}" excluído.`, icon: 'check_circle', position: 'bottom-right' })
  } else {
    $q.notify({ type: 'negative', message: 'Erro ao excluir.', icon: 'error', position: 'bottom-right' })
  }
}
</script>

<template>
  <div>
    <HeroHeader
      icon="construction"
      :title="construction?.title ?? 'Carregando...'"
      :subtitle="construction ? typeOf(construction.type).label : ''"
      :show-search="false"
      back-to="/constructions"
    >
      <template #actions>
        <q-btn
          unelevated
          no-caps
          icon="edit"
          label="Editar"
          class="btn-accent"
          :to="`/constructions/${constructionId}/edit`"
        />
      </template>
    </HeroHeader>

    <q-card flat class="info-card q-mt-lg">
      <q-card-section v-if="pageLoading">
        <div class="row q-col-gutter-md">
          <div v-for="i in 6" :key="i" class="col-6 col-md-3">
            <div class="skeleton-label"></div>
            <div class="skeleton-value"></div>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-else>
        <div class="row q-col-gutter-lg">
          <div class="col-6 col-md-3">
            <p class="info-label">Status</p>
            <SoftChip
              :color="statusOf(construction.status).color"
              :icon="statusOf(construction.status).icon"
              :label="statusOf(construction.status).label"
            />
          </div>
          <div class="col-6 col-md-3">
            <p class="info-label">Tipo</p>
            <SoftChip
              :color="typeOf(construction.type).color"
              :icon="typeOf(construction.type).icon"
              :label="typeOf(construction.type).label"
            />
          </div>
          <div class="col-6 col-md-3">
            <p class="info-label">Início</p>
            <span class="info-value mono">{{ construction.start_date ?? '—' }}</span>
          </div>
          <div class="col-6 col-md-3">
            <p class="info-label">Término Previsto</p>
            <span class="info-value mono">{{ construction.expected_end_date ?? '—' }}</span>
          </div>
          <div class="col-12 col-md-6">
            <p class="info-label">Empresa</p>
            <span class="info-value">{{ companyMap[construction.company] ?? '—' }}</span>
          </div>
          <div class="col-12 col-md-6">
            <p class="info-label">Valor Total</p>
            <span class="info-value mono">{{ fmtCurrency(construction.total_value) }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat class="section-card q-mt-lg">
      <div class="section-header">
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="section-icon">
            <q-icon name="description" size="18px" />
          </div>
          <span class="section-title">Contratos</span>
          <q-badge v-if="!pageLoading" rounded :label="contracts.length" color="indigo-7" />
        </div>
        <q-btn
          unelevated
          no-caps
          dense
          icon="add"
          label="Novo"
          class="btn-accent"
          size="sm"
          :to="`/constructions/${constructionId}/contracts/new`"
        />
      </div>

      <TableSkeleton v-if="pageLoading" :columns="contractColumns" :rows="2" />
      <q-table
        v-else
        dark
        flat
        class="list-table"
        :rows="contracts"
        :columns="contractColumns"
        :pagination="{ rowsPerPage: 5 }"
        row-key="id"
      >
        <template #body-cell-number="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ props.row.number }}</span>
          </q-td>
        </template>

        <template #body-cell-value="props">
          <q-td :props="props">
            <span class="mono">{{ fmtCurrency(props.row.value) }}</span>
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props">{{ companyMap[props.row.company] ?? '—' }}</q-td>
        </template>

        <template #body-cell-is_active="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_active ? '#34d399' : '#94a3b8'"
              :icon="props.row.is_active ? 'check_circle' : 'remove_circle'"
              :label="props.row.is_active ? 'Ativo' : 'Encerrado'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn
                flat round dense icon="edit" color="indigo-3"
                :to="`/constructions/${constructionId}/contracts/${props.row.id}/edit`"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense icon="delete" color="negative"
                @click="askDelete(props.row, 'contract', props.row.number)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center empty-state">
            <div class="empty-tile"><q-icon name="description" size="28px" /></div>
            <p class="q-mt-md q-mb-xs" style="color: var(--text-2)">Nenhum contrato cadastrado.</p>
            <q-btn
              class="btn-accent q-mt-sm"
              unelevated no-caps
              label="Cadastrar o primeiro"
              icon="add"
              size="sm"
              :to="`/constructions/${constructionId}/contracts/new`"
            />
          </div>
        </template>
      </q-table>
    </q-card>

    <q-card flat class="section-card q-mt-lg">
      <div class="section-header">
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="section-icon">
            <q-icon name="hardware" size="18px" />
          </div>
          <span class="section-title">Equipamentos Alocados</span>
          <q-badge v-if="!pageLoading" rounded :label="allocations.length" color="indigo-7" />
        </div>
        <q-btn
          unelevated
          no-caps
          dense
          icon="add"
          label="Alocar"
          class="btn-accent"
          size="sm"
          :to="`/constructions/${constructionId}/equipments/new`"
        />
      </div>

      <TableSkeleton v-if="pageLoading" :columns="allocationColumns" :rows="2" />
      <q-table
        v-else
        dark
        flat
        class="list-table"
        :rows="allocations"
        :columns="allocationColumns"
        :pagination="{ rowsPerPage: 5 }"
        row-key="id"
      >
        <template #body-cell-equipment="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ equipmentMap[props.row.equipment] ?? props.row.equipment }}</span>
          </q-td>
        </template>

        <template #body-cell-allocation_date="props">
          <q-td :props="props">
            <span class="mono">{{ props.row.allocation_date ?? '—' }}</span>
          </q-td>
        </template>

        <template #body-cell-return_date="props">
          <q-td :props="props">
            <span class="mono">{{ props.row.return_date ?? '—' }}</span>
          </q-td>
        </template>

        <template #body-cell-usage_cost="props">
          <q-td :props="props">
            <span class="mono">{{ fmtCurrency(props.row.usage_cost) }}</span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn
                flat round dense icon="edit" color="indigo-3"
                :to="`/constructions/${constructionId}/equipments/${props.row.id}/edit`"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense icon="delete" color="negative"
                @click="askDelete(props.row, 'allocation', equipmentMap[props.row.equipment] ?? `Alocação #${props.row.id}`)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center empty-state">
            <div class="empty-tile"><q-icon name="hardware" size="28px" /></div>
            <p class="q-mt-md q-mb-xs" style="color: var(--text-2)">Nenhum equipamento alocado.</p>
            <q-btn
              class="btn-accent q-mt-sm"
              unelevated no-caps
              label="Alocar o primeiro"
              icon="add"
              size="sm"
              :to="`/constructions/${constructionId}/equipments/new`"
            />
          </div>
        </template>
      </q-table>
    </q-card>

    <q-card flat class="section-card q-mt-lg">
      <div class="section-header">
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="section-icon">
            <q-icon name="fact_check" size="18px" />
          </div>
          <span class="section-title">Inspeções</span>
          <q-badge v-if="!pageLoading" rounded :label="inspections.length" color="indigo-7" />
        </div>
        <q-btn
          unelevated
          no-caps
          dense
          icon="add"
          label="Nova"
          class="btn-accent"
          size="sm"
          :to="`/constructions/${constructionId}/inspections/new`"
        />
      </div>

      <TableSkeleton v-if="pageLoading" :columns="inspectionColumns" :rows="2" />
      <q-table
        v-else
        dark
        flat
        class="list-table"
        :rows="inspections"
        :columns="inspectionColumns"
        :pagination="{ rowsPerPage: 5 }"
        row-key="id"
      >
        <template #body-cell-visit_date="props">
          <q-td :props="props">
            <span class="mono">{{ fmtDate(props.row.visit_date) }}</span>
          </q-td>
        </template>

        <template #body-cell-status_found="props">
          <q-td :props="props">
            <SoftChip
              :color="statusFoundOf(props.row.status_found).color"
              :icon="statusFoundOf(props.row.status_found).icon"
              :label="statusFoundOf(props.row.status_found).label"
            />
          </q-td>
        </template>

        <template #body-cell-employee="props">
          <q-td :props="props">{{ employeeMap[props.row.employee] ?? '—' }}</q-td>
        </template>

        <template #body-cell-is_compliant="props">
          <q-td :props="props">
            <SoftChip
              :color="props.row.is_compliant ? '#34d399' : '#fb7185'"
              :icon="props.row.is_compliant ? 'check_circle' : 'cancel'"
              :label="props.row.is_compliant ? 'Sim' : 'Não'"
            />
          </q-td>
        </template>

        <template #body-cell-audit_report="props">
          <q-td :props="props">
            <div class="row items-center no-wrap" style="gap: 4px">
              <q-btn
                flat round dense
                :icon="reportByInspection[props.row.id] ? 'task' : 'note_add'"
                :color="reportByInspection[props.row.id] ? 'positive' : 'grey-5'"
                :to="`/constructions/${constructionId}/inspections/${props.row.id}/audit-report`"
              >
                <q-tooltip>{{ reportByInspection[props.row.id] ? 'Ver Laudo' : 'Criar Laudo' }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="reportByInspection[props.row.id]"
                flat round dense
                icon="picture_as_pdf"
                color="negative"
                tag="a"
                :href="`/api/audit-reports/${constructionId}/${props.row.id}/export-pdf/`"
                target="_blank"
              >
                <q-tooltip>Exportar PDF</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row-actions">
              <q-btn
                flat round dense icon="edit" color="indigo-3"
                :to="`/constructions/${constructionId}/inspections/${props.row.id}/edit`"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense icon="delete" color="negative"
                @click="askDelete(props.row, 'inspection', `Inspeção #${props.row.id}`)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center empty-state">
            <div class="empty-tile"><q-icon name="fact_check" size="28px" /></div>
            <p class="q-mt-md q-mb-xs" style="color: var(--text-2)">Nenhuma inspeção cadastrada.</p>
            <q-btn
              class="btn-accent q-mt-sm"
              unelevated no-caps
              label="Cadastrar a primeira"
              icon="add"
              size="sm"
              :to="`/constructions/${constructionId}/inspections/new`"
            />
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style scoped>
.info-card,
.section-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
  margin: 0 0 6px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--grad-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-1);
}

.row-actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s;
}

:deep(tr:hover) .row-actions {
  opacity: 1;
}

@media (hover: none) {
  .row-actions {
    opacity: 1;
  }
}

.empty-state {
  padding: 36px;
}

.empty-tile {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--grad-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.mono {
  font-variant-numeric: tabular-nums;
}

.skeleton-label {
  height: 10px;
  width: 60px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.07);
  margin-bottom: 8px;
  animation: infra-shimmer 1.5s infinite;
}

.skeleton-value {
  height: 20px;
  width: 100px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.07);
  animation: infra-shimmer 1.5s infinite;
}
</style>
