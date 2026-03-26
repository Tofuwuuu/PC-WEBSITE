import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CatalogPublicPage } from './pages/CatalogPublicPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { RegisterPage } from './pages/RegisterPage'

import './App.css'

function AppShell() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()

  const onLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/">Catalog</Link>
          {token ? <Link to="/dashboard">Dashboard</Link> : <Link to="/login">Login</Link>}
          {!token && <Link to="/register">Register</Link>}
        </nav>

        {token && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ opacity: 0.85 }}>{user?.email ?? ''}</span>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<CatalogPublicPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/new"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/:id"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<span>Not found</span>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
