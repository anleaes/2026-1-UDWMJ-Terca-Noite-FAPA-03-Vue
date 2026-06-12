export const statusMap = {
  planned:     { label: 'Planejada',    color: '#94a3b8', icon: 'schedule' },
  in_progress: { label: 'Em Andamento', color: '#38bdf8', icon: 'construction' },
  paused:      { label: 'Pausada',      color: '#fbbf24', icon: 'pause_circle' },
  completed:   { label: 'Concluída',    color: '#34d399', icon: 'check_circle' },
  cancelled:   { label: 'Cancelada',    color: '#fb7185', icon: 'cancel' },
}

export function statusOf(value) {
  return statusMap[value] ?? { label: value || '—', color: '#94a3b8', icon: 'help' }
}

export const statusOptions = Object.entries(statusMap).map(([value, { label }]) => ({ label, value }))

export const typeMap = {
  road:       { label: 'Rodovia',     color: '#fbbf24', icon: 'add_road' },
  bridge:     { label: 'Ponte',       color: '#38bdf8', icon: 'toll' },
  building:   { label: 'Edifício',    color: '#818cf8', icon: 'apartment' },
  sanitation: { label: 'Saneamento',  color: '#34d399', icon: 'water' },
  urban:      { label: 'Urbanização', color: '#60a5fa', icon: 'location_city' },
  other:      { label: 'Outro',       color: '#94a3b8', icon: 'category' },
}

export function typeOf(value) {
  return typeMap[value] ?? { label: value || '—', color: '#94a3b8', icon: 'category' }
}

export const typeOptions = Object.entries(typeMap).map(([value, { label }]) => ({ label, value }))

export const statusFoundMap = {
  regular:   { label: 'Regular',              color: '#34d399', icon: 'check_circle' },
  irregular: { label: 'Irregular',            color: '#fb7185', icon: 'cancel' },
  partial:   { label: 'Parcialmente Regular', color: '#fbbf24', icon: 'warning' },
  critical:  { label: 'Crítico',              color: '#f97316', icon: 'report' },
}

export function statusFoundOf(value) {
  return statusFoundMap[value] ?? { label: value || '—', color: '#94a3b8', icon: 'help' }
}
