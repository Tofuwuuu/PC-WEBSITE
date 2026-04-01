import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ITEMS, type Item } from '../data/items'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { imageForItem } from '../utils/itemImages'

type Props = {
  categoryKey: string
  title: string
  description?: string
}

export function CategoryProductsPage({ categoryKey, title, description }: Props) {
  const [products, setProducts] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    try {
      const filtered = ITEMS.filter((p) => p.category === (categoryKey as any))
      if (!cancelled) setProducts(filtered)
    } catch (e: any) {
      if (!cancelled) setError(e?.message ?? 'Failed to load')
    } finally {
      if (!cancelled) setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [categoryKey])

  return (
    <div className="ui-stack">
      <div>
        <h1>{title}</h1>
        <p className="page-lead">
          {description ?? 'Browse items in this category.'}{' '}
          <Link to="/categories">Back to categories</Link>
        </p>
      </div>

      {error && <p className="ui-alert">Error: {error}</p>}

      {loading ? (
        <Card variant="glass">
          <p style={{ color: 'var(--text-muted)' }}>Loading items...</p>
        </Card>
      ) : (
        <>
          {products.length === 0 ? (
            <Card variant="glass">
              <p style={{ color: 'var(--text-muted)' }}>No items found for this category yet.</p>
            </Card>
          ) : (
            <div className="ui-grid">
              {products.map((p) => (
                <Card key={p.id} variant="compact">
                  <img
                    src={imageForItem(p)}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 12,
                      marginBottom: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>{p.name}</h3>
                  {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                      <Button variant="secondary" type="button">
                        View details
                      </Button>
                    </a>
                  ) : (
                    <div style={{ opacity: 0.7, color: 'var(--text-soft)' }}>No link available</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

