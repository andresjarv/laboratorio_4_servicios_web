import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,15,20,.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)', height: '60px',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px'
    }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
        Reserva<span style={{ color: 'var(--accent)' }}>Hub</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flex: 1, marginLeft: '24px' }}>
        <NavLink to="/espacios" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Espacios
        </NavLink>
        <NavLink to="/reservas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Reservas
        </NavLink>
        {isAdmin && (
          <NavLink to="/usuarios" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Usuarios
          </NavLink>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{user?.nombre}</span>
        <span style={{
          fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
          background: 'rgba(108,143,255,.15)', color: 'var(--accent)'
        }}>
          {isAdmin ? 'Admin' : 'Usuario'}
        </span>
        <button className="btn-secondary btn-sm" onClick={handleLogout}>Salir</button>
      </div>

      <style>{`
        .nav-link {
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          color: var(--text2);
          font-size: 13px;
          text-decoration: none;
          transition: all .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: var(--text); background: var(--bg3); }
        .nav-link.active { color: var(--accent); background: rgba(108,143,255,.1); }
      `}</style>
    </nav>
  )
}
