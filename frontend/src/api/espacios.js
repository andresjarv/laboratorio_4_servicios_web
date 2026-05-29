import { http } from './client'

export const getEspaciosDisponibles = ()     => http.get('/espacios/disponibles', false)
export const crearEspacio           = (data) => http.post('/espacios/', data)
