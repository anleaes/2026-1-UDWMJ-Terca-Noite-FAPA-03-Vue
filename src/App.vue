<script setup>
import { ref, provide } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { createToastService, TOAST_KEY } from './composables/useToast'
import ToastContainer from './components/ToastContainer.vue'

const toast = createToastService()
provide(TOAST_KEY, toast)

const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
  { to: '/companies', icon: 'bi-buildings', label: 'Empresas' },
  { to: '/locations', icon: 'bi-geo-alt', label: 'Locais' },
  { to: '/employees', icon: 'bi-people', label: 'Funcionários' },
  { to: '/equipments', icon: 'bi-tools', label: 'Equipamentos' },
  { to: '/citizens', icon: 'bi-person-vcard', label: 'Cidadãos' },
  { to: '/constructions', icon: 'bi-cone-striped', label: 'Obras' },
]

function isActive(item) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>

<template>
  <div class="app-layout">
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-brand">
        <i class="bi bi-building-fill me-2"></i>
        <span>InfraApp</span>
      </div>

      <nav class="sidebar-nav">
        <p class="sidebar-section-label">Menu</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          active-class=""
          exact-active-class=""
          class="sidebar-link"
          :class="{ active: isActive(item) }"
          @click="sidebarOpen = false"
        >
          <i :class="`bi ${item.icon}`"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <button class="btn btn-link text-dark p-0" @click="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list fs-4"></i>
        </button>
        <span class="fw-semibold ms-2">InfraApp</span>
      </header>

      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>

  <ToastContainer />
</template>
