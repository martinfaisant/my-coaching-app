import { getSportLabel } from '@/lib/getSportLabel'
import { SPORT_BADGE_STYLES, SPORT_ICONS } from '@/lib/sportStyles'
import { PERSISTED_WORKOUT_SPORT_TYPES } from '@/lib/sportsRegistry'

export async function FaqSportsList() {
  const sports = await Promise.all(
    PERSISTED_WORKOUT_SPORT_TYPES.map(async (sport) => ({
      sport,
      label: await getSportLabel(sport),
    }))
  )

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Sports">
      {sports.map(({ sport, label }) => {
        const styles = SPORT_BADGE_STYLES[sport]
        const Icon = SPORT_ICONS[sport]

        return (
          <li key={sport}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${styles.bg} ${styles.text} ${styles.border}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
