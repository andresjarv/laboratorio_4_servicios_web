import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { getEspaciosDisponibles, crearEspacio } from '../api/espacios'
import { BadgeEspacio } from '../components/Badge'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

function EspacioCard({ espacio }) {
  return (
    <div className="space-card">
      <div className="space-card-header">
        <h3>{espacio.nombre}</h3>
        <BadgeEspacio estado={espacio.estado} />
      </div>
      <div className="space-card-meta">
        <div className="space-card-meta-item">📍 {espacio.ubicacion}</div>
        <div className="space-card-meta-item">
          👥 Capacidad: <strong style={{ color: 'var(--text)', marginLeft: '4px' }}>{espacio.capacidad}</strong> personas
        </div>
        <div className="space-card-meta-item" style={{ color: 'var(--text3)', fontSize: '12px' }}>
          ID #{espacio.id_espacio}
        </div>
      </div>
    </div>
  )
}

function ModalCrearEspacio({ onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ nombre: '', ubicacion: '', capacidad: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.nombre || !form.ubicacion || !form.capacidad) {
      setError('Completa todos los campos'); return
    }
    setLoading(true)
    try {
      await crearEspacio({ ...form, capacidad: parseInt(form.capacidad) })
      toast.success('Espacio registrado exitosamente')
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Registrar espacio" onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" placeholder="Sala de reuniones A" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ubicación</label>
          <input type="text" placeholder="Edificio 1, Piso 2" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Capacidad máxima</label>
          <input type="number" min="1" placeholder="20" value={form.capacidad} onChange={e => set('capacidad', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function EspaciosPage() {
  const { isAdmin } = useAuth()
  const { data: espacios, loading, error, reload } = useFetch(getEspaciosDisponibles)
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Espacios disponibles</h2>
            <p>Consulta los espacios activos y sus características</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Nuevo espacio
            </button>
          )}
        </div>
      </div>

      <div className="page-content">
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && espacios?.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🏢</span>
            <p>No hay espacios disponibles actualmente</p>
          </div>
        )}

        {!loading && espacios?.length > 0 && (
          <div className="spaces-grid">
            {espacios.map(e => <EspacioCard key={e.id_espacio} espacio={e} />)}
          </div>
        )}
      </div>

      {showModal && (
        <ModalCrearEspacio
          onClose={() => setShowModal(false)}
          onCreated={reload}
        />
      )}
    </>
  )
}
