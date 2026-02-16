import type { SportType } from '@/types/database'
import { SPORT_ICONS, SPORT_CARD_STYLES } from '@/lib/sportStyles'

type ActivityTileBaseProps = {
  /** Titre principal de l'activité */
  title: string
  /** Date de l'activité (affichée en bas) */
  date?: string
  /** Fonction appelée au clic sur la tuile */
  onClick?: () => void
  /** Classes CSS supplémentaires */
  className?: string
}

type WorkoutTileProps = ActivityTileBaseProps & {
  type: 'workout'
  /** Type de sport (détermine l'icône et la couleur de bordure) */
  sportType: SportType
  /** Métadonnées optionnelles (ex: "45'", "10 km", "120m D+") */
  metadata?: string[]
}

type StravaActivityTileProps = ActivityTileBaseProps & {
  type: 'strava'
  /** Label du type d'activité Strava (ex: "Run", "Ride") */
  activityLabel: string
  /** Métadonnées optionnelles (ex: "10.5 km", "150m D+") */
  metadata?: string[]
}

type GoalTileProps = ActivityTileBaseProps & {
  type: 'goal'
  /** Distance de la course (en km) */
  distance: number
  /** Si true, objectif principal (badge amber), sinon secondaire (badge sage) */
  isPrimary: boolean
}

export type ActivityTileProps = WorkoutTileProps | StravaActivityTileProps | GoalTileProps

/**
 * Composant tuile d'activité unifié pour :
 * - Entraînements planifiés (workout)
 * - Activités Strava importées (strava)
 * - Objectifs de course (goal)
 * 
 * Design inspiré du style Strava avec bordure gauche colorée et badge.
 * 
 * @example
 * // Entraînement
 * <ActivityTile
 *   type="workout"
 *   sportType="course"
 *   title="Sortie longue"
 *   metadata={["1h30", "15 km", "200m D+"]}
 *   date="Lun. 12 fév."
 *   onClick={() => console.log('click')}
 * />
 * 
 * @example
 * // Activité Strava
 * <ActivityTile
 *   type="strava"
 *   activityLabel="Run"
 *   title="Morning run"
 *   metadata={["10.5 km", "150m D+"]}
 *   date="Mar. 13 fév."
 *   onClick={() => console.log('click')}
 * />
 * 
 * @example
 * // Objectif
 * <ActivityTile
 *   type="goal"
 *   isPrimary={true}
 *   title="Marathon de Paris"
 *   distance={42.2}
 *   date="Dim. 7 avr."
 *   onClick={() => console.log('click')}
 * />
 */
export function ActivityTile(props: ActivityTileProps) {
  const { title, date, onClick, className = '' } = props

  // Rendu entraînement planifié
  if (props.type === 'workout') {
    const { sportType, metadata = [] } = props
    const style = SPORT_CARD_STYLES[sportType]
    const SportIcon = SPORT_ICONS[sportType]

    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-lg border border-l-4 ${style.borderLeft} border-stone-200 bg-white p-3 shadow-sm training-card flex items-center gap-3 ${className}`}
      >
        <span className={`shrink-0 inline-flex ${style.badge} ${style.badgeBg} px-2 py-1 rounded`}>
          <SportIcon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-stone-900 truncate">{title}</div>
          {(metadata.length > 0 || date) && (
            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              {date && <span>{date}</span>}
              {date && metadata.length > 0 && <span className="text-sm font-bold">·</span>}
              {metadata.map((item, idx) => (
                <span key={idx} className="contents">
                  <span>{item}</span>
                  {idx < metadata.length - 1 && <span className="text-sm font-bold">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    )
  }

  // Rendu activité Strava
  if (props.type === 'strava') {
    const { activityLabel, metadata = [] } = props

    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-lg border border-l-4 border-l-palette-strava border-stone-200 bg-white p-3 shadow-sm training-card flex items-center gap-3 ${className}`}
      >
        <img src="/strava-icon.svg" alt="" className="h-5 w-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase text-palette-strava bg-orange-100 px-1.5 py-0.5 rounded leading-none">
              {activityLabel}
            </span>
          </div>
          <div className="font-semibold text-stone-900 truncate">{title}</div>
          {(metadata.length > 0 || date) && (
            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              {date && <span>{date}</span>}
              {date && metadata.length > 0 && <span className="text-sm font-bold">·</span>}
              {metadata.map((item, idx) => (
                <span key={idx} className="contents">
                  <span>{item}</span>
                  {idx < metadata.length - 1 && <span className="text-sm font-bold">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    )
  }

  // Rendu objectif de course
  if (props.type === 'goal') {
    const { distance, isPrimary } = props
    const borderColor = isPrimary ? 'border-l-palette-amber' : 'border-l-palette-sage'
    const badgeColor = isPrimary ? 'text-palette-amber bg-palette-amber/10' : 'text-palette-sage bg-palette-sage/10'

    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-lg border border-l-4 ${borderColor} border-stone-200 bg-white p-3 shadow-sm training-card flex items-center gap-3 ${className}`}
      >
        <span className={`shrink-0 inline-flex items-center justify-center ${badgeColor} px-2 py-1 rounded`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-stone-900 truncate">{title}</div>
          <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            {date && <span>{date}</span>}
            {date && <span className="text-sm font-bold">·</span>}
            <span>{distance} km</span>
          </div>
        </div>
      </button>
    )
  }

  return null
}
