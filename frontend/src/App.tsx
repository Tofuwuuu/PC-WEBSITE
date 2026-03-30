import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CatalogPublicPage } from './pages/CatalogPublicPage'
import { CategoriesLandingPage } from './pages/CategoriesLandingPage'
import { CategoryProductsPage } from './pages/CategoryProductsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppLayout } from './layouts/AppLayout'

import './App.css'

function AppShell() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<CatalogPublicPage />} />
        <Route path="/categories" element={<CategoriesLandingPage />} />
        <Route
          path="/pre-built"
          element={
            <CategoryProductsPage
              categoryKey="pre_built"
              title="Pre-Built PCs"
              description="Ready-to-run builds engineered for speed, cooling, and style."
            />
          }
        />
        <Route
          path="/bundles"
          element={<CategoryProductsPage categoryKey="bundles" title="Bundles" description="Curated combos for value and compatibility." />}
        />
        <Route
          path="/accessories"
          element={
            <CategoryProductsPage
              categoryKey="accessories"
              title="Accessories"
              description="Finishing touches for your perfect setup."
            />
          }
        />
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
    </AppLayout>
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
