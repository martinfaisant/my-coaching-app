'use client'

/**
 * Badges — étiquettes pour sports, langues, objectifs, statuts.
 * Variantes : default, primary, sport-*, success, warning.
 * Pour les sports : utiliser sport="course" (etc.) pour icône + couleur alignés calendrier.
 */
import type { SportType } from '@/lib/sportStyles'
import { normalizeSportType, SPORT_ICONS, SPORT_BADGE_STYLES } from '@/lib/sportStyles'
import { useSportLabel } from '@/lib/hooks/useSportLabel'

const BADGE_STYLES = {
  default:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200',
  primary:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20',
  success:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20',
  /** Objectif principal (orange, fond blanc) */
  warning:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber',
  /** Objectif secondaire (vert/sage, fond blanc) */
  goalSecondary:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-sage border border-palette-sage',
} as const

export type SportBadgeVariant = `sport-${SportType}`
export type BadgeVariant = keyof typeof BADGE_STYLES | SportBadgeVariant

export type BadgeProps = {
  variant?: BadgeVariant
  /** Sport (calendrier) : affiche icône + label avec couleurs alignées. Prioritaire sur variant/children. */
  sport?: SportType | string
  children?: React.ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  sport,
  children,
  className = '',
}: BadgeProps) {
  const getSportLabel = useSportLabel()
  
  const resolvedSportRaw =
    sport ??
    (() => {
      if (typeof variant === 'string' && variant.startsWith('sport-')) {
        return variant.slice('sport-'.length)
      }
      return null
    })()
  const resolvedSport = resolvedSportRaw ? normalizeSportType(String(resolvedSportRaw)) : null
  if (resolvedSport && resolvedSport in SPORT_BADGE_STYLES) {
    const styles = SPORT_BADGE_STYLES[resolvedSport]
    const Icon = SPORT_ICONS[resolvedSport]
    const label = children ?? getSportLabel(resolvedSport)
    const baseClasses =
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border'
    const classes = `${baseClasses} ${styles.bg} ${styles.text} ${styles.border} ${className}`.trim()
    return (
      <span className={classes}>
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span>{label}</span>
      </span>
    )
  }
  const baseVariant = variant in BADGE_STYLES ? (variant as keyof typeof BADGE_STYLES) : 'default'
  const classes = `${BADGE_STYLES[baseVariant]} ${className}`.trim()
  return <span className={classes}>{children}</span>
}
