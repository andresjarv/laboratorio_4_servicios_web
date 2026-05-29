import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { getReservas, crearReserva, actualizarEstado } from '../api/reservas'
import { getEspaciosDisponibles } from '../api/espacios'
import { BadgeReserva } from '../components/Badge'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

// Fecha mínima = pasado mañana (regla de 24h de anticipación del backend)
function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().split('T')[0]
}

function ModalCrearReserva({ onClose, onCreated }) {
  const toast = useToast()
  const { data: espacios } = useFetch(getEspaciosDisponibles)
  const [form, setForm] = useState({
    id_espacio: '', fecha: '', hora_inicio: '', hora_fin: '', cantidad_asistentes: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { id_espacio, fecha, hora_inicio, hora_fin, cantidad_asistentes } = form
    if (!id_espacio || !fecha || !hora_inicio || !hora_fin || !cantidad_asistentes) {
      setError('Completa todos los campos'); return
    }
    setLoading(true)
    try {
      await crearReserva({
        id_espacio: parseInt(id_espacio),
        fecha,
        hora_inicio,
        hora_fin,
        cantidad_asistentes: parseInt(cantidad_asistentes),
      })
      toast.success('Reserva solicitada. En espera de aprobación.')
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Solicitar reserva" onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Espacio</label>
          <select value={form.id_espacio} onChange={e => set('id_espacio', e.target.value)}>
            <option value="">Selecciona un espacio...</option>
            {(espacios || []).map(esp => (
              <option key={esp.id_espacio} value={esp.id_espacio}>
                {esp.nombre} (cap. {esp.capacidad})
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" min={getMinDate()} value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Asistentes</label>
            <input type="number" min="1" placeholder="Ej: 10" value={form.cantidad_asistentes} onChange={e => set('cantidad_asistentes', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Hora inicio</label>
            <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hora fin</label>
            <input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Solicitar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ReservasPage() {
  const { isAdmin } = useAuth()
  const toast = useToast()
  const { data: reservas, loading, error, reload } = useFetch(getReservas)
  const [showModal, setShowModal] = useState(false)

  async function handleCambiarEstado(id, estado) {
    try {
      await actualizarEstado(id, estado)
      toast.success(estado === 'aprobada' ? 'Reserva aprobada' : 'Reserva rechazada')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{isAdmin ? 'Todas las reservas' : 'Mis reservas'}</h2>
            <p>{isAdmin
              ? 'Gestiona y aprueba solicitudes de todos los usuarios'
              : 'Historial y estado de tus solicitudes'}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nueva reserva
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Asistentes</th>
                  <th>Estado</th>
                  {isAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="spinner" />
                  </td></tr>
                )}

                {error && (
                  <tr><td colSpan={isAdmin ? 7 : 6} style={{ color: 'var(--danger)', textAlign: 'center', padding: '24px' }}>
                    {error}
                  </td></tr>
                )}

                {!loading && !error && reservas?.length === 0 && (
                  <tr><td colSpan={isAdmin ? 7 : 6}>
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <p>No hay reservas aún</p>
                    </div>
                  </td></tr>
                )}

                {!loading && reservas?.map(r => (
                  <tr key={r.id_reserva}>
                    <td>#{r.id_reserva}</td>
                    <td>Espacio #{r.id_espacio}</td>
                    <td>{r.fecha}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.hora_inicio} – {r.hora_fin}</td>
                    <td>{r.cantidad_asistentes}</td>
                    <td><BadgeReserva estado={r.estado} /></td>
                    {isAdmin && (
                      <td>
                        {r.estado === 'esperando' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-success btn-sm" onClick={() => handleCambiarEstado(r.id_reserva, 'aprobada')}>✓ Aprobar</button>
                            <button className="btn-danger btn-sm"  onClick={() => handleCambiarEstado(r.id_reserva, 'rechazada')}>✕ Rechazar</button>
                          </div>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <ModalCrearReserva
          onClose={() => setShowModal(false)}
          onCreated={reload}
        />
      )}
    </>
  )
}
