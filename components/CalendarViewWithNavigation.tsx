'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarView } from './CalendarView'
import { getWorkoutsForDateRange, getImportedActivitiesForDateRange } from '@/app/dashboard/workouts/actions'
import type { Workout, Goal, ImportedActivity } from '@/types/database'

const SLIDE_DURATION_MS = 380
/** Hauteur approximative d’une section « semaine » pour le glissement (px). */
const SLIDE_PX = 320

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Affiche "1 janv. - 21 janv." (premier jour de la 1ère semaine — dernier jour de la 3e semaine). */
function formatWeekRangeLabel(referenceMonday: Date): string {
  const startMonday = new Date(referenceMonday)
  startMonday.setDate(startMonday.getDate() - 7)
  const endDay = new Date(startMonday)
  endDay.setDate(endDay.getDate() + 7 * 3 - 1)
  const startLabel = startMonday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const endLabel = endDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${startLabel} – ${endLabel}`
}

type CalendarViewWithNavigationProps = {
  athleteId: string
  athleteEmail: string
  initialWorkouts: Workout[]
  initialImportedActivities?: ImportedActivity[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
  /** Titre affiché à gauche de la barre (ex. "Calendrier d'entraînement — email"). Même niveau que le sélecteur de semaine. */
  title?: React.ReactNode
}

/** 7 semaines pour éviter un refetch à chaque clic (marge ~2 semaines de chaque côté des 3 affichées). */
function getSevenWeekRange(referenceMonday: Date): { start: string; end: string } {
  const startMonday = new Date(referenceMonday)
  startMonday.setDate(startMonday.getDate() - 7 - 14) // 2 semaines avant la 1ère affichée
  const endDay = new Date(startMonday)
  endDay.setDate(endDay.getDate() + 7 * 7 - 1)
  return { start: toDateStr(startMonday), end: toDateStr(endDay) }
}

export function CalendarViewWithNavigation({
  athleteId,
  athleteEmail,
  initialWorkouts,
  initialImportedActivities = [],
  goals = [],
  canEdit,
  pathToRevalidate,
  title,
}: CalendarViewWithNavigationProps) {
  const today = new Date()
  const currentMonday = getWeekMonday(today)
  const [referenceMonday, setReferenceMonday] = useState<Date>(currentMonday)
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [importedActivities, setImportedActivities] = useState<ImportedActivity[]>(initialImportedActivities)
  const [loading, setLoading] = useState(false)
  const [loadedRange, setLoadedRange] = useState<{ start: string; end: string } | null>(null)

  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const [slideEnd, setSlideEnd] = useState(false)
  const animatingRef = useRef(false)

  useEffect(() => {
    const required = getSevenWeekRange(referenceMonday)
    const needsFetch =
      !loadedRange ||
      required.start < loadedRange.start ||
      required.end > loadedRange.end

    if (!needsFetch) return

    const loadData = async () => {
      setLoading(true)
      const [workoutsResult, importedResult] = await Promise.all([
        getWorkoutsForDateRange(athleteId, required.start, required.end),
        getImportedActivitiesForDateRange(athleteId, required.start, required.end),
      ])
      if (workoutsResult.error) {
        console.error('Erreur lors du chargement des entraînements:', workoutsResult.error)
      } else {
        setWorkouts((workoutsResult.workouts ?? []) as Workout[])
      }
      if (!importedResult.error) {
        setImportedActivities((importedResult.importedActivities ?? []) as ImportedActivity[])
      }
      setLoadedRange(required)
      setLoading(false)
    }

    loadData()
  }, [referenceMonday, athleteId, loadedRange])

  const handleNavigate = (weeksOffset: number) => {
    if (animatingRef.current) return

    const newRefMonday = new Date(referenceMonday)
    newRefMonday.setDate(newRefMonday.getDate() + weeksOffset * 7)
    const direction = weeksOffset > 0 ? 'next' : 'prev'

    animatingRef.current = true
    setSlideDirection(direction)
    setSlideEnd(false)
    setReferenceMonday(newRefMonday)
    setIsAnimating(true)

    requestAnimationFrame(() => {
      setSlideEnd(true)
    })
    setTimeout(() => {
      setIsAnimating(false)
      setSlideEnd(false)
      animatingRef.current = false
    }, SLIDE_DURATION_MS)
  }

  const dateRangeLabel = formatWeekRangeLabel(referenceMonday)

  // Suivant = semaines plus tard = le calendrier « remonte » (nouveau contenu vient du bas et monte)
  // Précédent = semaines plus tôt = le calendrier « descend » (nouveau contenu vient du haut et descend)
  const getTransform = (): string => {
    if (!isAnimating) return 'translateY(0)'
    if (!slideEnd) {
      return slideDirection === 'next' ? `translateY(${SLIDE_PX}px)` : `translateY(-${SLIDE_PX}px)`
    }
    return 'translateY(0)'
  }

  return (
    <div>
      <div className="flex items-center justify-between w-full pb-2 mb-0 flex-wrap gap-2">
        {title != null ? <div className="flex-1 min-w-0">{title}</div> : <div className="flex-1" />}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNavigate(-1)}
            disabled={isAnimating}
            className="rounded-lg border-2 border-palette-forest-dark p-2 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            aria-label="Semaine précédente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-medium text-stone-700 min-w-[10rem] text-center">
            {dateRangeLabel}
          </span>
          <button
            type="button"
            onClick={() => handleNavigate(1)}
            disabled={isAnimating}
            className="rounded-lg border-2 border-palette-forest-dark p-2 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            aria-label="Semaine suivante"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="ease-out"
          style={{
            transitionProperty: 'transform',
            transitionDuration: `${SLIDE_DURATION_MS}ms`,
            transform: getTransform(),
          }}
        >
          <CalendarView
            athleteId={athleteId}
            athleteEmail={athleteEmail}
            workouts={workouts}
            importedActivities={importedActivities}
            goals={goals}
            canEdit={canEdit}
            pathToRevalidate={pathToRevalidate}
            referenceMonday={referenceMonday}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  )
}
