import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon' | 'outline-accent'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', loading = false, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      className={`ui-btn ui-btn-${variant} ${className}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

