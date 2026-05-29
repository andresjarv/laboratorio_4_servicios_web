import { http } from './client'

export async function login(correo, password) {
  const fd = new FormData()
  fd.append('username', correo)
  fd.append('password', password)
  return http.form('/login', fd)
}

export async function register(nombre, correo, password) {
  return http.post('/usuarios/', { nombre, correo, password }, false)
}

// Decodifica el payload del JWT sin verificar firma (solo para leer datos en cliente)
export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
