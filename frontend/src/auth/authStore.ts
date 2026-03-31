import { createContext, useCallback, useContext, useEffect, useMemo, useState, createElement } from 'react'
import type { ReactNode } from 'react'

const TOKEN_KEY = 'pc_website_access_token'

export type AuthUser = {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  loginSuccess: (accessToken: string) => void
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/jwt/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = new Error(`Failed to load current user: ${res.status}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return (await res.json()) as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }
    try {
      setLoading(true)
      const u = await fetchMe(token)
      setUser(u)
    } finally {
      setLoading(false)
    }
  }, [token])

  const loginSuccess = useCallback((accessToken: string) => {
    setAccessToken(accessToken)
    setToken(accessToken)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    refreshMe().catch((err: unknown) => {
      // If `/me` is temporarily unavailable, don't immediately wipe the token.
      // Only force-logout for auth-related failures.
      const status = (err as { status?: number })?.status
      if (status === 401 || status === 403) {
        logout()
        return
      }
      setUser(null)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!token) return
    refreshMe().catch(() => logout())
  }, [token, refreshMe, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      loginSuccess,
      logout,
      refreshMe,
    }),
    [token, user, loading, loginSuccess, logout, refreshMe],
  )

  // Using `createElement` keeps this file as `.ts` (no JSX required).
  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

