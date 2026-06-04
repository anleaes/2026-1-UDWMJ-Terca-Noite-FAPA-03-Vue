import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
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
    { path: '/', component: Dashboard },
    { path: '/companies', component: CompanyList },
    { path: '/companies/new', component: CompanyForm },
    { path: '/companies/:id/edit', component: CompanyForm },
    { path: '/companies/:id/employees', component: CompanyEmployees },
    { path: '/companies/:id/equipments', component: CompanyEquipments },
    { path: '/locations', component: LocationList },
    { path: '/locations/new', component: LocationForm },
    { path: '/locations/:id/edit', component: LocationForm },
    { path: '/citizens', component: CitizenList },
    { path: '/citizens/new', component: CitizenForm },
    { path: '/citizens/:id/edit', component: CitizenForm },
    { path: '/employees', component: EmployeeList },
    { path: '/employees/new', component: EmployeeForm },
    { path: '/employees/:id/edit', component: EmployeeForm },
    { path: '/equipments', component: EquipmentList },
    { path: '/equipments/new', component: EquipmentForm },
    { path: '/equipments/:id/edit', component: EquipmentForm },
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
  ],
})

export default router
