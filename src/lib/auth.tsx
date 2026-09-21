import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, loginRequest, registerRequest } from './api'
import { clearSession } from './http'
import { getToken, setToken } from './tokens'
import type { Role, User } from './types'

type AuthState = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: {
    email: string
    name?: string
    password: string
    role: Role
  }) => Promise<User>
  reloadUser: () => Promise<User | null>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const clearCachedApiData = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  const hydrate = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return null
    }
    const me = await fetchMe()
    setUser(me)
    return me
  }, [])

  useEffect(() => {
    hydrate()
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [hydrate])

  const login = useCallback(
    async (email: string, password: string) => {
      const tok = await loginRequest(email, password)
      clearCachedApiData()
      setToken(tok.access_token)
      const me = await fetchMe()
      setUser(me)
      return me
    },
    [clearCachedApiData],
  )

  const register = useCallback(
    async (input: {
      email: string
      name?: string
      password: string
      role: Role
    }) => {
      await registerRequest(input)
      return login(input.email, input.password)
    },
    [login],
  )

  const reloadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return null
    }
    const me = await fetchMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    clearCachedApiData()
  }, [clearCachedApiData])

  const value = useMemo(
    () => ({ user, loading, login, register, reloadUser, logout }),
    [user, loading, login, register, reloadUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
