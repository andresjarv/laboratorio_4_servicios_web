import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, decodeToken } from '../api/auth'
import { getUsuarios } from '../api/usuarios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [user,  setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // Hidrata el usuario desde la API usando el token guardado
  useEffect(() => {
    if (token && !user) hydrateUser(token)
  }, [])

  async function hydrateUser(tkn) {
    try {
      const payload = decodeToken(tkn)
      if (!payload) return logout()
      const users = await getUsuarios()
      const found = users.find(u => u.correo === payload.sub)
      if (found) {
        setUser(found)
        localStorage.setItem('currentUser', JSON.stringify(found))
      }
    } catch {
      logout()
    }
  }

  async function login(correo, password) {
    setLoading(true)
    try {
      const data = await apiLogin(correo, password)
      const tkn  = data.access_token
      setToken(tkn)
      localStorage.setItem('token', tkn)
      await hydrateUser(tkn)
    } finally {
      setLoading(false)
    }
  }

  async function register(nombre, correo, password) {
    return apiRegister(nombre, correo, password)
  }

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }, [])

  const isAdmin = user?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ token, user, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
