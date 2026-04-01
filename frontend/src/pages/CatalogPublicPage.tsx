import { ITEMS } from '../data/items'
import { imageForItem } from '../utils/itemImages'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const heroAssetModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function pickHeroImage(requiredKeywords: string[], fallbackKeywords: string[] = []): string {
  const entries = Object.entries(heroAssetModules)
  for (const [path, url] of entries) {
    const lower = path.toLowerCase()
    if (requiredKeywords.every((k) => lower.includes(k))) return url
  }
  if (fallbackKeywords.length > 0) {
    for (const [path, url] of entries) {
      const lower = path.toLowerCase()
      if (fallbackKeywords.every((k) => lower.includes(k))) return url
    }
  }
  return heroAssetModules['../assets/vite.svg'] ?? heroAssetModules['../assets/react.svg'] ?? Object.values(heroAssetModules)[0] ?? ''
}

export function CatalogPublicPage() {
  const products = ITEMS
  const featuredImage = pickHeroImage(['asus', 'gx601'], ['rog', 'strix'])
  const spotlightImage = pickHeroImage(['5090'], ['galax', 'geforce'])

  return (
    <div className="ui-stack">
      <section className="hero-showcase">
        <div className="hero-main">
          <div className="hero-media hero-media-featured" aria-hidden="true">
            <img
              className="hero-media-img"
              src={featuredImage}
              alt="ASUS GX601 ROG STRIX featured build"
              loading="lazy"
            />
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
              <Link to="/categories">
                <Button variant="outline-accent" type="button">Build your rig</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="spotlight-strip">
        <div>
          <span className="hero-kicker" style={{ color: 'var(--danger)' }}>GALAX GEFORCE LINEUP</span>
          <h2 className="spotlight-title">GeForce RTX 5090</h2>
          <p className="page-lead" style={{ margin: 0 }}>
            High-efficiency cooling, stable boost clocks, and a chassis-first aesthetic for premium PC builds.
          </p>
        </div>
        <div className="hero-media hero-media-spotlight" aria-hidden="true">
          <img
            className="hero-media-img"
            src={spotlightImage}
            alt="GeForce RTX 5090 spotlight"
            loading="lazy"
          />
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
            <div className="catalog-item-media">
              <img
                src={imageForItem(p)}
                alt={p.name}
                loading="lazy"
                className="catalog-item-media-img"
              />
            </div>
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

