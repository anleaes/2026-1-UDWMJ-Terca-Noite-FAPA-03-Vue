import { ref } from 'vue'

export function useCompanyMap() {
  const companyMap = ref({})

  async function fetchCompanyMap() {
    const data = await fetch('/api/companies/').then((r) => r.json())
    companyMap.value = Object.fromEntries(data.map((c) => [c.id, c.corporate_name]))
  }

  return { companyMap, fetchCompanyMap }
}
