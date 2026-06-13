import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import Dashboard from '../views/Dashboard.vue'
import ClientLayout from '../layouts/ClientLayout.vue'
import ClientConstructionList from '../views/client/ClientConstructionList.vue'
import ClientConstructionDetail from '../views/client/ClientConstructionDetail.vue'
import CompanyList from '../views/companies/CompanyList.vue'
import CompanyForm from '../views/companies/CompanyForm.vue'
import CompanyEmployees from '../views/companies/CompanyEmployees.vue'
import CompanyEquipments from '../views/companies/CompanyEquipments.vue'
import LocationList from '../views/locations/LocationList.vue'
import LocationForm from '../views/locations/LocationForm.vue'
import CitizenList from '../views/citizens/CitizenList.vue'
import CitizenForm from '../views/citizens/CitizenForm.vue'
import EmployeeList from '../views/employees/EmployeeList.vue'
import EmployeeForm from '../views/employees/EmployeeForm.vue'
import EquipmentList from '../views/equipments/EquipmentList.vue'
import EquipmentForm from '../views/equipments/EquipmentForm.vue'
import ConstructionList from '../views/constructions/ConstructionList.vue'
import ConstructionForm from '../views/constructions/ConstructionForm.vue'
import ConstructionDetail from '../views/constructions/ConstructionDetail.vue'
import InspectionForm from '../views/inspections/InspectionForm.vue'
import AuditReportForm from '../views/audit_reports/AuditReportForm.vue'
import ConstructionEquipmentForm from '../views/construction_equipments/ConstructionEquipmentForm.vue'
import ContractForm from '../views/contracts/ContractForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', component: Dashboard, meta: { adminOnly: true } },
    { path: '/companies', component: CompanyList, meta: { adminOnly: true } },
    { path: '/companies/new', component: CompanyForm, meta: { adminOnly: true } },
    { path: '/companies/:id/edit', component: CompanyForm, meta: { adminOnly: true } },
    { path: '/companies/:companyId/employees', component: CompanyEmployees, meta: { adminOnly: true } },
    { path: '/companies/:companyId/employees/new', component: EmployeeForm, meta: { adminOnly: true } },
    { path: '/companies/:companyId/employees/:id/edit', component: EmployeeForm, meta: { adminOnly: true } },
    { path: '/companies/:companyId/equipments', component: CompanyEquipments, meta: { adminOnly: true } },
    { path: '/companies/:companyId/equipments/new', component: EquipmentForm, meta: { adminOnly: true } },
    { path: '/companies/:companyId/equipments/:id/edit', component: EquipmentForm, meta: { adminOnly: true } },
    { path: '/locations', component: LocationList, meta: { adminOnly: true } },
    { path: '/locations/new', component: LocationForm, meta: { adminOnly: true } },
    { path: '/locations/:id/edit', component: LocationForm, meta: { adminOnly: true } },
    { path: '/citizens', component: CitizenList, meta: { adminOnly: true } },
    { path: '/citizens/new', component: CitizenForm, meta: { adminOnly: true } },
    { path: '/citizens/:id/edit', component: CitizenForm, meta: { adminOnly: true } },
    { path: '/employees', component: EmployeeList, meta: { adminOnly: true } },
    { path: '/employees/new', component: EmployeeForm, meta: { adminOnly: true } },
    { path: '/employees/:id/edit', component: EmployeeForm, meta: { adminOnly: true } },
    { path: '/equipments', component: EquipmentList, meta: { adminOnly: true } },
    { path: '/equipments/new', component: EquipmentForm, meta: { adminOnly: true } },
    { path: '/equipments/:id/edit', component: EquipmentForm, meta: { adminOnly: true } },
    { path: '/constructions', component: ConstructionList },
    { path: '/constructions/new', component: ConstructionForm },
    { path: '/constructions/:id/edit', component: ConstructionForm },
    { path: '/constructions/:id/inspections/new', component: InspectionForm },
    { path: '/constructions/:id/inspections/:inspectionId/edit', component: InspectionForm },
    { path: '/constructions/:id/inspections/:inspectionId/audit-report', component: AuditReportForm },
    { path: '/constructions/:id/equipments/new', component: ConstructionEquipmentForm },
    { path: '/constructions/:id/equipments/:allocationId/edit', component: ConstructionEquipmentForm },
    { path: '/constructions/:id/contracts/new', component: ContractForm },
    { path: '/constructions/:id/contracts/:contractId/edit', component: ContractForm },
    { path: '/constructions/:id', component: ConstructionDetail },
    {
      path: '/client',
      component: ClientLayout,
      children: [
        { path: '', component: ClientConstructionList },
        { path: 'constructions/:id', component: ClientConstructionDetail },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.path === '/login') return true
  const { checkAuth, isAdmin } = useAuth()
  const ok = await checkAuth()
  if (!ok) return '/login'
  if (to.meta.adminOnly && !isAdmin.value) return '/client'
})

export default router
