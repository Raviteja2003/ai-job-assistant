import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AuthResponse {
  access_token: string
  token_type: string
  user_id: number
  name: string
  email: string
}

export const registerAPI = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await API.post('/auth/register', { name, email, password })
  return res.data
}

export const loginAPI = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await API.post('/auth/login', { email, password })
  return res.data
}

export default API