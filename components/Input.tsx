'use client'

import { forwardRef } from 'react'
import {
  FORM_BASE_CLASSES,
  FORM_DISABLED_READONLY_CLASSES,
  FORM_ERROR_CLASSES,
  FORM_LABEL_CLASSES,
  FORM_ERROR_MESSAGE_CLASSES
} from '@/lib/formStyles'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  labelClassName?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, labelClassName, error, id, className = '', ...props }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const labelClasses = labelClassName ?? FORM_LABEL_CLASSES
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${FORM_BASE_CLASSES} ${FORM_DISABLED_READONLY_CLASSES} ${error ? FORM_ERROR_CLASSES : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={FORM_ERROR_MESSAGE_CLASSES}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
