'use client'

import { forwardRef } from 'react'

/**
 * Boutons — variantes inspirées de l'existant du site.
 * Références : page accueil, login, modales, RespondToRequest, FindCoachSection, WorkoutModal, Logout, Strava.
 */
/** Taille unifiée pour toutes les variantes */
const SIZE_CLASSES = 'min-h-10 px-4 py-2.5 text-sm font-medium'

const VARIANT_STYLES = {
  /** Principal : Créer un compte, S'inscrire, Accepter */
  primary:
    `rounded-lg ${SIZE_CLASSES} text-white bg-palette-forest-dark hover:bg-palette-olive transition-colors focus:outline-none`,
  /** CTA modales : Enregistrer, Envoyer la demande */
  primaryDark:
    `rounded-lg ${SIZE_CLASSES} text-white bg-palette-forest-dark hover:bg-palette-forest-darker transition-colors focus:outline-none`,
  /** Secondaire : Se connecter (header) */
  secondary:
    `rounded-lg ${SIZE_CLASSES} text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none`,
  /** Contour vert : Voir le détail */
  outline:
    `rounded-lg ${SIZE_CLASSES} font-bold border-2 border-palette-forest-dark text-palette-forest-dark hover:bg-palette-forest-dark hover:!text-white transition-colors focus:outline-none`,
  /** Annuler, Refuser, Retour */
  muted:
    `rounded-lg ${SIZE_CLASSES} border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors focus:outline-none`,
  /** Bouton X fermer (icône) */
  ghost:
    'rounded-lg min-h-10 min-w-10 p-0 text-stone-500 hover:text-stone-700 hover:bg-stone-200/80 transition-colors focus:outline-none',
  /** Déconnexion, Supprimer, actions destructives */
  danger:
    `rounded-lg ${SIZE_CLASSES} text-stone-400 hover:text-palette-danger hover:bg-palette-danger-light transition-colors focus:outline-none`,
  /** Connecter Strava */
  strava:
    `rounded-lg ${SIZE_CLASSES} text-white bg-palette-strava hover:opacity-90 transition-opacity focus:outline-none`,
} as const

type ButtonVariant = keyof typeof VARIANT_STYLES

const CheckIcon = ({ animated = false }: { animated?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 shrink-0 ${animated ? 'animate-saved-check' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
  </svg>
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant
    fullWidth?: boolean
    loading?: boolean
    loadingText?: string
    /** Affichage temporaire après enregistrement : ✓ Enregistré */
    success?: boolean
    /** Affichage en cas d'erreur : ✗ Non enregistré + style rouge */
    error?: boolean
    /** Quand fourni, rend un <a> au lieu de <button> */
    href?: string
  }

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      fullWidth = false,
      loading = false,
      loadingText,
      success = false,
      error = false,
      disabled,
      className = '',
      children,
      href,
      ...props
    },
    ref
  ) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
    const variantClasses = VARIANT_STYLES[variant]
    const errorClasses = error ? '!bg-palette-danger-dark hover:!bg-palette-danger-darker' : ''
    const classes = `${baseClasses} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${errorClasses} ${className}`.trim()

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          aria-disabled={disabled}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }

    const getContent = () => {
      if (loading && loadingText) return loadingText
      if (loading) return children
      if (success)
        return (
          <span className="inline-flex items-center gap-1.5">
            <CheckIcon animated />
            <span>Enregistré</span>
          </span>
        )
      if (error)
        return (
          <span className="inline-flex items-center gap-1.5">
            <CrossIcon />
            <span>Non enregistré</span>
          </span>
        )
      return children
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? 'button'}
        disabled={disabled || loading}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {getContent()}
      </button>
    )
  }
)
