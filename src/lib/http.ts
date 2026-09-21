import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from './types'
import { getToken, setToken } from './tokens'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const baseURL = import.meta.env.VITE_API_BASE ?? ''

export const http = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data as ApiEnvelope<unknown> | unknown
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as ApiEnvelope<unknown>).success === true &&
      'data' in body
    ) {
      res.data = (body as ApiEnvelope<unknown>).data
    }
    return res
  },
  (err: AxiosError<ApiEnvelope<null>>) => {
    const status = err.response?.status ?? 0
    const payload = err.response?.data
    const message =
      payload?.message ??
      (typeof payload?.error === 'string' ? payload.error : undefined) ??
      err.message ??
      'Request failed'
    const code =
      payload?.error != null ? String(payload.error) : undefined
    return Promise.reject(new ApiError(message, status, code))
  },
)

export function clearSession() {
  setToken(null)
}
