import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/authStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!token) return <Navigate to="/login" replace />

  return <>{children}</>
}

