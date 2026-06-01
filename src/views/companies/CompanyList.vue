<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const companies = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchCompanies() {
  try {
    const res = await fetch('/api/companies/')
    companies.value = await res.json()
  } catch (e) {
    error.value = 'Erro ao carregar empresas.'
  } finally {
    loading.value = false
  }
}

async function deleteCompany(id, name) {
  if (!confirm(`Confirma a exclusão da empresa ${name}?`)) return
  await fetch(`/api/companies/${id}/`, { method: 'DELETE' })
  companies.value = companies.value.filter((c) => c.id !== id)
}

onMounted(fetchCompanies)
</script>

<template>
  <div class="card app-card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <i class="bi bi-building-fill fs-4 me-2"></i>
        <h4>Empresas</h4>
      </div>
      <RouterLink to="/companies/new" class="btn btn-light btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Nova
      </RouterLink>
    </div>

    <div class="card-body p-0">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger m-3">{{ error }}</div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="ps-4">#</th>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Contato</th>
              <th class="text-center">Status</th>
              <th class="text-end pe-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="companies.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                Nenhuma empresa cadastrada.
                <div class="mt-2">
                  <RouterLink to="/companies/new" class="btn btn-primary btn-sm">
                    Cadastrar a primeira
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr v-for="company in companies" :key="company.id">
              <td class="ps-4 text-muted">{{ company.id }}</td>
              <td class="fw-semibold">{{ company.corporate_name }}</td>
              <td>{{ company.corporate_tax_id }}</td>
              <td>
                <div>{{ company.email }}</div>
                <small class="text-muted">{{ company.phone }}</small>
              </td>
              <td class="text-center">
                <span
                  :class="
                    company.is_active ? 'badge badge-soft-success' : 'badge badge-soft-danger'
                  "
                >
                  {{ company.is_active ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm" role="group">
                  <RouterLink
                    :to="`/companies/${company.id}/edit`"
                    class="btn btn-outline-primary"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button
                    class="btn btn-outline-danger"
                    title="Excluir"
                    @click="deleteCompany(company.id, company.corporate_name)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
