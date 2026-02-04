'use client'

import { useState, useMemo } from 'react'
import { WorkoutModal } from './WorkoutModal'
import type { Workout, SportType } from '@/types/database'

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
  canEdit: boolean
  pathToRevalidate: string
}

export function CalendarView({
  athleteId,
  workouts,
  canEdit,
  pathToRevalidate,
}: CalendarViewProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>('')
  const [modalWorkout, setModalWorkout] = useState<Workout | null>(null)

  const { startMonday, weeks } = useMemo(() => {
    const today = new Date()
    const currentMonday = getWeekMonday(today)
    const startMonday = new Date(currentMonday)
    startMonday.setDate(startMonday.getDate() - 7)

    const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    const weeks: { label: string; monthLabel: string; days: { dateStr: string; label: string; dayName: string; isToday: boolean; isPast: boolean }[] }[] = []
    const weekLabels = ['Semaine précédente', 'Semaine actuelle', 'Semaine suivante']

    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(startMonday)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const monthLabel = MONTHS_FR[weekStart.getMonth()]
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
      weeks.push({ label: weekLabels[w], monthLabel, days })
    }

    return { startMonday, weeks }
  }, [])

  const workoutsByDate = useMemo(() => {
    const map: Record<string, Workout[]> = {}
    for (const w of workouts) {
      if (!map[w.date]) map[w.date] = []
      map[w.date].push(w)
    }
    return map
  }, [workouts])

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
      <div className="mt-8 space-y-8">
        {weeks.map((week, wi) => (
          <section key={wi}>
            <h3 className="text-sm font-semibold text-stone-600text-stone-400 mb-3">
              {week.label}
              <span className="font-normal text-stone-500text-stone-500 ml-1.5">
                — {week.monthLabel}
              </span>
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day) => (
                <div
                  key={`header-${day.dateStr}`}
                  className={`text-center text-xs font-medium py-1 ${
                    day.isToday
                      ? 'text-amber-600text-amber-400 font-semibold'
                      : 'text-stone-500'
                  }`}
                >
                  {day.dayName} {day.label}
                </div>
              ))}
              {week.days.map((day) => {
                const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                const canAddWorkout = canEdit && !day.isPast && dayWorkouts.length === 0
                const isCellClickable = canEdit && (!day.isPast || dayWorkouts.length > 0)
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
                    <div className={`space-y-1 flex flex-col flex-1 min-h-0 ${canAddWorkout ? 'items-center justify-center' : canEdit && dayWorkouts.length === 0 ? 'items-center justify-center' : ''}`}>
                      {canAddWorkout && (
                        <span className="text-2xl font-light text-stone-300text-stone-600" aria-hidden>
                          +
                        </span>
                      )}
                      {dayWorkouts.map((w) => {
                        const colors = SPORT_COLORS[w.sport_type]
                        return (
                          <div
                            key={w.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              openWorkout(day.dateStr, w)
                            }}
                            className={`rounded-lg px-2 py-1.5 text-xs border ${
                              canEdit
                                ? 'cursor-pointer hover:ring-2 hover:ring-stone-400hover:ring-stone-500'
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
    </>
  )
}
