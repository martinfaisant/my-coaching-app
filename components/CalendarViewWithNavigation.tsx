'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from './Button'
import { CalendarView } from './CalendarView'
import { getWorkoutsForDateRange, getImportedActivitiesForDateRange, getEffectiveWeeklyTotalsFait, getWorkoutWeeklyTotals } from '@/app/[locale]/dashboard/workouts/actions'
import { getAvailabilityForDateRange } from '@/app/[locale]/dashboard/availability/actions'
import type { Workout, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal, AthleteAvailabilitySlot } from '@/types/database'
import { getWeekMonday, toDateStr } from '@/lib/dateUtils'

const SLIDE_DURATION_MS = 380
/** Hauteur approximative d’une section « semaine » pour le glissement (px). */
const SLIDE_PX = 320

const localeTag = (locale: string) => (locale === 'fr' ? 'fr-FR' : 'en-US')

/** Formate une date en "j janv." (jour + mois court). */
function formatShortDate(date: Date, locale: string): string {
  return date.toLocaleDateString(localeTag(locale), { day: 'numeric', month: 'short' })
}

/** Affiche la plage de la semaine du milieu uniquement (ex. "16 févr. – 22 févr."). */
function formatWeekRangeLabel(referenceMonday: Date, locale: string): string {
  const startMonday = new Date(referenceMonday)
  const endSunday = new Date(referenceMonday)
  endSunday.setDate(endSunday.getDate() + 6)
  const startLabel = formatShortDate(startMonday, locale)
  const endLabel = formatShortDate(endSunday, locale)
  return `${startLabel} – ${endLabel}`
}

/** Dernier jour (dimanche) de la semaine précédente par rapport à referenceMonday. */
function getPreviousWeekLastDay(referenceMonday: Date): Date {
  const d = new Date(referenceMonday)
  d.setDate(d.getDate() - 1)
  return d
}

/** Premier jour (lundi) de la semaine suivante par rapport à referenceMonday. */
function getNextWeekFirstDay(referenceMonday: Date): Date {
  const d = new Date(referenceMonday)
  d.setDate(d.getDate() + 7)
  return d
}

/** Retourne le lundi de la première et de la dernière des 3 semaines affichées. */
function getThreeWeekMondays(referenceMonday: Date): { start: string; end: string } {
  const first = new Date(referenceMonday)
  first.setDate(first.getDate() - 7)
  const last = new Date(referenceMonday)
  last.setDate(last.getDate() + 7)
  return { start: toDateStr(first), end: toDateStr(last) }
}

type CalendarViewWithNavigationProps = {
  athleteId: string
  athleteEmail: string
  initialWorkouts: Workout[]
  initialImportedActivities?: ImportedActivity[]
  initialWeeklyTotals?: ImportedActivityWeeklyTotal[]
  initialWorkoutTotals?: WorkoutWeeklyTotal[]
  initialAvailabilities?: AthleteAvailabilitySlot[]
  goals?: Goal[]
  canEdit: boolean
  /** Vue athlète (son propre calendrier) : modale "Mon entrainement" */
  athleteView?: boolean
  pathToRevalidate: string
  /** Titre affiché à gauche de la barre (ex. "Calendrier d'entraînement — email"). Même niveau que le sélecteur de semaine. */
  title?: React.ReactNode
  /** Si fourni, le sélecteur de semaine sera rendu via cette fonction au lieu d'être dans le composant */
  renderWeekSelector?: (props: {
    dateRangeLabel: string
    onNavigate: (offset: number) => void
    isAnimating: boolean
    /** Dernier jour de la 1ère semaine (ex. "9 févr.") pour le chevron gauche */
    prevWeekLastDayLabel: string
    /** Premier jour de la 3e semaine (ex. "23 févr.") pour le chevron droit */
    nextWeekFirstDayLabel: string
  }) => React.ReactNode
  /** Si true, n'affiche pas le sélecteur intégré (utilisé avec renderWeekSelector) */
  hideBuiltInSelector?: boolean
  /** Si true, désactive le scroll du contenu du calendrier (pour permettre un layout avec contenu scrollable en dessous) */
  disableContentScroll?: boolean
  /** Contenu à afficher après le calendrier dans la même zone scrollable */
  renderAfterCalendar?: () => React.ReactNode
}

/** Retourne le lundi d'une semaine donnée (offset par rapport à referenceMonday). */
function getWeekMondayByOffset(referenceMonday: Date, offset: number): Date {
  const monday = new Date(referenceMonday)
  monday.setDate(monday.getDate() + offset * 7)
  return monday
}

/** Retourne la plage de dates pour une semaine donnée (lundi à dimanche). */
function getWeekDateRange(weekMonday: Date): { start: string; end: string } {
  const start = new Date(weekMonday)
  const end = new Date(weekMonday)
  end.setDate(end.getDate() + 6)
  return { start: toDateStr(start), end: toDateStr(end) }
}

/** Retourne la plage initiale de 5 semaines (S-2 à S+2). */
function getInitialFiveWeekRange(referenceMonday: Date): { start: string; end: string } {
  const startMonday = getWeekMondayByOffset(referenceMonday, -2)
  const endDay = getWeekMondayByOffset(referenceMonday, 2)
  endDay.setDate(endDay.getDate() + 6)
  return { start: toDateStr(startMonday), end: toDateStr(endDay) }
}

export function CalendarViewWithNavigation({
  athleteId,
  athleteEmail,
  initialWorkouts,
  initialImportedActivities = [],
  initialWeeklyTotals = [],
  initialWorkoutTotals = [],
  initialAvailabilities = [],
  goals = [],
  canEdit,
  athleteView = false,
  pathToRevalidate,
  title,
  renderWeekSelector,
  hideBuiltInSelector = false,
  disableContentScroll = false,
  renderAfterCalendar,
}: CalendarViewWithNavigationProps) {
  const locale = useLocale()
  const tCalendar = useTranslations('calendar')
  const today = new Date()
  const currentMonday = getWeekMonday(today)
  const [referenceMonday, setReferenceMonday] = useState<Date>(currentMonday)
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [importedActivities, setImportedActivities] = useState<ImportedActivity[]>(initialImportedActivities)
  const [weeklyTotals, setWeeklyTotals] = useState<ImportedActivityWeeklyTotal[]>(initialWeeklyTotals)
  const [workoutTotals, setWorkoutTotals] = useState<WorkoutWeeklyTotal[]>(initialWorkoutTotals)
  const [availabilities, setAvailabilities] = useState<AthleteAvailabilitySlot[]>(initialAvailabilities)
  const [loading, setLoading] = useState(false)
  // Tracker les semaines déjà chargées (set de lundis en string)
  // Utiliser useRef pour éviter les re-renders inutiles
  const loadedWeeksRef = useRef<Set<string>>((() => {
    const initialSet = new Set<string>()
    // Initialement, on charge S-2, S-1, S, S+1, S+2
    for (let offset = -2; offset <= 2; offset++) {
      const weekMonday = getWeekMondayByOffset(currentMonday, offset)
      initialSet.add(toDateStr(weekMonday))
    }
    return initialSet
  })())
  // Garder les données précédentes pendant le chargement/animation pour éviter le flickering
  const stableWeeklyTotalsRef = useRef<ImportedActivityWeeklyTotal[]>(initialWeeklyTotals)
  const stableWorkoutTotalsRef = useRef<WorkoutWeeklyTotal[]>(initialWorkoutTotals)
  const stableWorkoutsRef = useRef<Workout[]>(initialWorkouts)

  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const [slideEnd, setSlideEnd] = useState(false)
  const animatingRef = useRef(false)
  const [isPending, startTransition] = useTransition()

  // Après router.refresh(), réinjecter les données serveur quand le contenu change. La clé inclut updated_at
  // pour que les modifications d'un entraînement (ex. durée) déclenchent bien la resync.
  const workoutsFingerprint = initialWorkouts.map((w) => w.updated_at).join('|')
  const importedFingerprint = initialImportedActivities.map((a) => (a as { updated_at?: string }).updated_at ?? a.id).join('|')
  const serverDataKey = `${initialWorkouts.length}-${workoutsFingerprint}|${initialImportedActivities.length}-${importedFingerprint}`
  const weeklyTotalsKey = initialWeeklyTotals.map((t) => `${t.week_start}-${t.sport_type}-${t.total_moving_time_seconds}`).join('|')
  const availabilitiesKey = initialAvailabilities.map((a) => a.id).join('|')
  useEffect(() => {
    setWorkouts(initialWorkouts)
    stableWorkoutsRef.current = initialWorkouts
    setImportedActivities(initialImportedActivities)
    setWeeklyTotals(initialWeeklyTotals)
    stableWeeklyTotalsRef.current = initialWeeklyTotals
    setWorkoutTotals(initialWorkoutTotals)
    stableWorkoutTotalsRef.current = initialWorkoutTotals
    setAvailabilities(initialAvailabilities)
    // Dépendances volontairement limitées à une clé pour éviter boucle et taille de tableau variable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDataKey, weeklyTotalsKey, availabilitiesKey])

  // Chargement initial : 5 semaines (S-2 à S+2)
  useEffect(() => {
    // Si on a déjà des données initiales, on considère que les 5 semaines sont chargées
    if (initialWorkouts.length > 0 || initialWeeklyTotals.length > 0) {
      // Les semaines sont déjà marquées comme chargées dans l'initialisation de loadedWeeks
      return
    }
    
    const initialRange = getInitialFiveWeekRange(currentMonday)
    const lastMondayStr = toDateStr(getWeekMondayByOffset(currentMonday, 2))
    let cancelled = false

    const loadInitialData = async () => {
      const [workoutsResult, importedResult, workoutTotalsResult, totalsResult, availabilitiesResult] = await Promise.all([
        getWorkoutsForDateRange(athleteId, initialRange.start, initialRange.end),
        getImportedActivitiesForDateRange(athleteId, initialRange.start, initialRange.end),
        getWorkoutWeeklyTotals(athleteId, initialRange.start, lastMondayStr),
        getEffectiveWeeklyTotalsFait(athleteId, initialRange.start, lastMondayStr),
        getAvailabilityForDateRange(athleteId, initialRange.start, initialRange.end),
      ])
      
      if (cancelled) return
      
      startTransition(() => {
        if (!workoutsResult.error && workoutsResult.workouts) {
          setWorkouts(workoutsResult.workouts as Workout[])
          stableWorkoutsRef.current = workoutsResult.workouts as Workout[]
        }
        if (!importedResult.error && importedResult.importedActivities) {
          setImportedActivities(importedResult.importedActivities as ImportedActivity[])
        }
        if (!totalsResult.error && totalsResult.weeklyTotals) {
          setWeeklyTotals(totalsResult.weeklyTotals)
          stableWeeklyTotalsRef.current = totalsResult.weeklyTotals
        }
        if (!workoutTotalsResult.error && workoutTotalsResult.workoutTotals) {
          setWorkoutTotals(workoutTotalsResult.workoutTotals as WorkoutWeeklyTotal[])
          stableWorkoutTotalsRef.current = workoutTotalsResult.workoutTotals as WorkoutWeeklyTotal[]
        }
        if (Array.isArray(availabilitiesResult)) {
          setAvailabilities(availabilitiesResult)
        }
        
        // Marquer les 5 semaines initiales comme chargées
        for (let offset = -2; offset <= 2; offset++) {
          const weekMonday = getWeekMondayByOffset(currentMonday, offset)
          loadedWeeksRef.current.add(toDateStr(weekMonday))
        }
      })
    }
    
    loadInitialData()
    
    return () => {
      cancelled = true
    }
  }, [athleteId]) // Seulement au montage ou si athleteId change

  // Chargement paginé lors de la navigation
  useEffect(() => {
    // Vérifier quelles semaines doivent être chargées (S-2, S-1, S, S+1, S+2)
    const requiredWeeks: string[] = []
    for (let offset = -2; offset <= 2; offset++) {
      const weekMonday = getWeekMondayByOffset(referenceMonday, offset)
      requiredWeeks.push(toDateStr(weekMonday))
    }
    
    // Trouver les semaines manquantes
    const missingWeeks = requiredWeeks.filter(weekStr => !loadedWeeksRef.current.has(weekStr))
    
    if (missingWeeks.length === 0) {
      // Toutes les semaines nécessaires sont déjà chargées
      return
    }

    // Charger uniquement les semaines manquantes (workouts, activités et totaux en une seule fois)
    const loadMissingWeeks = async () => {
      const weekRanges = missingWeeks.map(weekStr => {
        const weekDate = new Date(weekStr + 'T12:00:00')
        return getWeekDateRange(weekDate)
      })
      
      const earliestStart = weekRanges.reduce((min, r) => r.start < min ? r.start : min, weekRanges[0].start)
      const latestEnd = weekRanges.reduce((max, r) => r.end > max ? r.end : max, weekRanges[0].end)
      const startMonday = toDateStr(getWeekMonday(earliestStart))
      const endMonday = toDateStr(getWeekMonday(latestEnd))

      const [workoutsResult, importedResult, workoutTotalsResult, totalsResult, availabilitiesResult] = await Promise.all([
        getWorkoutsForDateRange(athleteId, earliestStart, latestEnd),
        getImportedActivitiesForDateRange(athleteId, earliestStart, latestEnd),
        getWorkoutWeeklyTotals(athleteId, startMonday, endMonday),
        getEffectiveWeeklyTotalsFait(athleteId, startMonday, endMonday),
        getAvailabilityForDateRange(athleteId, earliestStart, latestEnd),
      ])
      
      startTransition(() => {
        // Fusionner les nouvelles données avec les existantes
        if (Array.isArray(availabilitiesResult)) {
          setAvailabilities(prev => {
            const map = new Map(prev.map(a => [a.id, a]))
            availabilitiesResult.forEach(a => map.set(a.id, a))
            return Array.from(map.values())
          })
        }
        if (!workoutsResult.error && workoutsResult.workouts) {
          const newWorkouts = workoutsResult.workouts as Workout[]
          setWorkouts(prev => {
            const workoutMap = new Map<string, Workout>()
            prev.forEach(w => workoutMap.set(w.id, w))
            newWorkouts.forEach(w => workoutMap.set(w.id, w))
            const merged = Array.from(workoutMap.values())
            stableWorkoutsRef.current = merged
            return merged
          })
        }
        if (!importedResult.error && importedResult.importedActivities) {
          const newImported = importedResult.importedActivities as ImportedActivity[]
          setImportedActivities(prev => {
            const importedMap = new Map<string, ImportedActivity>()
            prev.forEach(a => importedMap.set(a.id, a))
            newImported.forEach(a => importedMap.set(a.id, a))
            return Array.from(importedMap.values())
          })
        }
        if (!totalsResult.error && totalsResult.weeklyTotals) {
          const newTotals = totalsResult.weeklyTotals as ImportedActivityWeeklyTotal[]
          setWeeklyTotals(prev => {
            const existingMap = new Map(prev.map(t => [`${t.week_start}-${t.sport_type}`, t]))
            newTotals.forEach(t => {
              existingMap.set(`${t.week_start}-${t.sport_type}`, t)
            })
            const merged = Array.from(existingMap.values())
            stableWeeklyTotalsRef.current = merged
            return merged
          })
        }
        if (!workoutTotalsResult.error && workoutTotalsResult.workoutTotals) {
          const newTotals = workoutTotalsResult.workoutTotals as WorkoutWeeklyTotal[]
          setWorkoutTotals(prev => {
            const existingMap = new Map(prev.map(t => [`${t.week_start}-${t.sport_type}`, t]))
            newTotals.forEach(t => {
              existingMap.set(`${t.week_start}-${t.sport_type}`, t)
            })
            const merged = Array.from(existingMap.values())
            stableWorkoutTotalsRef.current = merged
            return merged
          })
        }
        
        // Marquer les semaines comme chargées
        missingWeeks.forEach(weekStr => loadedWeeksRef.current.add(weekStr))
      })
    }

    loadMissingWeeks()
  }, [referenceMonday, athleteId])

  const refetchWorkoutsAfterSave = useCallback(async (updatedWorkout?: Workout) => {
    if (updatedWorkout) {
      startTransition(() => {
        setWorkouts(prev => {
          const map = new Map(prev.map(w => [w.id, w]))
          map.set(updatedWorkout.id, updatedWorkout)
          const merged = Array.from(map.values())
          stableWorkoutsRef.current = merged
          return merged
        })
      })
      const { start, end } = getInitialFiveWeekRange(referenceMonday)
      const workoutTotalsResult = await getWorkoutWeeklyTotals(athleteId, start, end)
      if (!workoutTotalsResult.error && workoutTotalsResult.workoutTotals) {
        startTransition(() => {
          const fresh = workoutTotalsResult.workoutTotals as WorkoutWeeklyTotal[]
          setWorkoutTotals(fresh)
          stableWorkoutTotalsRef.current = fresh
        })
      }
      return
    }
    const { start, end } = getInitialFiveWeekRange(referenceMonday)
    const [workoutsResult, workoutTotalsResult] = await Promise.all([
      getWorkoutsForDateRange(athleteId, start, end),
      getWorkoutWeeklyTotals(athleteId, start, end),
    ])
    startTransition(() => {
      if (!workoutsResult.error && workoutsResult.workouts) {
        const fresh = workoutsResult.workouts as Workout[]
        setWorkouts(fresh)
        stableWorkoutsRef.current = fresh
      }
      if (!workoutTotalsResult.error && workoutTotalsResult.workoutTotals) {
        const fresh = workoutTotalsResult.workoutTotals as WorkoutWeeklyTotal[]
        setWorkoutTotals(fresh)
        stableWorkoutTotalsRef.current = fresh
      }
    })
  }, [referenceMonday, athleteId])

  const refetchAvailabilitiesAfterSave = useCallback(async () => {
    const { start, end } = getInitialFiveWeekRange(referenceMonday)
    const slots = await getAvailabilityForDateRange(athleteId, start, end)
    startTransition(() => setAvailabilities(slots))
  }, [referenceMonday, athleteId])

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

  const dateRangeLabel = formatWeekRangeLabel(referenceMonday, locale)

  // Suivant = semaines plus tard = le calendrier « remonte » (nouveau contenu vient du bas et monte)
  // Précédent = semaines plus tôt = le calendrier « descend » (nouveau contenu vient du haut et descend)
  const getTransform = (): string => {
    if (!isAnimating) return 'translateY(0)'
    if (!slideEnd) {
      return slideDirection === 'next' ? `translateY(${SLIDE_PX}px)` : `translateY(-${SLIDE_PX}px)`
    }
    return 'translateY(0)'
  }

  const weekSelectorProps = {
    dateRangeLabel,
    onNavigate: handleNavigate,
    isAnimating,
    prevWeekLastDayLabel: formatShortDate(getPreviousWeekLastDay(referenceMonday), locale),
    nextWeekFirstDayLabel: formatShortDate(getNextWeekFirstDay(referenceMonday), locale),
  }

  return (
    <div className={`${disableContentScroll ? 'flex-auto' : 'flex-1'} flex flex-col ${disableContentScroll ? 'min-h-0' : 'h-full'} min-w-0 overflow-hidden`}>
      {renderWeekSelector ? (
        <>
          {renderWeekSelector(weekSelectorProps)}
          <div className="flex-1 overflow-auto min-w-0 px-6 lg:px-8 py-6">
            <div className="min-w-0 overflow-x-auto overflow-y-hidden">
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
                  workouts={isAnimating ? stableWorkoutsRef.current : workouts}
                  importedActivities={importedActivities}
                  weeklyTotals={isAnimating ? stableWeeklyTotalsRef.current : weeklyTotals}
                  workoutTotals={isAnimating ? stableWorkoutTotalsRef.current : workoutTotals}
                  goals={goals}
                  availabilities={availabilities}
                  canEdit={canEdit}
                  athleteView={athleteView}
                  pathToRevalidate={pathToRevalidate}
                  referenceMonday={referenceMonday}
                  onNavigate={handleNavigate}
                  onWorkoutSaved={refetchWorkoutsAfterSave}
                  onAvailabilitySaved={refetchAvailabilitiesAfterSave}
                />
              </div>
            </div>
            {renderAfterCalendar && (
              <div className="mt-6">
                {renderAfterCalendar()}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {!hideBuiltInSelector && (
            <div className="flex items-center justify-between w-full pb-2 mb-0 flex-wrap gap-2">
              {title != null ? <div className="flex-1 min-w-0">{title}</div> : <div className="flex-1" />}
              <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-lg shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleNavigate(-1)}
                  disabled={isAnimating}
                  className="p-1.5 min-h-10 hover:bg-white hover:text-palette-forest-dark text-stone-500 flex items-center gap-1.5"
                  aria-label={tCalendar('previousWeekButton')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-7-7 7-7" />
                  </svg>
                  <span className="text-xs text-stone-600 whitespace-nowrap">
                    {formatShortDate(getPreviousWeekLastDay(referenceMonday), locale)}
                  </span>
                </Button>
                <span className="text-sm font-semibold text-stone-700 px-2 w-[200px] text-center shrink-0">
                  {dateRangeLabel}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleNavigate(1)}
                  disabled={isAnimating}
                  className="p-1.5 min-h-10 hover:bg-white hover:text-palette-forest-dark text-stone-500 flex items-center gap-1.5"
                  aria-label={tCalendar('nextWeekButton')}
                >
                  <span className="text-xs text-stone-600 whitespace-nowrap">
                    {formatShortDate(getNextWeekFirstDay(referenceMonday), locale)}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          <div className="min-w-0 overflow-x-auto overflow-y-hidden">
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
            workouts={isAnimating ? stableWorkoutsRef.current : workouts}
            importedActivities={importedActivities}
            weeklyTotals={isAnimating ? stableWeeklyTotalsRef.current : weeklyTotals}
            workoutTotals={isAnimating ? stableWorkoutTotalsRef.current : workoutTotals}
            goals={goals}
            availabilities={availabilities}
            canEdit={canEdit}
            athleteView={athleteView}
            pathToRevalidate={pathToRevalidate}
            referenceMonday={referenceMonday}
            onNavigate={handleNavigate}
            onWorkoutSaved={refetchWorkoutsAfterSave}
            onAvailabilitySaved={refetchAvailabilitiesAfterSave}
          />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
