import { http } from './client'

export const getUsuarios = () => http.get('/usuarios/')
