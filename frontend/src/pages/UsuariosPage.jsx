import { useFetch } from '../hooks/useFetch'
import { getUsuarios } from '../api/usuarios'
import { BadgeRol } from '../components/Badge'

export default function UsuariosPage() {
  const { data: usuarios, loading, error } = useFetch(getUsuarios)

  return (
    <>
      <div className="page-header">
        <h2>Gestión de usuarios</h2>
        <p>Listado de todos los usuarios registrados en el sistema</p>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="spinner" />
                  </td></tr>
                )}

                {error && (
                  <tr><td colSpan="4" style={{ color: 'var(--danger)', textAlign: 'center', padding: '24px' }}>
                    {error}
                  </td></tr>
                )}

                {!loading && !error && usuarios?.length === 0 && (
                  <tr><td colSpan="4">
                    <div className="empty-state">
                      <span className="empty-icon">👥</span>
                      <p>No hay usuarios registrados</p>
                    </div>
                  </td></tr>
                )}

                {!loading && usuarios?.map(u => (
                  <tr key={u.id_usuario}>
                    <td>#{u.id_usuario}</td>
                    <td>{u.nombre}</td>
                    <td style={{ color: 'var(--text2)' }}>{u.correo}</td>
                    <td><BadgeRol rol={u.rol} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
