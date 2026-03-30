import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authStore'
import { Button } from '../components/ui/Button'

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()
  const location = useLocation()

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  const onLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <div className="app-shell-left">
          <Link to="/" className="app-shell-brand">
            PC<span style={{ color: 'var(--accent-strong)' }}>Forge</span>
          </Link>
        </div>

        <nav className="app-shell-nav app-shell-nav-center" aria-label="Primary">
          <Link to="/categories">Categories</Link>
          <Link to="/pre-built">Pre-Built PCs</Link>
          <Link to="/bundles">Bundles</Link>
          <Link to="/accessories">Accessories</Link>
          {token && <Link to="/dashboard">Dashboard</Link>}
        </nav>

        <div className="app-shell-right">
          {token && (
            <>
              <span className="app-shell-user">
                {user?.email}
              </span>
              <Button type="button" variant="ghost" onClick={onLogout}>
                Log out
              </Button>
            </>
          )}
          {!token && (
            <>
              {!isAuthRoute && (
                <>
                  <Link to="/login" className="app-shell-link-muted">Log in</Link>
                  <Link
                    to="/register"
                    className="app-shell-cta"
                  >
                    Get started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </header>

      <main className="app-shell-main">
        {children}
      </main>
    </div>
  )
}

