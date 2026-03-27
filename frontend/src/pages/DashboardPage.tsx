import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/authStore'
import type { Product } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    setError(null)
    try {
      const res = await api.get<Product[]>('/products')
      setProducts(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    setError(null)
    try {
      await api.delete(`/products/${id}`)
      await loadProducts()
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? 'Delete failed')
    }
  }

  const onLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="ui-stack">
      <h1>Dashboard</h1>
      <Card variant="feature">
        <div className="dash-summary">
          <div>
            <p className="hero-kicker" style={{ marginBottom: 8 }}>Control Center</p>
            <p className="page-lead" style={{ margin: 0 }}>
              Signed in as <strong>{user?.email ?? 'unknown'}</strong>
            </p>
            <div className="dash-stats" style={{ marginTop: 14 }}>
              <span className="dash-stat-chip">Items: {products.length}</span>
              <span className="dash-stat-chip">Status: Active</span>
              <span className="dash-stat-chip">Theme: Premium Dark</span>
            </div>
          </div>
          <div className="ui-inline">
            <Button onClick={onLogout} variant="ghost" type="button">
              Log out
            </Button>
            <Link to="/dashboard/products/new">
              <Button variant="neon" type="button">
                Add new
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {error && <p className="ui-alert">Error: {error}</p>}
      {loading ? (
        <Card variant="glass">
          <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
        </Card>
      ) : (
        <>
          {products.length === 0 && (
            <Card variant="glass">
              <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first one.</p>
            </Card>
          )}
          <div className="ui-grid">
            {products.map((p) => (
              <Card key={p.id} variant="compact">
                <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>{p.name}</h3>
                {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
                <div className="ui-inline">
                  <Link to={`/dashboard/products/${p.id}`}>
                    <Button variant="outline-accent" type="button">
                      Edit
                    </Button>
                  </Link>
                  <Button onClick={() => onDelete(p.id)} variant="danger" type="button">
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
