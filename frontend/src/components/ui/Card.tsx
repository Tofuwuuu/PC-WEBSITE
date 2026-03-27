import type { ReactNode } from 'react'

type CardVariant = 'default' | 'feature' | 'glass' | 'compact'

const variantToClass: Record<CardVariant, string> = {
  default: '',
  feature: 'ui-card-feature',
  glass: 'ui-card-glass',
  compact: 'ui-card-compact',
}

export function Card({
  children,
  className = '',
  variant = 'default',
}: {
  children: ReactNode
  className?: string
  variant?: CardVariant
}) {
  return <section className={`ui-card ${variantToClass[variant]} ${className}`.trim()}>{children}</section>
}

