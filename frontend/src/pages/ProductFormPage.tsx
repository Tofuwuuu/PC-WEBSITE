import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Product, ProductCreate, ProductUpdate } from '../types'
import { Card } from '../components/ui/Card'
import { InputField, TextareaField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'

export function ProductFormPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const productId = params.id
  const isEdit = useMemo(() => Boolean(productId), [productId])

  const [name, setName] = useState('')
  const [category, setCategory] = useState('categories')
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
        setCategory(res.data.category ?? 'categories')
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
          category,
          description: description || null,
          url: url || null,
        }
        await api.put(`/products/${productId}`, payload)
      } else {
        const payload: ProductCreate = {
          name,
          category,
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
    <div className="ui-stack" style={{ maxWidth: 700, width: '100%', margin: '0 auto' }}>
      <div className="ui-inline" style={{ justifyContent: 'space-between' }}>
        <h1>{isEdit ? 'Edit item' : 'Add item'}</h1>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>

      {error && <p className="ui-alert">Error: {error}</p>}
      {loading ? (
        <Card variant="glass">
          <p style={{ color: 'var(--text-muted)' }}>Loading item...</p>
        </Card>
      ) : (
        <Card variant="feature">
          <form onSubmit={onSubmit} className="ui-stack">
            <label className="ui-field">
              <span className="ui-field-label">Category</span>
              <select className="ui-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="categories">Categories</option>
                <option value="pre_built">Pre-Built PCs</option>
                <option value="bundles">Bundles</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>
            <InputField label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="RTX 4080 Super" />
            <TextareaField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Short details about this component..."
            />
            <InputField
              label="URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              placeholder="https://..."
            />
            <div className="ui-inline">
              <Button loading={submitting} type="submit" variant="neon">
                {submitting ? 'Saving...' : 'Save item'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

