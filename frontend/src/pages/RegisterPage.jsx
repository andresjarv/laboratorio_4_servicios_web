import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!nombre || !correo || !password) { setError('Completa todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      await register(nombre, correo, password)
      setSuccess('Cuenta creada exitosamente. Redirigiendo...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '24px',
      background: 'radial-gradient(ellipse at 70% 20%, rgba(167,139,250,.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(108,143,255,.05) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
            Reserva<span style={{ color: 'var(--accent)' }}>Hub</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '6px' }}>
            Crea tu cuenta para reservar espacios
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Crear cuenta</h2>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                placeholder="Juan García"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
