'use client'

/**
 * Badges — étiquettes pour sports, langues, objectifs, statuts.
 * Variantes : default, primary, sport-*, success, warning.
 * Pour les sports : utiliser sport="course" (etc.) pour icône + couleur alignés calendrier.
 */
import type { SportType } from '@/lib/sportStyles'
import { SPORT_ICONS, SPORT_BADGE_STYLES } from '@/lib/sportStyles'
import { useSportLabel } from '@/lib/hooks/useSportLabel'

const BADGE_STYLES = {
  default:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200',
  primary:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20',
  /** Course à pied — forest */
  'sport-course':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-forest-dark border border-palette-forest-dark',
  /** Vélo — olive */
  'sport-velo':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-olive border border-palette-olive',
  /** Natation — sky (aligné calendrier) */
  'sport-natation':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-sky-700 border border-sky-500',
  /** Trail — gold (icône montagne) */
  'sport-trail':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-gold border border-palette-gold',
  /** Randonnée — sage */
  'sport-randonnee':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-sage border border-palette-sage',
  /** Triathlon — amber */
  'sport-triathlon':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber',
  /** Musculation — stone */
  'sport-musculation':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-stone-600 border border-stone-300',
  /** Ski de fond — sage */
  'sport-nordic_ski':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-sage border border-palette-sage',
  /** Ski de randonnée — gold */
  'sport-backcountry_ski':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-gold border border-palette-gold',
  /** Patin à glace — cyan */
  'sport-ice_skating':
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-cyan-700 border border-cyan-600',
  success:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20',
  /** Objectif principal (orange, fond blanc) */
  warning:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber',
  /** Objectif secondaire (vert/sage, fond blanc) */
  goalSecondary:
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-sage border border-palette-sage',
} as const

export type BadgeVariant = keyof typeof BADGE_STYLES

export type BadgeProps = {
  variant?: BadgeVariant
  /** Sport (calendrier) : affiche icône + label avec couleurs alignées. Prioritaire sur variant/children. */
  sport?: SportType
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
  
  if (sport && sport in SPORT_BADGE_STYLES) {
    const styles = SPORT_BADGE_STYLES[sport as SportType]
    const Icon = SPORT_ICONS[sport as SportType]
    const label = children ?? getSportLabel(sport as SportType)
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
  const classes = `${BADGE_STYLES[variant]} ${className}`.trim()
  return <span className={classes}>{children}</span>
}
