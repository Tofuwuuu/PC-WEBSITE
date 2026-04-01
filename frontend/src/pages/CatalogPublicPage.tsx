import { ITEMS } from '../data/items'
import { imageForItem } from '../utils/itemImages'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function CatalogPublicPage() {
  const products = ITEMS

  return (
    <div className="ui-stack">
      <section className="hero-showcase">
        <div className="hero-main">
          <div className="hero-visual" aria-hidden="true">
            Featured visual area
          </div>
          <div className="hero-content">
            <span className="hero-kicker">AORUS PERFORMANCE SERIES</span>
            <h1 className="hero-title">
              DOMINATE
              <br />
              THE BUILD
            </h1>
            <p className="hero-copy">
              Elevate your setup with flagship GPUs, premium motherboards, and tuned components that balance
              performance, thermals, and style.
            </p>
            <div className="hero-actions">
              <Button variant="neon" type="button">Shop the gear</Button>
              <Link to="/login">
                <Button variant="outline-accent" type="button">Build your rig</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="spotlight-strip">
        <div>
          <span className="hero-kicker" style={{ color: 'var(--danger)' }}>ROG ASTRAL LINEUP</span>
          <h2 className="spotlight-title">GeForce RTX 5090</h2>
          <p className="page-lead" style={{ margin: 0 }}>
            High-efficiency cooling, stable boost clocks, and a chassis-first aesthetic for premium PC builds.
          </p>
        </div>
        <div className="hero-visual" aria-hidden="true" style={{ minHeight: 170 }}>
          Spotlight visual area
        </div>
      </section>

      <div>
        <h2 style={{ marginBottom: 8 }}>Component Catalog</h2>
        <p className="page-lead">
          Browse parts and components.
        </p>
      </div>

      {products.length === 0 && (
        <Card variant="glass">
          <p style={{ color: 'var(--text-muted)' }}>No components listed yet. Check back later.</p>
        </Card>
      )}

      <div className="ui-grid">
        {products.map((p) => (
          <Card key={p.id} variant="compact">
            <img
              src={imageForItem(p)}
              alt={p.name}
              loading="lazy"
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                borderRadius: 12,
                marginBottom: 12,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>{p.name}</h3>
            {p.description && <p style={{ marginBottom: 8 }}>{p.description}</p>}
            {p.url ? (
              <a href={p.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                <Button variant="secondary" type="button">View details</Button>
              </a>
            ) : (
              <div style={{ opacity: 0.7, color: 'var(--text-soft)' }}>No link available</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

