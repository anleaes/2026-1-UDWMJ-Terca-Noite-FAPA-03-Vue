function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function maskCpf(value) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function validateCpf(value) {
  const d = onlyDigits(value)
  if (d.length !== 11) return 'CPF deve ter 11 dígitos.'
  if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.'

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return 'CPF inválido.'

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[10])) return 'CPF inválido.'

  return null
}

export function maskCnpj(value) {
  const d = onlyDigits(value).slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function validateCnpj(value) {
  const d = onlyDigits(value)
  if (d.length !== 14) return 'CNPJ deve ter 14 dígitos.'
  if (/^(\d)\1{13}$/.test(d)) return 'CNPJ inválido.'

  const calc = (d, n) => {
    let sum = 0
    let pos = n - 7
    for (let i = n; i >= 1; i--) {
      sum += parseInt(d[n - i]) * pos--
      if (pos < 2) pos = 9
    }
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }

  if (calc(d, 12) !== parseInt(d[12])) return 'CNPJ inválido.'
  if (calc(d, 13) !== parseInt(d[13])) return 'CNPJ inválido.'

  return null
}

export function maskPhone(value) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function validatePhone(value) {
  const d = onlyDigits(value)
  if (d.length < 10 || d.length > 11) return 'Telefone inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX.'
  return null
}

export function useMask() {
  return {
    maskCpf,
    validateCpf,
    maskCnpj,
    validateCnpj,
    maskPhone,
    validatePhone,
  }
}
