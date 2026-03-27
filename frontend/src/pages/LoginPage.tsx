import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'

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
    <div className="auth-shell">
      <Card className="auth-card" variant="glass">
        <div className="ui-stack">
          <div>
            <p className="hero-kicker">Account Access</p>
            <h1 className="auth-title">Welcome back</h1>
            <p className="page-lead">Log in to manage your catalog and dashboard.</p>
          </div>
          <form onSubmit={onSubmit} className="ui-stack">
            {error && <p className="ui-alert">Error: {error}</p>}
            <InputField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
            />
            <InputField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Your password"
            />
            <Button loading={submitting} type="submit" variant="neon">
              {submitting ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

