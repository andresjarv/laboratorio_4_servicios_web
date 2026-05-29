import { http } from './client'

export const getReservas      = ()           => http.get('/reservas/')
export const crearReserva     = (data)       => http.post('/reservas/', data)
export const actualizarEstado = (id, estado) => http.put(`/reservas/${id}/estado`, { estado })
