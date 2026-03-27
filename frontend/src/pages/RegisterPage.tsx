import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'

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
    <div className="auth-shell">
      <Card className="auth-card" variant="glass">
        <div className="ui-stack">
          <div>
            <p className="hero-kicker">New Account</p>
            <h1 className="auth-title">Create account</h1>
            <p className="page-lead">Set up your account to manage products and content.</p>
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
              placeholder="Choose a secure password"
            />
            <Button loading={submitting} type="submit" variant="neon">
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

