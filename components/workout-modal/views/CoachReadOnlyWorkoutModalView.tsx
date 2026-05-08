'use client'

import type { useTranslations } from 'next-intl'

import type { Workout } from '@/types/database'
import { formatDateFr } from '@/lib/dateUtils'
import { WorkoutTargetActualCards } from '@/components/workout-modal/WorkoutTargetActualCards'
import { WorkoutFeedbackSummary } from '@/components/workout-modal/WorkoutFeedbackSummary'

type CoachReadOnlyWorkoutModalViewProps = {
  workout: Workout
  locale: string
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
}

export function CoachReadOnlyWorkoutModalView({
  workout,
  locale,
  tWorkouts,
}: CoachReadOnlyWorkoutModalViewProps) {
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
  const summaryLocale = locale === 'fr' ? 'fr' : 'en'
  const timeOfDayLabel = workout.time_of_day
    ? workout.time_of_day === 'morning'
      ? tWorkouts('form.timeOfDayMorning')
      : workout.time_of_day === 'noon'
        ? tWorkouts('form.timeOfDayNoon')
        : tWorkouts('form.timeOfDayEvening')
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 py-4 space-y-6">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {formatDateFr(workout.date, true, dateLocale)}
          {timeOfDayLabel ? ` · ${timeOfDayLabel}` : ''}
        </p>

        <WorkoutTargetActualCards
          workout={workout}
          athleteComment={workout.athlete_comment}
          locale={summaryLocale}
          tWorkouts={tWorkouts}
        />

        <WorkoutFeedbackSummary
          perceivedFeeling={workout.perceived_feeling}
          perceivedIntensity={workout.perceived_intensity}
          perceivedPleasure={workout.perceived_pleasure}
          tWorkouts={tWorkouts}
        />
      </div>
    </div>
  )
}
