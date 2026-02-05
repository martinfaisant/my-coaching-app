'use client'

import { forwardRef } from 'react'

const baseClasses =
  'inline-flex items-center justify-center rounded-lg bg-palette-forest-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Rendre le bouton en pleine largeur */
  fullWidth?: boolean
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton({ className = '', fullWidth, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        className={`${baseClasses} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    )
  }
)
