'use client'

import { useTranslations } from 'next-intl'
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
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')

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
        renderWeekSelector={({ dateRangeLabel, onNavigate, isAnimating, prevWeekLastDayLabel, nextWeekFirstDayLabel }) => (
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:h-20 px-4 md:px-6 lg:px-8 py-4 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
            <h1 className="text-xl font-bold text-stone-800 shrink-0">{t('calendar')}</h1>
            <div className="flex justify-center w-full md:w-auto md:flex-none">
              <WeekSelector
                dateRangeLabel={dateRangeLabel}
                onNavigate={onNavigate}
                isAnimating={isAnimating}
                prevWeekLastDayLabel={prevWeekLastDayLabel}
                nextWeekFirstDayLabel={nextWeekFirstDayLabel}
                prevWeekAriaLabel={tCommon('weekPrevious')}
                nextWeekAriaLabel={tCommon('weekNext')}
              />
            </div>
          </header>
        )}
      />
    </main>
  )
}
