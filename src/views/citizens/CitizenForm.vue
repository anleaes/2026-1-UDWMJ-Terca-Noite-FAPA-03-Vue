<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCrud } from '../../composables/useCrud'
import { useToast } from '../../composables/useToast'
import AppCard from '../../components/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, fetchOne, save } = useCrud('/api/citizens/')
const toast = useToast()

const isEdit = computed(() => !!route.params.id)

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  national_id: '',
  phone: '',
  email: '',
  address: '',
  registration_number: '',
  neighborhood_association: '',
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

async function submit() {
  const data = await save(form.value, isEdit.value ? route.params.id : null)
  if (data) {
    toast.add(isEdit.value ? 'Cidadão atualizado com sucesso.' : 'Cidadão cadastrado com sucesso.')
    router.push('/citizens')
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <AppCard
        :icon="isEdit ? 'bi-person-vcard' : 'bi-person-add'"
        :title="isEdit ? 'Editar Cidadão' : 'Cadastro de Cidadão'"
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
                <input v-model="form.national_id" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Telefone</label>
                <input v-model="form.phone" type="text" class="form-control" />
              </div>
              <div class="col-12">
                <label class="form-label">E-mail</label>
                <input v-model="form.email" type="email" class="form-control" />
              </div>
              <div class="col-12">
                <label class="form-label">Endereço</label>
                <input v-model="form.address" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Nº de Cadastro</label>
                <input v-model="form.registration_number" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Associação de Bairro</label>
                <input v-model="form.neighborhood_association" type="text" class="form-control" />
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
              <RouterLink to="/citizens" class="btn btn-outline-secondary">Cancelar</RouterLink>
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
