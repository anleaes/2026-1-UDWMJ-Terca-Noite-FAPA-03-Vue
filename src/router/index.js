import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CompanyList from '../views/companies/CompanyList.vue'
import CompanyForm from '../views/companies/CompanyForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/companies', component: CompanyList },
    { path: '/companies/new', component: CompanyForm },
    { path: '/companies/:id/edit', component: CompanyForm },
  ],
})

export default router
