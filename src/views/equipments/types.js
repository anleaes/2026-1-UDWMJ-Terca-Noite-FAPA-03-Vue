export const typeMap = {
  excavator:      { label: 'Escavadeira', color: '#fbbf24', icon: 'construction' },
  crane:          { label: 'Guindaste',   color: '#38bdf8', icon: 'precision_manufacturing' },
  truck:          { label: 'Caminhão',    color: '#94a3b8', icon: 'local_shipping' },
  bulldozer:      { label: 'Bulldozer',   color: '#fb923c', icon: 'agriculture' },
  concrete_mixer: { label: 'Betoneira',   color: '#a78bfa', icon: 'rotate_right' },
  compactor:      { label: 'Compactador', color: '#2dd4bf', icon: 'compress' },
  other:          { label: 'Outro',       color: '#64748b', icon: 'build' },
}

export function typeOf(value) {
  return typeMap[value] ?? { label: value || '—', color: '#64748b', icon: 'build' }
}

export const typeOptions = Object.entries(typeMap).map(([value, { label }]) => ({
  label,
  value,
}))
