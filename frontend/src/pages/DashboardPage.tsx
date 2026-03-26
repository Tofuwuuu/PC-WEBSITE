import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/authStore'
import type { Product } from '../types'

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
    <div>
      <h1>Dashboard</h1>
      <div style={{ marginBottom: 16, opacity: 0.9 }}>
        Signed in as <strong>{user?.email ?? 'unknown'}</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={onLogout} type="button" style={{ marginRight: 12 }}>
            Log out
          </button>
          <Link to="/dashboard/products/new">Add new</Link>
        </div>
      </div>

      {error && <p style={{ color: 'var(--accent)' }}>Error: {error}</p>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>{p.name}</h3>
              {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/dashboard/products/${p.id}`}>Edit</Link>
                <button onClick={() => onDelete(p.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

