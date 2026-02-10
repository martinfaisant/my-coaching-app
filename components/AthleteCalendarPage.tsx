'use client'

import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import type { Workout, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'

type AthleteCalendarPageProps = {
  athleteId: string
  athleteEmail: string
  initialWorkouts: Workout[]
  initialImportedActivities?: ImportedActivity[]
  initialWeeklyTotals?: ImportedActivityWeeklyTotal[]
  initialWorkoutTotals?: WorkoutWeeklyTotal[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
}

export function AthleteCalendarPage({
  athleteId,
  athleteEmail,
  initialWorkouts,
  initialImportedActivities = [],
  initialWeeklyTotals = [],
  initialWorkoutTotals = [],
  goals = [],
  canEdit,
  pathToRevalidate,
}: AthleteCalendarPageProps) {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <CalendarViewWithNavigation
        athleteId={athleteId}
        athleteEmail={athleteEmail}
        initialWorkouts={initialWorkouts}
        initialImportedActivities={initialImportedActivities}
        initialWeeklyTotals={initialWeeklyTotals}
        initialWorkoutTotals={initialWorkoutTotals}
        goals={goals}
        canEdit={canEdit}
        athleteView={true}
        pathToRevalidate={pathToRevalidate}
        hideBuiltInSelector={true}
        renderWeekSelector={({ dateRangeLabel, onNavigate, isAnimating }) => (
          <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
            <div>
              <h1 className="text-xl font-bold text-stone-800">Mon calendrier</h1>
            </div>
            <WeekSelector dateRangeLabel={dateRangeLabel} onNavigate={onNavigate} isAnimating={isAnimating} />
          </header>
        )}
      />
    </main>
  )
}
