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

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
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

    const weeks: { label: string; days: { dateStr: string; label: string; isToday: boolean }[] }[] = []
    const weekLabels = ['Semaine précédente', 'Semaine actuelle', 'Semaine suivante']

    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(startMonday)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const days: { dateStr: string; label: string; isToday: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const dateStr = toDateStr(day)
        const isToday = toDateStr(today) === dateStr
        days.push({
          dateStr,
          label: day.getDate().toString(),
          isToday,
        })
      }
      weeks.push({ label: weekLabels[w], days })
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

  const openDay = (dateStr: string) => {
    if (!canEdit) return
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
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
              {week.label}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {DAY_NAMES.map((name) => (
                <div
                  key={name}
                  className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1"
                >
                  {name}
                </div>
              ))}
              {week.days.map((day) => {
                const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                return (
                  <div
                    key={day.dateStr}
                    className={`min-h-[120px] rounded-xl border p-2 ${
                      day.isToday
                        ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800/50'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    } ${canEdit ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}
                    onClick={() => openDay(day.dateStr)}
                    role={canEdit ? 'button' : undefined}
                    tabIndex={canEdit ? 0 : undefined}
                    onKeyDown={
                      canEdit
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openDay(day.dateStr)
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {day.label}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayWorkouts.map((w) => (
                        <div
                          key={w.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            openWorkout(day.dateStr, w)
                          }}
                          className={`rounded-lg px-2 py-1.5 text-xs ${
                            canEdit
                              ? 'cursor-pointer hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-500'
                              : ''
                          } bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800`}
                          role={canEdit ? 'button' : undefined}
                        >
                          <span className="font-medium">{SPORT_LABELS[w.sport_type]}</span>
                          <span className="ml-1 truncate block">{w.title}</span>
                          {(w.athlete_comment ?? null) && (
                            <span className="mt-0.5 block truncate text-emerald-700 dark:text-emerald-300 italic">
                              💬 {w.athlete_comment}
                            </span>
                          )}
                        </div>
                      ))}
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
