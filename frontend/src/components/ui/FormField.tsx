import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type CommonProps = {
  label: string
  error?: string | null
}

type InputProps = CommonProps & InputHTMLAttributes<HTMLInputElement>

export function InputField({ label, error, className = '', ...rest }: InputProps) {
  return (
    <label className="ui-field">
      <span className="ui-field-label">{label}</span>
      <input className={`ui-input ${error ? 'is-error' : ''} ${className}`.trim()} {...rest} />
      {error && <span className="ui-field-error">{error}</span>}
    </label>
  )
}

type TextareaProps = CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextareaField({ label, error, className = '', ...rest }: TextareaProps) {
  return (
    <label className="ui-field">
      <span className="ui-field-label">{label}</span>
      <textarea className={`ui-input ui-textarea ${error ? 'is-error' : ''} ${className}`.trim()} {...rest} />
      {error && <span className="ui-field-error">{error}</span>}
    </label>
  )
}

