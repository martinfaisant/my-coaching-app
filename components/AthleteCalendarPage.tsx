'use client'

import { useTranslations } from 'next-intl'
import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import type { Workout, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal, AthleteAvailabilitySlot } from '@/types/database'

type AthleteCalendarPageProps = {
  athleteId: string
  athleteEmail: string
  initialWorkouts: Workout[]
  initialImportedActivities?: ImportedActivity[]
  initialWeeklyTotals?: ImportedActivityWeeklyTotal[]
  initialWorkoutTotals?: WorkoutWeeklyTotal[]
  initialAvailabilities?: AthleteAvailabilitySlot[]
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
  initialAvailabilities = [],
  goals = [],
  canEdit,
  pathToRevalidate,
}: AthleteCalendarPageProps) {
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')

  return (
    <CalendarViewWithNavigation
        athleteId={athleteId}
        athleteEmail={athleteEmail}
        initialWorkouts={initialWorkouts}
        initialImportedActivities={initialImportedActivities}
        initialWeeklyTotals={initialWeeklyTotals}
        initialWorkoutTotals={initialWorkoutTotals}
        initialAvailabilities={initialAvailabilities}
        goals={goals}
        canEdit={canEdit}
        athleteView={true}
        pathToRevalidate={pathToRevalidate}
        hideBuiltInSelector={true}
        renderWeekSelector={({ dateRangeLabel, onNavigate, isAnimating, prevWeekLastDayLabel, nextWeekFirstDayLabel }) => (
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:h-20 px-4 md:px-6 lg:px-8 py-4 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
            <h1 className="flex items-center gap-2 text-xl font-bold text-stone-800 shrink-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-palette-forest-dark text-white shrink-0" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </span>
              {t('calendar')}
            </h1>
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
  )
}
