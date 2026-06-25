'use client'

import type { ButtonHTMLAttributes } from 'react'

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Libellé accessibilité (ex. titre de la préférence). */
  label: string
}

const TRACK_BASE =
  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-forest-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const TRACK_ON = 'bg-palette-forest-dark'
const TRACK_OFF = 'bg-stone-300'
const THUMB =
  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform'

/**
 * Interrupteur on/off compact (h-6 w-11). Voir docs/DESIGN_SYSTEM.md.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className = '',
  ...rest
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`${TRACK_BASE} ${checked ? TRACK_ON : TRACK_OFF} ${className}`.trim()}
      onClick={() => {
        if (!disabled) onCheckedChange(!checked)
      }}
      {...rest}
    >
      <span
        className={`${THUMB} ${checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`}
        aria-hidden
      />
    </button>
  )
}
