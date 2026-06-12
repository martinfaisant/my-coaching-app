'use client'

import { PasswordInput } from '@/components/PasswordInput'
import { PasswordRequirements } from '@/components/PasswordRequirements'

type NewPasswordFieldProps = {
  id: string
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  autoComplete?: 'new-password'
  placeholder?: string
  className?: string
  error?: string
  highlightFailures?: boolean
}

export function NewPasswordField({
  id,
  label,
  name,
  value,
  onChange,
  autoComplete = 'new-password',
  placeholder,
  className,
  error,
  highlightFailures = false,
}: NewPasswordFieldProps) {
  const requirementsId = `${id}-requirements`
  const describedBy = error ? `${requirementsId} ${id}-error` : requirementsId

  return (
    <div className="w-full">
      <PasswordInput
        id={id}
        label={label}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        placeholder={placeholder}
        className={className}
        error={error}
        describedBy={describedBy}
      />
      <PasswordRequirements
        password={value}
        listId={requirementsId}
        highlightFailures={highlightFailures}
      />
    </div>
  )
}
