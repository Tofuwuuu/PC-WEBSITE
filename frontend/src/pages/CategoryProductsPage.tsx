import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Product } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

type Props = {
  categoryKey: string
  title: string
  description?: string
}

type ImageLookupResponse = {
  found?: boolean
  image_url: string | null
  source_title?: string | null
  source_page_url?: string | null
  license_short_name?: string | null
  license_url?: string | null
  artist?: string | null
}

function fallbackSearchForCategory(categoryKey: string): string {
  if (categoryKey === 'pre_built') return 'gaming desktop pc'
  if (categoryKey === 'bundles') return 'computer hardware components'
  if (categoryKey === 'accessories') return 'computer monitor keyboard mouse'
  return 'pc hardware'
}

export function CategoryProductsPage({ categoryKey, title, description }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageByProductId, setImageByProductId] = useState<Record<string, ImageLookupResponse>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get<Product[]>(`/products?category=${encodeURIComponent(categoryKey)}`)
      .then((r) => {
        if (!cancelled) setProducts(r.data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.detail ?? e.message ?? 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryKey])

  useEffect(() => {
    let cancelled = false

    const loadImages = async () => {
      if (products.length === 0) {
        setImageByProductId({})
        return
      }

      const map: Record<string, ImageLookupResponse> = {}
      for (const p of products) {
        try {
          const res = await api.get<ImageLookupResponse>(`/images/lookup?query=${encodeURIComponent(p.name)}`)
          let data = res.data

          // If the first attempt didn't find anything, retry once with a category-based fallback term.
          if (!data?.image_url) {
            const fallbackTerm = fallbackSearchForCategory(categoryKey)
            const fallbackRes = await api.get<ImageLookupResponse>(
              `/images/lookup?query=${encodeURIComponent(fallbackTerm)}`,
            )
            if (fallbackRes.data?.image_url) {
              data = fallbackRes.data
            }
          }

          map[p.id] = data
        } catch {
          map[p.id] = {
            found: false,
            image_url: null,
            source_title: null,
            source_page_url: null,
            license_short_name: null,
            license_url: null,
            artist: null,
          }
        }
      }

      if (!cancelled) setImageByProductId(map)
    }

    loadImages()
    return () => {
      cancelled = true
    }
  }, [products])

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
                  {imageByProductId[p.id]?.image_url ? (
                    <img
                      src={imageByProductId[p.id]!.image_url as string}
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
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 160,
                        borderRadius: 12,
                        border: '1px dashed rgba(255,255,255,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-soft)',
                        fontSize: 12,
                        marginBottom: 12,
                      }}
                    >
                      No image found
                    </div>
                  )}
                  <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>{p.name}</h3>
                  {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                    Category: <strong>{p.category}</strong>
                  </div>
                  {imageByProductId[p.id]?.license_url && imageByProductId[p.id]?.license_short_name ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>
                      License:{' '}
                      <a
                        href={imageByProductId[p.id]!.license_url as string}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-cyan)' }}
                      >
                        {imageByProductId[p.id]!.license_short_name}
                      </a>
                    </div>
                  ) : null}
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

