import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/authStore'
import { Card } from './ui/Card'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <Card>
        <p style={{ color: 'var(--text-muted)' }}>Checking session...</p>
      </Card>
    )
  }
  if (!token) return <Navigate to="/login" replace />

  return <>{children}</>
}

