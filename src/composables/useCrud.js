import { ref } from 'vue'
import { useApi } from './useApi'

export function useCrud(endpoint) {
  const items = ref([])
  const { loading, error, request } = useApi()

  async function fetchAll() {
    const data = await request(endpoint)
    if (data) items.value = data
  }

  async function fetchOne(id) {
    return request(`${endpoint}${id}/`)
  }

  async function save(payload, id = null) {
    return request(id ? `${endpoint}${id}/` : endpoint, {
      method: id ? 'PUT' : 'POST',
      body: payload,
    })
  }

  async function remove(id) {
    return request(`${endpoint}${id}/`, { method: 'DELETE' })
  }

  return { items, loading, error, fetchAll, fetchOne, save, remove }
}
