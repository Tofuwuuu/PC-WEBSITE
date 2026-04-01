import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const categories = [
  {
    key: 'categories',
    title: 'Categories',
    description: 'Browse the full catalog by type.',
    route: '/categories',
    buttonVariant: 'outline-accent' as const,
  },
  {
    key: 'pre_built',
    title: 'Pre-Built PCs',
    description: 'Ready-to-run builds for performance-focused users.',
    route: '/pre-built',
    buttonVariant: 'neon' as const,
  },
  {
    key: 'bundles',
    title: 'Bundles',
    description: 'Curated combos for value and compatibility.',
    route: '/bundles',
    buttonVariant: 'outline-accent' as const,
  },
  {
    key: 'accessories',
    title: 'Items',
    description: 'Hardware items like GPUs, CPUs, monitors, and more.',
    route: '/items',
    buttonVariant: 'outline-accent' as const,
  },
]

export function CategoriesLandingPage() {
  return (
    <div className="ui-stack">
      <h1>Categories</h1>
      <p className="page-lead">
        Explore PC builds and components. Select a category to view available items.
      </p>

      <div className="ui-grid">
        {categories.map((c) => (
          <Link
            key={c.key}
            to={c.route}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card variant="feature" className="ui-card-clickable">
              <p className="hero-kicker" style={{ margin: 0, opacity: 0.95 }}>
                {c.title.toUpperCase()}
              </p>
              <h2 style={{ marginTop: 10, marginBottom: 10 }}>{c.title}</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>{c.description}</p>

              <div style={{ marginTop: 16 }}>
                <Button variant={c.buttonVariant} type="button">
                  View items
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

