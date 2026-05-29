import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [correo,   setCorrco]   = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!correo || !password) { setError('Completa todos los campos'); return }
    setLoading(true)
    try {
      await login(correo, password)
      navigate('/espacios')
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
      background: 'radial-gradient(ellipse at 30% 20%, rgba(108,143,255,.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(167,139,250,.05) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
            Reserva<span style={{ color: 'var(--accent)' }}>Hub</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '6px' }}>
            Sistema de gestión de espacios institucionales
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Iniciar sesión</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={e => setCorrco(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
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
              {loading ? <span className="spinner" /> : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--accent)' }}>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
