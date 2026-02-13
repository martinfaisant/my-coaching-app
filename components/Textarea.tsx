'use client'

import { forwardRef } from 'react'
import {
  FORM_BASE_CLASSES,
  FORM_DISABLED_READONLY_CLASSES,
  FORM_ERROR_CLASSES,
  TEXTAREA_SPECIFIC_CLASSES,
  FORM_LABEL_CLASSES,
  FORM_ERROR_MESSAGE_CLASSES
} from '@/lib/formStyles'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, id, className = '', ...props }, ref) {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={FORM_LABEL_CLASSES}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${FORM_BASE_CLASSES} ${TEXTAREA_SPECIFIC_CLASSES} ${FORM_DISABLED_READONLY_CLASSES} ${error ? FORM_ERROR_CLASSES : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className={FORM_ERROR_MESSAGE_CLASSES}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
