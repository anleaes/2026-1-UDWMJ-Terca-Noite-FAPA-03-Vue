function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function isValidCPF(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10])
}

function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

function isValidCNPJ(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false

  const calc = (d, len) => {
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(d[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }

  return (
    calc(digits, 12) === parseInt(digits[12]) &&
    calc(digits, 13) === parseInt(digits[13])
  )
}

function maskPhoneValue(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function validateField(input, maskFn, validatorFn) {
  const cursor = input.selectionStart
  const prevLen = input.value.length
  input.value = maskFn(input.value)
  const diff = input.value.length - prevLen
  input.setSelectionRange(cursor + diff, cursor + diff)

  if (validatorFn) {
    const digits = input.value.replace(/\D/g, '')
    if (digits.length === 0) {
      input.classList.remove('is-valid', 'is-invalid')
    } else if (validatorFn(input.value)) {
      input.classList.remove('is-invalid')
      input.classList.add('is-valid')
    } else {
      input.classList.remove('is-valid')
      input.classList.add('is-invalid')
    }
  }
}

function setupMaskField(el, maskFn, validatorFn, maxlength) {
  el.setAttribute('maxlength', maxlength)
  el.setAttribute('inputmode', 'numeric')

  if (el.value) {
    el.value = maskFn(el.value)
  }

  el._maskInputHandler = function () {
    validateField(this, maskFn, validatorFn)
    this.dispatchEvent(new Event('mask-change'))
  }

  el._maskBlurHandler = function () {
    if (validatorFn) {
      const digits = this.value.replace(/\D/g, '')
      if (digits.length === 0) {
        this.classList.remove('is-valid', 'is-invalid')
      } else if (validatorFn(this.value)) {
        this.classList.remove('is-invalid')
        this.classList.add('is-valid')
      } else {
        this.classList.remove('is-valid')
        this.classList.add('is-invalid')
      }
    }
  }

  el.addEventListener('input', el._maskInputHandler)
  el.addEventListener('blur', el._maskBlurHandler)
}

function removeMaskField(el) {
  if (el._maskInputHandler) el.removeEventListener('input', el._maskInputHandler)
  if (el._maskBlurHandler) el.removeEventListener('blur', el._maskBlurHandler)
}

export const vMaskCpf = {
  mounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    setupMaskField(input, maskCPF, isValidCPF, 14)
  },
  updated(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (input.value) {
      input.value = maskCPF(input.value)
    }
  },
  unmounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    removeMaskField(input)
  },
}

export const vMaskCnpj = {
  mounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    setupMaskField(input, maskCNPJ, isValidCNPJ, 18)
  },
  updated(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (input.value) {
      input.value = maskCNPJ(input.value)
    }
  },
  unmounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    removeMaskField(input)
  },
}

export const vMaskPhone = {
  mounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    setupMaskField(input, maskPhoneValue, null, 15)
  },
  updated(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (input.value) {
      input.value = maskPhoneValue(input.value)
    }
  },
  unmounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    removeMaskField(input)
  },
}

export function useMask() {
  return {
    maskCPF,
    isValidCPF,
    maskCNPJ,
    isValidCNPJ,
    maskPhone: maskPhoneValue,
  }
}
