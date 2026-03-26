import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Product, ProductCreate, ProductUpdate } from '../types'

export function ProductFormPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const productId = params.id
  const isEdit = useMemo(() => Boolean(productId), [productId])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!productId) return
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Product>(`/products/${productId}`)
        if (cancelled) return
        setName(res.data.name ?? '')
        setDescription(res.data.description ?? '')
        setUrl(res.data.url ?? '')
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.detail ?? e.message ?? 'Failed to load item')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isEdit && productId) {
        const payload: ProductUpdate = {
          name,
          description: description || null,
          url: url || null,
        }
        await api.put(`/products/${productId}`, payload)
      } else {
        const payload: ProductCreate = {
          name,
          description: description || undefined,
          url: url || undefined,
        }
        await api.post('/products', payload)
      }
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>{isEdit ? 'Edit item' : 'Add item'}</h1>
      <p>
        <Link to="/dashboard">Back to dashboard</Link>
      </p>

      {error && <p style={{ color: 'var(--accent)' }}>Error: {error}</p>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              URL (optional)
              <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" style={{ width: '100%' }} />
            </label>
          </div>

          <button disabled={submitting} type="submit">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </div>
  )
}

