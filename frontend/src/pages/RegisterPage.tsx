import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useNavigate, Link } from 'react-router-dom'

export function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/auth/jwt/register', {
        email,
        password,
      })
      navigate('/login', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        {error && <p style={{ color: 'var(--accent)' }}>Error: {error}</p>}
        <div style={{ marginBottom: 12 }}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
          </label>
        </div>
        <button disabled={submitting} type="submit">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

