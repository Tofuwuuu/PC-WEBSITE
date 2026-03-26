import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product } from '../types'
import { Link } from 'react-router-dom'

export function CatalogPublicPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .get<Product[]>('/products')
      .then((r) => {
        if (!cancelled) setProducts(r.data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.detail ?? e.message ?? 'Failed to load')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1>PC Components Catalog</h1>
      <p>
        Browse parts and components. For admin actions,{' '}
        <Link to="/login">log in</Link>.
      </p>

      {error && <p style={{ color: 'var(--accent)' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{p.name}</h3>
            {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
            {p.url ? (
              <a href={p.url} target="_blank" rel="noreferrer">
                Link
              </a>
            ) : (
              <div style={{ opacity: 0.7 }}>No link</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

