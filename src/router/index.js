import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CompanyList from '../views/companies/CompanyList.vue'
import CompanyForm from '../views/companies/CompanyForm.vue'
import LocationList from '../views/locations/LocationList.vue'
import LocationForm from '../views/locations/LocationForm.vue'
import CitizenList from '../views/citizens/CitizenList.vue'
import CitizenForm from '../views/citizens/CitizenForm.vue'
import EmployeeList from '../views/employees/EmployeeList.vue'
import EmployeeForm from '../views/employees/EmployeeForm.vue'
import EquipmentList from '../views/equipments/EquipmentList.vue'
import EquipmentForm from '../views/equipments/EquipmentForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/companies', component: CompanyList },
    { path: '/companies/new', component: CompanyForm },
    { path: '/companies/:id/edit', component: CompanyForm },
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
  ],
})

export default router
