const ESPACIO_MAP = {
  activo:       { cls: 'badge-active',      label: 'Activo' },
  inactivo:     { cls: 'badge-inactive',    label: 'Inactivo' },
  mantenimiento:{ cls: 'badge-maintenance', label: 'Mantenimiento' },
}

const RESERVA_MAP = {
  esperando: { cls: 'badge-waiting',  label: 'Esperando' },
  aprobada:  { cls: 'badge-approved', label: 'Aprobada' },
  rechazada: { cls: 'badge-rejected', label: 'Rechazada' },
}

const ROL_MAP = {
  admin:   { cls: 'badge-admin', label: 'Admin' },
  usuario: { cls: 'badge-user',  label: 'Usuario' },
}

export function BadgeEspacio({ estado }) {
  const { cls, label } = ESPACIO_MAP[estado] || { cls: 'badge-inactive', label: estado }
  return <span className={`badge ${cls}`}>{label}</span>
}

export function BadgeReserva({ estado }) {
  const { cls, label } = RESERVA_MAP[estado] || { cls: '', label: estado }
  return <span className={`badge ${cls}`}>{label}</span>
}

export function BadgeRol({ rol }) {
  const { cls, label } = ROL_MAP[rol] || { cls: 'badge-inactive', label: rol }
  return <span className={`badge ${cls}`}>{label}</span>
}
