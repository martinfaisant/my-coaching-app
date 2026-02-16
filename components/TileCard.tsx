'use client'

/**
 * TileCard — Conteneur avec le même style de tour (bordure) que les tuiles
 * de la modale "Activités du jour" (ActivityTile).
 *
 * Utilisé pour uniformiser l’affichage des cartes : objectifs (page Objectifs),
 * tuiles d’activités dans la modale, etc.
 *
 * Style appliqué : rounded-lg, bordure gauche colorée 4px, bordure stone-200,
 * fond blanc, padding, shadow-sm, optionnellement hover (training-card).
 */

export type TileCardBorderColor =
  | 'amber'
  | 'sage'
  | 'forest'
  | 'strava'
  | 'gold'
  | 'olive'

const BORDER_CLASSES: Record<TileCardBorderColor, string> = {
  amber: 'border-l-palette-amber',
  sage: 'border-l-palette-sage',
  forest: 'border-l-palette-forest-dark',
  strava: 'border-l-palette-strava',
  gold: 'border-l-palette-gold',
  olive: 'border-l-palette-olive',
}

type TileCardProps = {
  /** Couleur de la bordure gauche (alignée sur les tokens du design system). */
  leftBorderColor: TileCardBorderColor
  /** Contenu de la carte. */
  children: React.ReactNode
  /** Classes CSS supplémentaires. */
  className?: string
  /** Si true, applique le hover type "training-card" (léger lift + ombre). */
  interactive?: boolean
  /** Rendu en bouton cliquable au lieu de div. */
  as?: 'div' | 'button'
  /** Callback au clic (utilisé lorsque as="button"). */
  onClick?: () => void
  /** Type du bouton (si as="button"). */
  type?: 'button' | 'submit'
}

const baseClasses =
  'rounded-lg border border-l-4 border-stone-200 bg-white p-3 shadow-sm text-left w-full'

export function TileCard({
  leftBorderColor,
  children,
  className = '',
  interactive = false,
  as = 'div',
  onClick,
  type = 'button',
}: TileCardProps) {
  const borderClass = BORDER_CLASSES[leftBorderColor]
  const interactiveClass = interactive ? 'training-card cursor-pointer' : ''
  const combined = `${baseClasses} ${borderClass} ${interactiveClass} ${className}`.trim()

  if (as === 'button') {
    return (
      <button type={type} onClick={onClick} className={combined}>
        {children}
      </button>
    )
  }

  return <div className={combined}>{children}</div>
}
