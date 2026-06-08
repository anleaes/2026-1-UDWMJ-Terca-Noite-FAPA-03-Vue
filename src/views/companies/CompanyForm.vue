<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import { vMaskCnpj, vMaskPhone } from '../../composables/useMask'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, fetchOne, save } = useCrud('/api/companies/')
const toast = useToast()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  corporate_name: '',
  corporate_tax_id: '',
  email: '',
  phone: '',
  is_active: true,
})

const form = ref(emptyForm())

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      const data = await fetchOne(id)
      if (data) form.value = data
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

function syncCnpj() {
  const input = document.getElementById('cnpjInput')
  if (input) form.value.corporate_tax_id = input.value
}

function syncPhone() {
  const input = document.getElementById('phoneInput')
  if (input) form.value.phone = input.value
}

async function submit() {
  syncCnpj()
  syncPhone()

  const cnpjInput = document.getElementById('cnpjInput')
  if (cnpjInput && cnpjInput.classList.contains('is-invalid')) return

  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    toast.add(isEdit.value ? 'Empresa atualizada com sucesso.' : 'Empresa cadastrada com sucesso.')
    router.push('/companies')
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-buildings' : 'bi-building-add'"
        :title="isEdit ? 'Editar Empresa' : 'Cadastro de Empresa'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados da Empresa</h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Razão Social</label>
                <input v-model="form.corporate_name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">CNPJ</label>
                <input
                  id="cnpjInput"
                  v-model="form.corporate_tax_id"
                  v-mask-cnpj
                  @mask-change="syncCnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Telefone</label>
                <input
                  id="phoneInput"
                  v-model="form.phone"
                  v-mask-phone
                  @mask-change="syncPhone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  class="form-control"
                />
              </div>
              <div class="col-12">
                <label class="form-label">E-mail</label>
                <input v-model="form.email" type="email" class="form-control" required />
              </div>
              <div class="col-12">
                <div class="form-check form-switch">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="form-check-input"
                    id="isActive"
                    role="switch"
                  />
                  <label class="form-check-label" for="isActive">Empresa ativa</label>
                </div>
              </div>
            </div>

            <Transition name="slide-down">
              <div v-if="error" class="alert alert-danger mt-4">
                <strong><i class="bi bi-exclamation-circle me-1"></i>Verifique os campos:</strong>
                <ul class="mb-0 mt-1">
                  <li v-for="(msgs, field) in error" :key="field">
                    {{ field }}: {{ Array.isArray(msgs) ? msgs.join(', ') : msgs }}
                  </li>
                </ul>
              </div>
            </Transition>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <RouterLink to="/companies" class="btn btn-outline-secondary">Cancelar</RouterLink>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </AppCard>
    </div>
  </div>
</template>
