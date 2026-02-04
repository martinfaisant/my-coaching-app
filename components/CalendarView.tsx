'use client'

import { useState, useMemo } from 'react'
import { WorkoutModal } from './WorkoutModal'
import type { Workout, SportType, Goal } from '@/types/database'

const SPORT_LABELS: Record<SportType, string> = {
  course: 'Course',
  musculation: 'Musculation',
  natation: 'Natation',
  velo: 'Vélo',
}

const SPORT_COLORS: Record<
  SportType,
  { bg: string; border: string; text: string; comment: string }
> = {
  course: {
    bg: 'bg-palette-gold/20',
    border: 'border-palette-gold/40',
    text: 'text-palette-forest-dark',
    comment: 'text-palette-olive',
  },
  musculation: {
    bg: 'bg-palette-amber/20',
    border: 'border-palette-amber/40',
    text: 'text-palette-forest-dark',
    comment: 'text-palette-olive',
  },
  natation: {
    bg: 'bg-palette-sage/20',
    border: 'border-palette-sage/40',
    text: 'text-palette-forest-dark',
    comment: 'text-palette-olive',
  },
  velo: {
    bg: 'bg-palette-olive/20',
    border: 'border-palette-olive/40',
    text: 'text-palette-forest-dark',
    comment: 'text-palette-olive',
  },
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Date au format YYYY-MM-DD en heure locale (évite le décalage UTC). */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type CalendarViewProps = {
  athleteId: string
  athleteEmail: string
  workouts: Workout[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
  referenceMonday?: Date
  onNavigate?: (weeksOffset: number) => void
  /** Quand true, le titre de la première semaine n'est pas affiché (il est dans la barre de navigation). */
  hideFirstWeekTitle?: boolean
}

/** Icône cible avec badge 1 (objectif principal) ou 2 (secondaire). */
function GoalTargetBadge({ isPrimary }: { isPrimary: boolean }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" title={isPrimary ? 'Objectif principal' : 'Objectif secondaire'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-palette-forest-dark">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
      <span className="ml-0.5 text-[10px] font-bold text-palette-forest-dark leading-none">{isPrimary ? '1' : '2'}</span>
    </span>
  )
}

export function CalendarView({
  athleteId,
  workouts,
  goals = [],
  canEdit,
  pathToRevalidate,
  referenceMonday,
  onNavigate,
  hideFirstWeekTitle = false,
}: CalendarViewProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>('')
  const [modalWorkout, setModalWorkout] = useState<Workout | null>(null)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const openGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setGoalModalOpen(true)
  }

  const { startMonday, weeks } = useMemo(() => {
    const today = new Date()
    const baseMonday = referenceMonday ? getWeekMonday(referenceMonday) : getWeekMonday(today)
    const startMonday = new Date(baseMonday)
    startMonday.setDate(startMonday.getDate() - 7)

    const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    const weeks: { label: string; monthLabel: string; days: { dateStr: string; label: string; dayName: string; isToday: boolean; isPast: boolean }[] }[] = []
    
    const todayMonday = getWeekMonday(today)

    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(startMonday)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const weekMonday = getWeekMonday(weekStart)
      const monthLabel = MONTHS_FR[weekStart.getMonth()]
      
      let weekLabel = ''
      if (weekMonday.getTime() === todayMonday.getTime()) {
        weekLabel = 'Semaine actuelle'
      } else if (weekMonday.getTime() < todayMonday.getTime()) {
        const diffWeeks = Math.round((todayMonday.getTime() - weekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (diffWeeks === 1) {
          weekLabel = 'Semaine précédente'
        } else {
          weekLabel = `Il y a ${diffWeeks} semaines`
        }
      } else {
        const diffWeeks = Math.round((weekMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (diffWeeks === 1) {
          weekLabel = 'Semaine suivante'
        } else {
          weekLabel = `Dans ${diffWeeks} semaines`
        }
      }
      
      const days: { dateStr: string; label: string; dayName: string; isToday: boolean; isPast: boolean }[] = []
      const todayStr = toDateStr(today)
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const dateStr = toDateStr(day)
        const isToday = todayStr === dateStr
        const isPast = dateStr < todayStr
        const dayIndex = (day.getDay() + 6) % 7
        days.push({
          dateStr,
          label: day.getDate().toString(),
          dayName: DAY_NAMES[dayIndex],
          isToday,
          isPast,
        })
      }
      weeks.push({ label: weekLabel, monthLabel, days })
    }

    return { startMonday, weeks }
  }, [referenceMonday])

  const workoutsByDate = useMemo(() => {
    const map: Record<string, Workout[]> = {}
    for (const w of workouts) {
      if (!map[w.date]) map[w.date] = []
      map[w.date].push(w)
    }
    return map
  }, [workouts])

  const goalsByDate = useMemo(() => {
    const map: Record<string, Goal[]> = {}
    for (const g of goals) {
      if (!map[g.date]) map[g.date] = []
      map[g.date].push(g)
    }
    return map
  }, [goals])

  const openDay = (dateStr: string, isPast: boolean) => {
    if (!canEdit || isPast) return
    setModalDate(dateStr)
    setModalWorkout(null)
    setModalOpen(true)
  }

  const openWorkout = (dateStr: string, workout: Workout) => {
    setModalDate(dateStr)
    setModalWorkout(workout)
    setModalOpen(true)
  }

  return (
    <>
      <div className="mt-0 space-y-8">
        {weeks.map((week, wi) => (
          <section key={wi} className={hideFirstWeekTitle && wi === 0 ? 'mt-1' : undefined}>
            {!(hideFirstWeekTitle && wi === 0) && (
              <h3 className="text-sm font-semibold text-stone-600 mb-3">
                {week.label}
                <span className="font-normal text-stone-500 ml-1.5">
                  — {week.monthLabel}
                </span>
              </h3>
            )}
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day) => (
                <div
                  key={`header-${day.dateStr}`}
                  className={`text-center text-xs font-medium py-1 ${
                    day.isToday
                      ? 'text-palette-forest-dark font-semibold'
                      : 'text-stone-500'
                  }`}
                >
                  {day.dayName} {day.label}
                </div>
              ))}
              {week.days.map((day) => {
                const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                const dayGoals = goalsByDate[day.dateStr] ?? []
                const canAddWorkout = canEdit && !day.isPast && dayWorkouts.length === 0
                const isCellClickable = canEdit && (!day.isPast || dayWorkouts.length > 0)
                const hasContent = dayWorkouts.length > 0 || dayGoals.length > 0
                const showCenteredPlus = canAddWorkout && !hasContent
                return (
                  <div
                    key={day.dateStr}
                    className={`min-h-[120px] rounded-xl border p-2 relative flex flex-col ${
                      day.isToday
                        ? 'z-10 ring-2 ring-palette-olive ring-offset-2 border-palette-olive bg-palette-olive/10 shadow-lg'
                        : 'border-stone-200 bg-white'
                    } ${isCellClickable ? 'cursor-pointer hover:bg-stone-50' : ''}`}
                    onClick={() => openDay(day.dateStr, day.isPast)}
                    role={isCellClickable ? 'button' : undefined}
                    tabIndex={isCellClickable ? 0 : undefined}
                    onKeyDown={
                      isCellClickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openDay(day.dateStr, day.isPast)
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex flex-col flex-1 min-h-0">
                      {!showCenteredPlus && (
                        <div className="flex flex-col gap-1 shrink-0">
                          {dayGoals.map((g) => (
                            <div
                              key={g.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                openGoal(g)
                              }}
                              className="rounded-lg px-2 py-1.5 text-xs border bg-palette-sage/15 border-palette-sage/50 text-palette-forest-dark flex items-start gap-1.5 shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-palette-sage/60 transition-shadow"
                              title={g.is_primary ? 'Objectif principal' : 'Objectif secondaire'}
                              role="button"
                            >
                              <GoalTargetBadge isPrimary={g.is_primary} />
                              <span className="flex-1 min-w-0 overflow-hidden">
                                <span className="font-medium truncate block">{g.race_name}</span>
                                <span className="text-stone-600 truncate block">{g.distance}</span>
                              </span>
                            </div>
                          ))}
                          {dayWorkouts.map((w) => {
                            const colors = SPORT_COLORS[w.sport_type]
                            return (
                              <div
                                key={w.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openWorkout(day.dateStr, w)
                                }}
                                className={`rounded-lg px-2 py-1.5 text-xs border shrink-0 ${
                                  canEdit
                                    ? 'cursor-pointer hover:ring-2 hover:ring-palette-olive'
                                    : ''
                                } ${colors.bg} ${colors.border} ${colors.text}`}
                                role={canEdit ? 'button' : undefined}
                              >
                                <span className="font-medium">{SPORT_LABELS[w.sport_type]}</span>
                                <span className="ml-1 truncate block">{w.title}</span>
                                {(w.athlete_comment ?? null) && (
                                  <span className={`mt-0.5 block truncate italic ${colors.comment}`}>
                                    💬 {w.athlete_comment}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {canAddWorkout && !showCenteredPlus && (
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                          <span className="text-2xl font-light text-stone-400" aria-hidden>
                            +
                          </span>
                        </div>
                      )}
                      {showCenteredPlus && (
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                          <span className="text-2xl font-light text-stone-400" aria-hidden>
                            +
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <WorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={modalDate}
        athleteId={athleteId}
        pathToRevalidate={pathToRevalidate}
        canEdit={canEdit}
        workout={modalWorkout}
      />

      {goalModalOpen && selectedGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-modal-title"
        >
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setGoalModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-xl border-2 border-palette-forest-dark bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 id="goal-modal-title" className="text-lg font-semibold text-stone-900">
                Détails de l&apos;objectif
              </h2>
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-500 font-medium">Date</dt>
                <dd className="mt-0.5 text-stone-900">
                  {new Date(selectedGoal.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Nom de la course</dt>
                <dd className="mt-0.5 text-stone-900">{selectedGoal.race_name}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Distance</dt>
                <dd className="mt-0.5 text-stone-900">{selectedGoal.distance}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Type d&apos;objectif</dt>
                <dd className="mt-0.5 flex items-center gap-1.5">
                  <GoalTargetBadge isPrimary={selectedGoal.is_primary} />
                  <span className="text-stone-900">{selectedGoal.is_primary ? 'Objectif principal' : 'Objectif secondaire'}</span>
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="rounded-lg border-2 border-palette-forest-dark px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
