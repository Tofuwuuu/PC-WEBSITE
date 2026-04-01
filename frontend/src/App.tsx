import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CatalogPublicPage } from './pages/CatalogPublicPage'
import { CategoriesLandingPage } from './pages/CategoriesLandingPage'
import { CategoryProductsPage } from './pages/CategoryProductsPage'
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
          path="/items"
          element={
            <CategoryProductsPage
              categoryKey="items"
              title="Items"
              description="Hardware items like GPUs, CPUs, monitors, and more."
            />
          }
        />

        <Route path="*" element={<span>Not found</span>} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
