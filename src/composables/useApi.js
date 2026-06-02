import { ref } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  async function request(url, options = {}) {
    loading.value = true
    error.value = null
    try {
      const hasBody = options.body !== undefined
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
        body: hasBody ? JSON.stringify(options.body) : undefined,
      })

      if (!res.ok) {
        error.value = await res.json().catch(() => ({ detail: 'Erro desconhecido.' }))
        return null
      }

      if (res.status === 204) return true
      return await res.json()
    } catch {
      error.value = { detail: 'Erro de conexão com o servidor.' }
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, request }
}
