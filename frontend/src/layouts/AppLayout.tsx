import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AppLayout({ children }: { children: ReactNode }) {
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
          <Link to="/items">Items</Link>
        </nav>

        <div className="app-shell-right">
          <span className="app-shell-link-muted" style={{ paddingRight: 6 }}>
            Open source build
          </span>
        </div>
      </header>

      <main className="app-shell-main">
        {children}
      </main>
    </div>
  )
}

