<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isEdit = !!route.params.id
const error = ref(null)

const form = ref({
  corporate_name: '',
  corporate_tax_id: '',
  email: '',
  phone: '',
  is_active: true,
})

async function fetchCompany() {
  const res = await fetch(`/api/companies/${route.params.id}/`)
  form.value = await res.json()
}

async function submit() {
  error.value = null
  const url = isEdit ? `/api/companies/${route.params.id}/` : '/api/companies/'
  const method = isEdit ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value),
  })

  if (res.ok) {
    router.push('/companies')
  } else {
    const data = await res.json()
    error.value = data
  }
}

onMounted(() => {
  if (isEdit) fetchCompany()
})
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card app-card">
        <div class="card-header d-flex align-items-center">
          <i class="bi bi-building-add fs-4 me-2"></i>
          <h4>{{ isEdit ? 'Editar Empresa' : 'Cadastro de Empresa' }}</h4>
        </div>
        <div class="card-body p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3">Dados da Empresa</h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Razão Social</label>
                <input v-model="form.corporate_name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">CNPJ</label>
                <input v-model="form.corporate_tax_id" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Telefone</label>
                <input v-model="form.phone" type="text" class="form-control" required />
              </div>
              <div class="col-12">
                <label class="form-label">E-mail</label>
                <input v-model="form.email" type="email" class="form-control" required />
              </div>
              <div class="col-12">
                <div class="form-check">
                  <input v-model="form.is_active" type="checkbox" class="form-check-input" id="isActive" />
                  <label class="form-check-label" for="isActive">Empresa ativa</label>
                </div>
              </div>
            </div>

            <div v-if="error" class="alert alert-danger mt-4">
              <strong>Verifique os campos:</strong>
              <ul class="mb-0">
                <li v-for="(msgs, field) in error" :key="field">
                  {{ field }}: {{ Array.isArray(msgs) ? msgs.join(', ') : msgs }}
                </li>
              </ul>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <RouterLink to="/companies" class="btn btn-outline-secondary">Cancelar</RouterLink>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check2-circle me-1"></i>Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
