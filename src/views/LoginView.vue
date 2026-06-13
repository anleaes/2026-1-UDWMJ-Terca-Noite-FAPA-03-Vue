<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, isAdmin } = useAuth()

const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  const err = await login(form.value.username, form.value.password)
  loading.value = false
  if (err) {
    error.value = err
  } else {
    router.push(isAdmin.value ? '/' : '/client')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-glow login-glow--one" />
    <div class="login-glow login-glow--two" />

    <q-card flat class="login-card">
      <div class="login-hero">
        <div class="login-hero-glow" />
        <div class="brand-tile">
          <q-icon name="apartment" size="30px" />
        </div>
        <h1 class="brand-name">InfraApp</h1>
        <p class="brand-sub">Sistema de Infraestrutura</p>
      </div>

      <q-form class="login-body" @submit.prevent="submit" novalidate>
        <p class="login-title">Acesse sua conta</p>

        <q-slide-transition>
          <q-banner v-if="error" dense rounded class="login-error">
            <template #avatar>
              <q-icon name="error" color="negative" />
            </template>
            {{ error }}
          </q-banner>
        </q-slide-transition>

        <q-input
          v-model="form.username"
          outlined
          dark
          color="indigo-3"
          label="Usuário"
          autocomplete="username"
          autofocus
        >
          <template #prepend><q-icon name="person" /></template>
        </q-input>

        <q-input
          v-model="form.password"
          outlined
          dark
          color="indigo-3"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
        >
          <template #prepend><q-icon name="lock" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          class="btn-accent login-btn"
          unelevated
          no-caps
          size="lg"
          :loading="loading"
          :disable="!form.username || !form.password"
          label="Entrar"
          icon-right="login"
        >
          <template #loading>
            <q-spinner-dots />
          </template>
        </q-btn>

        <div class="login-foot">
          <q-icon name="shield" size="14px" />
          <span>Acesso restrito a usuários autorizados</span>
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-page);
  overflow: hidden;
}

.login-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
}

.login-glow--one {
  top: -180px;
  left: -140px;
  background: var(--glow-accent);
}

.login-glow--two {
  bottom: -200px;
  right: -160px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  animation: loginFadeIn 0.45s ease-out;
}

@keyframes loginFadeIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-hero {
  position: relative;
  padding: 36px 24px 28px;
  text-align: center;
  background: var(--grad-accent);
  overflow: hidden;
}

.login-hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.35), transparent 60%);
  pointer-events: none;
}

.brand-tile {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 30px rgba(8, 10, 20, 0.35);
}

.brand-name {
  position: relative;
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
}

.brand-sub {
  position: relative;
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.78);
}

.login-body {
  padding: 30px 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-title {
  margin: 0 0 2px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-2);
}

.login-error {
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.3);
  color: #fecdd3;
  border-radius: 12px;
}

.login-btn {
  margin-top: 4px;
  height: 50px;
  font-weight: 600;
  border-radius: 14px;
}

.login-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--text-3);
}
</style>
