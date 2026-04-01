export type ItemCategory = 'pre_built' | 'bundles' | 'items' | 'categories'

export type Item = {
  id: string
  name: string
  category: ItemCategory
  description?: string
  url?: string
}

export const ITEMS: Item[] = [
  {
    id: 'prebuilt-001',
    name: 'ASUS ROG Pre-Built Gaming PC (Starter)',
    category: 'pre_built',
    description: 'A ready-to-run build focused on smooth 1080p/1440p gaming and clean thermals.',
  },
  {
    id: 'bundle-001',
    name: 'Bundle: GPU + Cooling Upgrade Kit',
    category: 'bundles',
    description: 'A curated bundle for performance and stability upgrades.',
  },
  {
    id: 'item-001',
    name: 'ASUS Motherboard (ATX)',
    category: 'items',
    description: 'Motherboard item example. Replace with your real parts list.',
  },
  {
    id: 'item-002',
    name: 'Intel CPU / Processor',
    category: 'items',
    description: 'CPU item example. Replace with your real parts list.',
  },
  {
    id: 'item-003',
    name: 'AMD Graphics Card / GPU',
    category: 'items',
    description: 'GPU item example. Replace with your real parts list.',
  },
  {
    id: 'item-004',
    name: 'Gaming Monitor 27\"',
    category: 'items',
    description: 'Monitor item example. Replace with your real parts list.',
  },
]

