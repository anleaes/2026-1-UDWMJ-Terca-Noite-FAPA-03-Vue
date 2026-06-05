<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  const err = await login(form.value.username, form.value.password)
  loading.value = false
  if (err) {
    error.value = err
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page d-flex justify-content-center align-items-center vh-100">
    <div class="login-card w-100 mx-3">
      <div class="login-card-header text-center text-white">
        <i class="bi bi-building-fill fs-2 d-block mb-2"></i>
        <h4 class="mb-0 fw-bold">InfraApp</h4>
        <p class="mb-0 small opacity-75 mt-1">Sistema de Infraestrutura</p>
      </div>

      <div class="login-card-body p-4">
        <h6 class="text-center text-muted mb-4 fw-semibold">Acesse sua conta</h6>

        <Transition name="slide-down">
          <div v-if="error" class="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <form @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label for="username" class="form-label fw-semibold small">
              <i class="bi bi-person me-1"></i>Usuário
            </label>
            <input
              v-model="form.username"
              id="username"
              type="text"
              class="form-control form-control-lg"
              placeholder="Digite seu usuário"
              autocomplete="username"
              autofocus
              required
            />
          </div>

          <div class="mb-4">
            <label for="password" class="form-label fw-semibold small">
              <i class="bi bi-lock me-1"></i>Senha
            </label>
            <input
              v-model="form.password"
              id="password"
              type="password"
              class="form-control form-control-lg"
              placeholder="Digite sua senha"
              autocomplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-100"
            :disabled="loading || !form.username || !form.password"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-box-arrow-in-right me-2"></i>
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>

      <div class="login-card-footer text-center text-muted small py-3">
        <i class="bi bi-shield-lock me-1"></i>Acesso restrito a usuários autorizados
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d6efd22 100%);
  min-height: 100vh;
}

.login-card {
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: loginFadeIn 0.4s ease-out;
}

@keyframes loginFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card-header {
  background: linear-gradient(135deg, #0d6efd, #6610f2);
  padding: 2rem 1.5rem 1.5rem;
}

.login-card-body {
  padding: 1.5rem;
}

.login-card-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.form-control-lg {
  border-radius: 10px;
  border-color: #dee2e6;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control-lg:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.btn-lg {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
