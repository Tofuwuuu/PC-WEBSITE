import type { Item } from '../data/items'

// Auto-collect available image assets under src/assets (png/jpg/jpeg/webp/svg).
// This avoids hard-failing builds if you add/remove files.
const assetModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function pickFirstPath(includes: string[]): string | null {
  const entries = Object.entries(assetModules)
  for (const [path, url] of entries) {
    const lower = path.toLowerCase()
    if (includes.every((s) => lower.includes(s))) return url
  }
  return null
}

function fallbackImage(): string {
  // Prefer a generic-looking asset if present; otherwise fallback to whatever exists.
  return (
    pickFirstPath(['generic']) ??
    pickFirstPath(['hardware']) ??
    assetModules['../assets/vite.svg'] ??
    assetModules['../assets/react.svg'] ??
    Object.values(assetModules)[0] ??
    ''
  )
}

export function imageForItem(item: Pick<Item, 'name' | 'category'>): string {
  const name = (item.name ?? '').toLowerCase()

  // Brand/component keyword matching
  if (name.includes('asus') && (name.includes('motherboard') || name.includes('mainboard'))) {
    return pickFirstPath(['asus', 'motherboard']) ?? pickFirstPath(['motherboard']) ?? fallbackImage()
  }
  if (name.includes('intel') && (name.includes('cpu') || name.includes('processor'))) {
    return pickFirstPath(['intel', 'cpu']) ?? pickFirstPath(['cpu']) ?? fallbackImage()
  }
  if (name.includes('amd') && (name.includes('cpu') || name.includes('processor') || name.includes('ryzen'))) {
    return pickFirstPath(['amd', 'cpu']) ?? pickFirstPath(['ryzen']) ?? pickFirstPath(['cpu']) ?? fallbackImage()
  }
  if (name.includes('amd') && (name.includes('gpu') || name.includes('graphics') || name.includes('radeon'))) {
    return pickFirstPath(['amd', 'gpu']) ?? pickFirstPath(['radeon']) ?? pickFirstPath(['gpu']) ?? fallbackImage()
  }
  if (name.includes('nvidia') || name.includes('rtx') || name.includes('geforce')) {
    return pickFirstPath(['nvidia']) ?? pickFirstPath(['gpu']) ?? fallbackImage()
  }
  if (name.includes('gpu') || name.includes('graphics')) {
    return pickFirstPath(['gpu']) ?? fallbackImage()
  }
  if (name.includes('monitor') || name.includes('display')) {
    return pickFirstPath(['monitor']) ?? pickFirstPath(['display']) ?? fallbackImage()
  }

  // Category fallback
  if (item.category === 'pre_built') return pickFirstPath(['pc']) ?? pickFirstPath(['case']) ?? fallbackImage()
  if (item.category === 'bundles') return pickFirstPath(['bundle']) ?? fallbackImage()
  if (item.category === 'items') return fallbackImage()

  return fallbackImage()
}

