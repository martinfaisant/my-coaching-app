'use client'

import { useMemo } from 'react'
import type { useTranslations } from 'next-intl'

import type { StatusCommentFormState } from '@/app/[locale]/dashboard/workouts/actions'
import { Button } from '@/components/Button'
import { Segments } from '@/components/Segments'
import { Textarea } from '@/components/Textarea'
import { WorkoutFeedbackSection } from '@/components/workout-modal/WorkoutFeedbackSection'
import { WorkoutTargetActualCards } from '@/components/workout-modal/WorkoutTargetActualCards'
import { formatDateFr } from '@/lib/dateUtils'
import { FORM_BASE_CLASSES, TEXTAREA_SPECIFIC_CLASSES } from '@/lib/formStyles'
import type { LiveActualMetrics, WorkoutLocale } from '@/lib/workoutFormatting'
import type { Workout, WorkoutStatus } from '@/types/database'

function parseLiveNumber(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

type AthleteWorkoutModalViewProps = {
  date: string
  locale: string
  workout: Workout
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
  tCommon: ReturnType<typeof useTranslations<'common'>>

  statusCommentAction: (payload: FormData) => void
  statusCommentPending: boolean
  statusCommentState: StatusCommentFormState

  statusSegment: WorkoutStatus
  setStatusSegment: (v: WorkoutStatus) => void

  perceivedFeeling: number | null
  perceivedIntensity: number | null
  perceivedPleasure: number | null
  setPerceivedFeeling: (v: number | null) => void
  setPerceivedIntensity: (v: number | null) => void
  setPerceivedPleasure: (v: number | null) => void

  actualDurationMinutes: string
  setActualDurationMinutes: (v: string) => void
  actualDistanceKm: string
  setActualDistanceKm: (v: string) => void
  actualElevationM: string
  setActualElevationM: (v: string) => void

  commentText: string
  setCommentText: (v: string) => void
  setHasCommentChanged: (v: boolean) => void
  initialComment: string

  showStatusCommentSuccess: boolean
  statusSaveDisabled: boolean

  preventWheelNumberChange: (e: React.WheelEvent<HTMLInputElement>) => void
}

export function AthleteWorkoutModalView({
  date,
  locale,
  workout,
  tWorkouts,
  tCommon,
  statusCommentAction,
  statusCommentPending,
  statusCommentState,
  statusSegment,
  setStatusSegment,
  perceivedFeeling,
  perceivedIntensity,
  perceivedPleasure,
  setPerceivedFeeling,
  setPerceivedIntensity,
  setPerceivedPleasure,
  actualDurationMinutes,
  setActualDurationMinutes,
  actualDistanceKm,
  setActualDistanceKm,
  actualElevationM,
  setActualElevationM,
  commentText,
  setCommentText,
  setHasCommentChanged,
  initialComment,
  showStatusCommentSuccess,
  statusSaveDisabled,
  preventWheelNumberChange,
}: AthleteWorkoutModalViewProps) {
  const summaryLocale: WorkoutLocale = locale === 'fr' ? 'fr' : 'en'
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
  const timeOfDayLabel = workout.time_of_day
    ? workout.time_of_day === 'morning'
      ? tWorkouts('form.timeOfDayMorning')
      : workout.time_of_day === 'noon'
        ? tWorkouts('form.timeOfDayNoon')
        : tWorkouts('form.timeOfDayEvening')
    : null

  // Live preview : statut + actual_* pris depuis l'état formulaire (avant sauvegarde).
  const workoutForCards = useMemo<Workout>(
    () => ({ ...workout, status: statusSegment }),
    [workout, statusSegment]
  )
  const liveActual = useMemo<LiveActualMetrics>(
    () => ({
      durationMinutes: parseLiveNumber(actualDurationMinutes),
      distanceKm: parseLiveNumber(actualDistanceKm),
      elevationM: parseLiveNumber(actualElevationM),
    }),
    [actualDurationMinutes, actualDistanceKm, actualElevationM]
  )

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 py-4 space-y-6">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            {formatDateFr(date, true, dateLocale)}
            {timeOfDayLabel ? ` · ${timeOfDayLabel}` : ''}
          </p>

          <WorkoutTargetActualCards
            workout={workoutForCards}
            liveActual={liveActual}
            locale={summaryLocale}
            tWorkouts={tWorkouts}
          />
        </div>
      </div>

      <form action={statusCommentAction} className="px-6 py-4 border-t border-stone-100 space-y-4">
        <input type="hidden" name="perceived_feeling" value={perceivedFeeling ?? ''} />
        <input type="hidden" name="perceived_intensity" value={perceivedIntensity ?? ''} />
        <input type="hidden" name="perceived_pleasure" value={perceivedPleasure ?? ''} />

        <Segments
          name="status"
          ariaLabel={tWorkouts('status.ariaLabel')}
          size="sm"
          className="w-full"
          value={statusSegment}
          onChange={(v) => {
            const next = v as WorkoutStatus
            setStatusSegment(next)
            if (next === 'not_completed') {
              setActualDurationMinutes('')
              setActualDistanceKm('')
              setActualElevationM('')
            }
          }}
          options={(['planned', 'completed', 'not_completed'] as const).map((value) => ({
            value,
            label: tWorkouts(`status.${value}`),
          }))}
        />

        {statusSegment === 'completed' && (
          <>
            {(() => {
              const showDuration = workout.target_duration_minutes != null
              const showDistance = workout.target_distance_km != null
              const showElevation = workout.target_elevation_m != null
              const isSwim = workout.sport_type === 'natation'

              const durationValid =
                !showDuration || (actualDurationMinutes.trim() !== '' && Number(actualDurationMinutes) >= 0)
              const distanceValid = !showDistance
                ? true
                : isSwim
                  ? actualDistanceKm.trim() !== '' && Number(actualDistanceKm) >= 0
                  : actualDistanceKm.trim() !== '' && Number(actualDistanceKm) >= 0
              const elevationValid =
                !showElevation || (actualElevationM.trim() !== '' && Number(actualElevationM) >= 0)

              return showDuration || showDistance || showElevation ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {showDuration && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        {tWorkouts('actual.durationLabel')}
                      </label>
                      <div className="relative">
                        <input
                          name="actual_duration_minutes"
                          type="number"
                          min={0}
                          value={actualDurationMinutes}
                          onChange={(e) => setActualDurationMinutes(e.target.value)}
                          onWheel={preventWheelNumberChange}
                          className={`w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12 ${
                            durationValid ? 'border-stone-300' : 'border-palette-danger'
                          }`}
                          aria-invalid={!durationValid}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.durationUnit')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showDistance && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        {tWorkouts('actual.distanceLabel')}
                      </label>
                      <div className="relative">
                        {isSwim ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              value={
                                actualDistanceKm.trim() === ''
                                  ? ''
                                  : String(Math.round(Number(actualDistanceKm) * 1000))
                              }
                              onChange={(e) => {
                                const meters = e.target.value.trim()
                                setActualDistanceKm(meters === '' ? '' : String(Number(meters) / 1000))
                              }}
                              onWheel={preventWheelNumberChange}
                              className={`w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12 ${
                                distanceValid ? 'border-stone-300' : 'border-palette-danger'
                              }`}
                              aria-invalid={!distanceValid}
                            />
                            <input name="actual_distance_km" type="hidden" value={actualDistanceKm} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.distanceUnit')}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <input
                              name="actual_distance_km"
                              type="number"
                              min={0}
                              step={0.1}
                              value={actualDistanceKm}
                              onChange={(e) => setActualDistanceKm(e.target.value)}
                              onWheel={preventWheelNumberChange}
                              className={`w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12 ${
                                distanceValid ? 'border-stone-300' : 'border-palette-danger'
                              }`}
                              aria-invalid={!distanceValid}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.distanceUnitKm')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {showElevation && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        {tWorkouts('actual.elevationLabel')}
                      </label>
                      <div className="relative">
                        <input
                          name="actual_elevation_m"
                          type="number"
                          min={0}
                          value={actualElevationM}
                          onChange={(e) => setActualElevationM(e.target.value)}
                          onWheel={preventWheelNumberChange}
                          className={`w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-14 ${
                            elevationValid ? 'border-stone-300' : 'border-palette-danger'
                          }`}
                          aria-invalid={!elevationValid}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.distanceUnit')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null
            })()}

            <WorkoutFeedbackSection
              perceivedFeeling={perceivedFeeling}
              perceivedIntensity={perceivedIntensity}
              perceivedPleasure={perceivedPleasure}
              onFeelingChange={setPerceivedFeeling}
              onIntensityChange={setPerceivedIntensity}
              onPleasureChange={setPerceivedPleasure}
              tWorkouts={tWorkouts}
            />
          </>
        )}

        <Textarea
          name="comment"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value)
            setHasCommentChanged(e.target.value.trim() !== initialComment.trim())
          }}
          rows={3}
          placeholder={tWorkouts('comments.placeholderForCoach')}
          className={`${FORM_BASE_CLASSES} ${TEXTAREA_SPECIFIC_CLASSES} min-h-[80px]`}
          aria-label={tWorkouts('comments.ariaLabel')}
        />

        {statusCommentState?.error && (
          <p className="text-sm text-palette-danger" role="alert">
            {statusCommentState.error}
          </p>
        )}

        <Button
          type="submit"
          variant="primaryDark"
          disabled={statusSaveDisabled || statusCommentPending}
          loading={statusCommentPending}
          loadingText={tCommon('saving')}
          success={showStatusCommentSuccess}
          successText={tCommon('saved')}
          className="w-full"
        >
          {tCommon('save')}
        </Button>
      </form>
    </>
  )
}

