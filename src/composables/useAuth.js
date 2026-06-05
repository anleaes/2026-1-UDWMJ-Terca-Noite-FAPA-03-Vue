import { ref } from 'vue'

const isAuthenticated = ref(false)
const username = ref('')
let checked = false

export function useAuth() {
  async function checkAuth() {
    if (checked) return isAuthenticated.value
    try {
      const res = await fetch('/api/accounts/api-me/')
      checked = true
      if (res.ok) {
        const data = await res.json()
        isAuthenticated.value = data.ok
        username.value = data.username ?? ''
      } else {
        isAuthenticated.value = false
      }
    } catch {
      isAuthenticated.value = false
      checked = true
    }
    return isAuthenticated.value
  }

  async function login(user, pass) {
    const res = await fetch('/api/accounts/api-login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    })
    const data = await res.json()
    if (res.ok) {
      isAuthenticated.value = true
      username.value = data.username
      checked = true
      return null
    }
    return data.error ?? 'Erro ao fazer login.'
  }

  async function logout() {
    try {
      await fetch('/api/accounts/api-logout/')
    } catch {
    }
    isAuthenticated.value = false
    username.value = ''
    checked = false
  }

  return { isAuthenticated, username, checkAuth, login, logout }
}
