import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/authStore'
import { useNavigate, Link } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const form = new URLSearchParams()
      // fastapi-users uses `OAuth2PasswordRequestForm` for JWT login => form-encoded `username` and `password`.
      form.set('username', email)
      form.set('password', password)

      const res = await api.post('/auth/jwt/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      // fastapi-users returns { access_token: "...", token_type: "bearer" }
      const accessToken: string = res.data.access_token
      loginSuccess(accessToken)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Log in</h1>
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
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

