<script setup>
import { ref, computed, provide } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { createToastService, TOAST_KEY } from './composables/useToast'
import ToastContainer from './components/ToastContainer.vue'
import { useAuth } from './composables/useAuth'

const toast = createToastService()
provide(TOAST_KEY, toast)

const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)
const collapsed = ref(localStorage.getItem('sidebarCollapsed') === '1')

function toggleCollapse() {
  collapsed.value = !collapsed.value
  localStorage.setItem('sidebarCollapsed', collapsed.value ? '1' : '0')
}

const { username, logout } = useAuth()

const isLoginPage = computed(() => route.path === '/login')

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

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <div v-if="isLoginPage">
      <RouterView />
    </div>

    <div v-else class="app-layout" :class="{ 'sidebar-collapsed': collapsed }">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-brand">
          <span class="brand-id">
            <i class="bi bi-building-fill brand-logo"></i>
            <span class="brand-name">InfraApp</span>
          </span>
          <button
            class="sidebar-toggle"
            :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
            @click="toggleCollapse"
          >
            <i class="bi" :class="collapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
          </button>
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
            :title="item.label"
            @click="sidebarOpen = false"
          >
            <i :class="`bi ${item.icon}`"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <i class="bi bi-person-circle me-2"></i>
            <span class="sidebar-username">{{ username }}</span>
          </div>
          <button class="sidebar-logout" :title="collapsed ? 'Sair' : ''" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i><span class="logout-label">Sair</span>
          </button>
        </div>
      </aside>


      <div class="main-wrapper">
        <header class="topbar">
          <button class="btn btn-link text-dark p-0" @click="sidebarOpen = !sidebarOpen">
            <i class="bi bi-list fs-4"></i>
          </button>
          <span class="fw-semibold ms-2">InfraApp</span>

          <div class="ms-auto d-flex align-items-center gap-3">
            <span class="text-muted small d-none d-md-inline">
              <i class="bi bi-person-circle me-1"></i>{{ username }}
            </span>
            <button class="btn btn-outline-danger btn-sm" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
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
  </div>
</template>
