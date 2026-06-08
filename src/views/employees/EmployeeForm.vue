<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import { vMaskCpf, vMaskPhone } from '../../composables/useMask'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, fetchOne, save } = useCrud('/api/employees/')
const toast = useToast()

const companyId = computed(() => (route.params.companyId ? Number(route.params.companyId) : null))
const fromCompany = computed(() => !!companyId.value)

const isEdit = computed(() => !!route.params.id)

const cancelRoute = computed(() =>
  fromCompany.value ? `/companies/${companyId.value}/employees` : '/employees',
)

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  national_id: '',
  phone: '',
  email: '',
  address: '',
  position: '',
  hire_date: '',
  salary: '',
  company: companyId.value ?? '',
  is_active: true,
})
const form = ref(emptyForm())

const companies = ref([])
onMounted(async () => {
  if (!fromCompany.value) {
    const res = await fetch('/api/companies/')
    companies.value = await res.json()
  }
})

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

function syncCpf() {
  const input = document.getElementById('cpfInput')
  if (input) form.value.national_id = input.value
}

function syncPhone() {
  const input = document.getElementById('phoneInput')
  if (input) form.value.phone = input.value
}

async function submit() {
  syncCpf()
  syncPhone()

  const cpfInput = document.getElementById('cpfInput')
  if (cpfInput && cpfInput.classList.contains('is-invalid')) return

  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    toast.add(
      isEdit.value ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.',
    )
    router.push(cancelRoute.value)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-person-badge' : 'bi-person-add'"
        :title="isEdit ? 'Editar Funcionário' : 'Cadastro de Funcionário'"
      >
        <div class="p-4">
          <form @submit.prevent="submit" novalidate>
            <h6 class="text-uppercase text-muted mb-3 small fw-semibold">Dados pessoais</h6>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nome</label>
                <input v-model="form.first_name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Sobrenome</label>
                <input v-model="form.last_name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">CPF</label>
                <input
                  id="cpfInput"
                  v-model="form.national_id"
                  v-mask-cpf
                  @mask-change="syncCpf"
                  type="text"
                  placeholder="000.000.000-00"
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
                <input v-model="form.email" type="email" class="form-control" />
              </div>
              <div class="col-12">
                <label class="form-label">Endereço</label>
                <input v-model="form.address" type="text" class="form-control" />
              </div>
            </div>

            <h6 class="text-uppercase text-muted mb-3 mt-4 small fw-semibold">
              Dados profissionais
            </h6>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Cargo</label>
                <select v-model="form.position" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="engineer">Engenheiro(a)</option>
                  <option value="architect">Arquiteto(a)</option>
                  <option value="foreman">Mestre de Obras</option>
                  <option value="inspector">Fiscal</option>
                  <option value="worker">Operário(a)</option>
                  <option value="manager">Gerente</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Data de Contratação</label>
                <input v-model="form.hire_date" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Salário (R$)</label>
                <input v-model="form.salary" type="number" step="0.01" class="form-control" />
              </div>

              <div v-if="!fromCompany" class="col-md-6">
                <label class="form-label">Empresa</label>
                <select v-model="form.company" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option v-for="c in companies" :key="c.id" :value="c.id">
                    {{ c.corporate_name }}
                  </option>
                </select>
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
                  <label class="form-check-label" for="isActive">Funcionário ativo</label>
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
              <RouterLink :to="cancelRoute" class="btn btn-outline-secondary">Cancelar</RouterLink>
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
