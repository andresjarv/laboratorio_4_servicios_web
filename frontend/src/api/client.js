// En Docker, Nginx hace de proxy: /api/* → http://backend:8000/*
// En desarrollo local, cambia a: http://localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' }
  if (requiresAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${path}`, options)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(error.detail || `Error ${response.status}`)
  }
  return response.json()
}

async function requestForm(path, formData) {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(error.detail || `Error ${response.status}`)
  }
  return response.json()
}

export const http = {
  get:    (path, auth = true)       => request('GET',    path, null, auth),
  post:   (path, body, auth = true) => request('POST',   path, body, auth),
  put:    (path, body, auth = true) => request('PUT',    path, body, auth),
  delete: (path, auth = true)       => request('DELETE', path, null, auth),
  form:   (path, formData)          => requestForm(path, formData),
}
