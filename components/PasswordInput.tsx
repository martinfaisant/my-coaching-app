'use client'

import { forwardRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  FORM_BASE_CLASSES,
  FORM_DISABLED_READONLY_CLASSES,
  FORM_ERROR_CLASSES,
  FORM_LABEL_CLASSES,
  FORM_ERROR_MESSAGE_CLASSES,
  FORM_INPUT_HEIGHT,
} from '@/lib/formStyles'
import { IconEye } from '@/components/icons/IconEye'
import { IconEyeClosed } from '@/components/icons/IconEyeClosed'
import type { InputProps } from '@/components/Input'

export type PasswordInputProps = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, labelClassName, error, id, className = '', ...props }, ref) {
    const t = useTranslations('auth')
    const [visible, setVisible] = useState(false)
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const labelClasses = labelClassName ?? FORM_LABEL_CLASSES

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={`${FORM_BASE_CLASSES} ${FORM_INPUT_HEIGHT} pr-11 ${FORM_DISABLED_READONLY_CLASSES} ${error ? FORM_ERROR_CLASSES : ''} ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-forest-dark"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t('hidePassword') : t('showPassword')}
            aria-pressed={visible}
          >
            {visible ? <IconEyeClosed /> : <IconEye />}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className={FORM_ERROR_MESSAGE_CLASSES}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
