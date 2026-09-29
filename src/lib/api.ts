import { http } from './http'
import type { TokenResponse, User } from './types'

export { ApiError } from './http'

export async function loginRequest(email: string, password: string) {
  const { data } = await http.post<TokenResponse>('/api/v1/auth/login', {
    email,
    password,
  })
  return data
}

export async function registerRequest(body: {
  email: string
  name?: string
  password: string
  role: 'CUSTOMER' | 'DEALERSHIP_STAFF'
}) {
  const { data } = await http.post<User>('/api/v1/auth/register', body)
  return data
}

export async function fetchMe() {
  const { data } = await http.get<User>('/api/v1/me')
  return data
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  const { data } = await http.get<T>(path, { params })
  return data
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  idempotencyKey?: string,
) {
  const { data } = await http.post<T>(path, body, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  })
  return data
}

export async function apiPut<T>(path: string, body?: unknown) {
  const { data } = await http.put<T>(path, body)
  return data
}

export async function apiPatch<T>(path: string, body?: unknown) {
  const { data } = await http.patch<T>(path, body)
  return data
}

export async function apiDelete(path: string) {
  await http.delete(path)
}
