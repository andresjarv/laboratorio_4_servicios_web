import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EspaciosPage from './pages/EspaciosPage'
import ReservasPage from './pages/ReservasPage'
import UsuariosPage from './pages/UsuariosPage'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'admin') return <Navigate to="/espacios" replace />
  return children
}

function PublicRoute({ children }) {
  const { token } = useAuth()
  return token ? <Navigate to="/espacios" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/espacios" replace />} />
          <Route path="espacios" element={<EspaciosPage />} />
          <Route path="reservas" element={<ReservasPage />} />
          <Route path="usuarios" element={<AdminRoute><UsuariosPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/espacios" replace />} />
      </Routes>
    </AuthProvider>
  )
}
