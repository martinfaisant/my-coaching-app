'use client'

import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react'
import type { useTranslations } from 'next-intl'

import type {
  SportType,
  Workout,
  WorkoutPrimaryMetricBySport,
} from '@/types/database'
import { ClockIcon, LightningIcon, MountainIcon, RulerIcon } from '@/components/workout-modal/icons'
import { formatDateFr } from '@/lib/dateUtils'
import { getWorkoutPrimaryMetricForSport } from '@/lib/workoutPrimaryMetric'
import { workoutHasTimeDistanceTargets, workoutIsTimeOnlySport, workoutPaceIsRunningStyle } from '@/lib/sportsRegistry'

const FEELING_ICONS_READONLY = [Angry, Frown, Meh, Smile, Laugh] as const

type CoachReadOnlyWorkoutModalViewProps = {
  workout: Workout
  locale: string
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
  coachWorkoutPrimaryMetrics: WorkoutPrimaryMetricBySport | null
}

export function CoachReadOnlyWorkoutModalView({
  workout,
  locale,
  tWorkouts,
  coachWorkoutPrimaryMetrics,
}: CoachReadOnlyWorkoutModalViewProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 py-4 space-y-5">
        <p className="text-sm font-medium text-stone-600">
          {formatDateFr(workout.date, true, locale === 'fr' ? 'fr-FR' : 'en-US')}
          {workout.time_of_day
            ? ` · ${
                workout.time_of_day === 'morning'
                  ? tWorkouts('form.timeOfDayMorning')
                  : workout.time_of_day === 'noon'
                    ? tWorkouts('form.timeOfDayNoon')
                    : tWorkouts('form.timeOfDayEvening')
              }`
            : ''}
        </p>

        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            {(() => {
              const st = workout.sport_type as SportType
              if (!workoutHasTimeDistanceTargets(st)) {
                return workoutIsTimeOnlySport(st)
                  ? tWorkouts('form.sessionGoalsMandatoryTime')
                  : tWorkouts('form.sessionGoals')
              }
              const m = getWorkoutPrimaryMetricForSport(st, coachWorkoutPrimaryMetrics)
              return m === 'distance'
                ? tWorkouts('form.sessionGoalsMandatoryDistance')
                : tWorkouts('form.sessionGoalsMandatoryTime')
            })()}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm text-stone-700">
            {workout.target_duration_minutes != null && workout.target_duration_minutes > 0 && (
              <>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-stone-400" />
                  {workout.target_duration_minutes >= 60
                    ? `${Math.floor(workout.target_duration_minutes / 60)}h${String(workout.target_duration_minutes % 60).padStart(2, '0')}`
                    : `${workout.target_duration_minutes} min`}
                </span>
                {(workout.target_distance_km != null && workout.target_distance_km > 0) ||
                (workout.target_pace != null && workout.target_pace > 0) ||
                (workout.target_elevation_m != null && workout.target_elevation_m > 0) ? (
                  <span className="text-stone-300">·</span>
                ) : null}
              </>
            )}

            {workout.target_distance_km != null && workout.target_distance_km > 0 && (
              <>
                <span className="inline-flex items-center gap-1">
                  <RulerIcon className="h-4 w-4 text-stone-400" />
                  {workout.sport_type === 'natation'
                    ? `${Math.round(workout.target_distance_km * 1000)} m`
                    : `${Number(workout.target_distance_km) % 1 === 0 ? workout.target_distance_km : (workout.target_distance_km as number).toFixed(1)} km`}
                </span>
                {(workout.target_pace != null && workout.target_pace > 0) ||
                (workout.target_elevation_m != null && workout.target_elevation_m > 0) ? (
                  <span className="text-stone-300">·</span>
                ) : null}
              </>
            )}

            {workout.target_pace != null && workout.target_pace > 0 && (
              <>
                <span className="inline-flex items-center gap-1">
                  <LightningIcon className="h-4 w-4 text-stone-400" />
                  {workoutPaceIsRunningStyle(workout.sport_type)
                    ? `${workout.target_pace} ${tWorkouts('form.paceUnitRunning')}`
                    : workout.sport_type === 'velo'
                      ? `${Math.round(workout.target_pace)} ${tWorkouts('form.paceUnitCycling')}`
                      : workout.sport_type === 'natation'
                        ? `${workout.target_pace} ${tWorkouts('form.paceUnitSwimming')}`
                        : `${workout.target_pace}`}
                </span>
                {workout.target_elevation_m != null && workout.target_elevation_m > 0 ? (
                  <span className="text-stone-300">·</span>
                ) : null}
              </>
            )}

            {workout.target_elevation_m != null && workout.target_elevation_m > 0 && (
              <span className="inline-flex items-center gap-1">
                <MountainIcon className="h-4 w-4 text-stone-400" />
                {workout.target_elevation_m} m D+
              </span>
            )}
          </div>

          {workout.description?.trim() ? (
            <>
              <hr className="my-3 border-stone-200" />
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{workout.description.trim()}</p>
            </>
          ) : null}
        </div>

        {(workout.perceived_feeling != null ||
          workout.perceived_intensity != null ||
          workout.perceived_pleasure != null) && (
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              {tWorkouts('feedback.sectionTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                {workout.perceived_feeling != null &&
                workout.perceived_feeling >= 1 &&
                workout.perceived_feeling <= 5 ? (
                  <>
                    {(() => {
                      const Icon = FEELING_ICONS_READONLY[workout.perceived_feeling - 1]
                      return (
                        <Icon className="h-5 w-5 text-stone-600 shrink-0" strokeWidth={2} aria-hidden />
                      )
                    })()}
                    <span className="text-stone-700">
                      {tWorkouts(
                        `feedback.feelingScale.${workout.perceived_feeling}` as 'feedback.feelingScale.1'
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {workout.perceived_intensity != null &&
                workout.perceived_intensity >= 1 &&
                workout.perceived_intensity <= 10 ? (
                  <span className="text-stone-700">
                    {tWorkouts('feedback.intensityLabel')} {workout.perceived_intensity}/10
                  </span>
                ) : (
                  <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {workout.perceived_pleasure != null &&
                workout.perceived_pleasure >= 1 &&
                workout.perceived_pleasure <= 5 ? (
                  <>
                    {(() => {
                      const Icon = FEELING_ICONS_READONLY[workout.perceived_pleasure - 1]
                      return (
                        <Icon className="h-5 w-5 text-stone-600 shrink-0" strokeWidth={2} aria-hidden />
                      )
                    })()}
                    <span className="text-stone-700">
                      {tWorkouts(
                        `feedback.pleasureScale.${workout.perceived_pleasure}` as 'feedback.pleasureScale.1'
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-stone-200 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-200/80 rounded-full text-stone-600">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-900">{tWorkouts('comments.athleteComment')}</h3>
          </div>
          <p className="text-sm text-stone-600">
            {workout.athlete_comment?.trim() ? workout.athlete_comment : tWorkouts('comments.noComment')}
          </p>
        </div>
      </div>
    </div>
  )
}

