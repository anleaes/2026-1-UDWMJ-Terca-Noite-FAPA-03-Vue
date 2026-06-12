export const positionMap = {
  engineer: { label: 'Engenheiro(a)', color: '#60a5fa', icon: 'engineering' },
  architect: { label: 'Arquiteto(a)', color: '#818cf8', icon: 'architecture' },
  foreman: { label: 'Mestre de Obras', color: '#fbbf24', icon: 'construction' },
  inspector: { label: 'Fiscal', color: '#94a3b8', icon: 'fact_check' },
  worker: { label: 'Operário(a)', color: '#2dd4bf', icon: 'handyman' },
  manager: { label: 'Gerente', color: '#34d399', icon: 'manage_accounts' },
}

export function positionOf(value) {
  return positionMap[value] ?? { label: value || '—', color: '#94a3b8', icon: 'badge' }
}

export const positionOptions = Object.entries(positionMap).map(([value, { label }]) => ({
  label,
  value,
}))
