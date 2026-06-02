import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CompanyList from '../views/companies/CompanyList.vue'
import CompanyForm from '../views/companies/CompanyForm.vue'
import LocationList from '../views/locations/LocationList.vue'
import LocationForm from '../views/locations/LocationForm.vue'

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
  ],
})

export default router
