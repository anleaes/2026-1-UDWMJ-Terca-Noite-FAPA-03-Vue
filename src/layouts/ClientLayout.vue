<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { username, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="client-app">
    <header class="client-nav">
      <div class="client-nav-inner">
        <div class="client-nav-brand">
          <div class="client-nav-logo">
            <q-icon name="apartment" size="20px" />
          </div>
          <span class="client-nav-brand-name">InfraApp</span>
        </div>
        <div class="client-nav-right">
          <span class="client-nav-user">
            <q-icon name="account_circle" size="18px" />
            {{ username }}
          </span>
          <q-btn
            flat no-caps dense
            class="client-nav-logout"
            icon="logout"
            label="Sair"
            size="sm"
            @click="handleLogout"
          />
        </div>
      </div>
    </header>

    <main class="client-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.client-app {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

.client-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.client-nav-inner {
  height: 64px;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.client-nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-nav-logo {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
}

.client-nav-brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.02em;
}

.client-nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.client-nav-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
}

.client-nav-logout {
  color: #fb7185;
  font-weight: 600;
}

.client-main {
  flex: 1;
  padding: 32px 24px 48px;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .client-nav-user { display: none; }
  .client-main { padding: 20px 16px 36px; }
}
</style>
