'use client'

import { forwardRef } from 'react'

/**
 * Zones de texte multiligne — alignées sur les formulaires existants (ProfileForm, WorkoutModal).
 * Classes : border-stone-300, rounded-lg, px-4 py-2.5, focus:ring-palette-forest-dark, resize-y
 */
const BASE_CLASSES =
  'w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent resize-y transition min-h-[100px]'

const DISABLED_READONLY_CLASSES =
  'disabled:bg-stone-100 disabled:text-stone-500 disabled:border-stone-200 disabled:cursor-not-allowed disabled:opacity-100 read-only:bg-stone-100 read-only:text-stone-500 read-only:border-stone-200 read-only:cursor-not-allowed read-only:opacity-100'

const ERROR_CLASSES = 'border-palette-danger focus:ring-palette-danger'

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
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${BASE_CLASSES} ${DISABLED_READONLY_CLASSES} ${error ? ERROR_CLASSES : ''} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-palette-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)
