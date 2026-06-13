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

const { username, isAdmin, logout } = useAuth()

const isLoginPage = computed(() => route.path === '/login')

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/companies', icon: 'domain', label: 'Empresas' },
  { to: '/locations', icon: 'location_on', label: 'Locais' },
  { to: '/employees', icon: 'badge', label: 'Funcionários' },
  { to: '/equipments', icon: 'precision_manufacturing', label: 'Equipamentos' },
  { to: '/citizens', icon: 'groups', label: 'Cidadãos' },
  { to: '/constructions', icon: 'construction', label: 'Obras' },
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

    <div v-else-if="!isAdmin">
      <RouterView />
    </div>

    <div v-else class="app-layout" :class="{ 'sidebar-collapsed': collapsed }">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-brand">
          <span class="brand-id">
            <q-icon name="apartment" size="22px" class="brand-logo" />
            <span class="brand-name">InfraApp</span>
          </span>
          <button
            class="sidebar-toggle"
            :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
            @click="toggleCollapse"
          >
            <q-icon :name="collapsed ? 'chevron_right' : 'chevron_left'" size="18px" />
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
            <q-icon :name="item.icon" size="20px" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <q-icon name="account_circle" size="18px" />
            <span class="sidebar-username">{{ username }}</span>
          </div>
          <button class="sidebar-logout" :title="collapsed ? 'Sair' : ''" @click="handleLogout">
            <q-icon name="logout" size="18px" /><span class="logout-label">Sair</span>
          </button>
        </div>
      </aside>


      <div class="main-wrapper">
        <header class="topbar">
          <q-btn flat round dense color="grey-4" icon="menu" @click="sidebarOpen = !sidebarOpen" />
          <span class="topbar-title">InfraApp</span>

          <div class="topbar-right">
            <span class="topbar-user">
              <q-icon name="account_circle" size="16px" />{{ username }}
            </span>
            <q-btn flat round dense color="red-4" icon="logout" @click="handleLogout">
              <q-tooltip>Sair</q-tooltip>
            </q-btn>
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
