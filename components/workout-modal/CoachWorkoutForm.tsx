'use client'

import { memo, type FormEventHandler } from 'react'
import type { SportType, Workout, WorkoutStatus } from '@/types/database'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { ClockIcon, LightningIcon, MountainIcon, RulerIcon } from '@/components/workout-modal/icons'
import { FORM_BASE_CLASSES, FORM_LABEL_CLASSES, TEXTAREA_SPECIFIC_CLASSES } from '@/lib/formStyles'

type Props = {
  action: (formData: FormData) => void
  canEdit: boolean
  isEdit: boolean
  currentWorkout: Workout | null
  workoutId?: string
  workoutStatus: WorkoutStatus
  editableDate: string
  sportType: SportType
  title: string
  description: string
  targetDurationMinutes: string
  targetDistanceKm: string
  targetElevationM: string
  targetPace: string
  hasCvNTargets: boolean
  hasElevation: boolean
  isTimeOnly: boolean
  workoutSportTypes: SportType[]
  /** Ligne d’aide sous « Objectifs de séance » (métrique obligatoire selon profil coach). */
  mandatoryMetricHint: string
  onSportChange: (sport: SportType) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTargetDurationChange: (value: string) => void
  onTargetDistanceChange: (value: string) => void
  onTargetElevationChange: (value: string) => void
  onTargetPaceChange: (value: string) => void
  timeOfDaySegment: string
  onTimeOfDayChange: (value: string) => void
  tWorkouts: (key: string) => string
  onSubmit: FormEventHandler<HTMLFormElement>
}

function preventWheelNumberChange(e: React.WheelEvent<HTMLInputElement>) {
  if (document.activeElement === e.currentTarget) {
    e.currentTarget.blur()
  }
}

const DISABLED_NUMBER_CLASSES =
  'disabled:bg-stone-100 disabled:text-stone-500 disabled:border-stone-200 disabled:cursor-not-allowed disabled:opacity-100'

const TIME_OF_DAY_OPTIONS = [
  { value: '', labelKey: 'form.timeOfDayUnspecified' },
  { value: 'morning', labelKey: 'form.timeOfDayMorning' },
  { value: 'noon', labelKey: 'form.timeOfDayNoon' },
  { value: 'evening', labelKey: 'form.timeOfDayEvening' },
] as const

export const CoachWorkoutForm = memo(function CoachWorkoutForm({
  action,
  isEdit,
  currentWorkout,
  editableDate,
  sportType,
  title,
  description,
  targetDurationMinutes,
  targetDistanceKm,
  targetElevationM,
  targetPace,
  hasCvNTargets,
  hasElevation,
  isTimeOnly,
  workoutSportTypes,
  mandatoryMetricHint,
  onSportChange,
  onTitleChange,
  onDescriptionChange,
  onTargetDurationChange,
  onTargetDistanceChange,
  onTargetElevationChange,
  onTargetPaceChange,
  timeOfDaySegment,
  onTimeOfDayChange,
  tWorkouts,
  onSubmit,
}: Props) {
  return (
    <form id="workout-form" action={action} className="flex flex-col flex-1 min-h-0" onSubmit={onSubmit}>
      <input type="hidden" name="date" value={editableDate} />
      {isEdit && currentWorkout && <input type="hidden" name="workout_id" value={currentWorkout.id} />}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-4 space-y-5">
          <input type="hidden" name="sport_type" value={sportType} />
          <div className="flex flex-wrap gap-3">
            {workoutSportTypes.map((sport) => (
              <SportTileSelectable
                key={sport}
                value={sport}
                selected={sportType === sport}
                onChange={() => onSportChange(sport)}
              />
            ))}
          </div>

          <div>
            <label htmlFor="title-coach" className={FORM_LABEL_CLASSES}>
              {tWorkouts('form.title')}
            </label>
            <Input
              id="title-coach"
              name="title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              placeholder={tWorkouts('form.titlePlaceholder')}
            />
          </div>

          <div>
            <label className={FORM_LABEL_CLASSES}>{tWorkouts('form.timeOfDay')}</label>
            <div
              className="flex bg-stone-200 p-0.5 rounded-lg"
              role="group"
              aria-label={tWorkouts('form.timeOfDay')}
            >
              {TIME_OF_DAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'unspecified'}
                  type="button"
                  onClick={() => onTimeOfDayChange(opt.value)}
                  className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-all ${
                    timeOfDaySegment === opt.value
                      ? 'bg-palette-forest-dark text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tWorkouts(opt.labelKey)}
                </button>
              ))}
            </div>
            <input type="hidden" name="time_of_day" value={timeOfDaySegment} />
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="flex flex-col gap-1 mb-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {tWorkouts('form.sessionGoals')}
              </div>
              {mandatoryMetricHint ? (
                <p className="text-[10px] text-stone-500 leading-snug">{mandatoryMetricHint}</p>
              ) : null}
            </div>

            {isTimeOnly && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    name="target_duration_minutes"
                    type="number"
                    min={1}
                    value={targetDurationMinutes}
                    onChange={(e) => onTargetDurationChange(e.target.value)}
                    onWheel={preventWheelNumberChange}
                    placeholder="22"
                    className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-12`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-stone-400">{tWorkouts('form.durationUnit')}</span>
                  </div>
                  <input type="hidden" name="target_distance_km" value="" />
                  <input type="hidden" name="target_elevation_m" value="" />
                </div>
                <div />
              </div>
            )}

            {hasCvNTargets && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  {sportType === 'natation' ? (
                    <>
                      <input type="hidden" name="target_distance_km" value={targetDistanceKm} />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={
                          targetDistanceKm ? String(Math.round(Number(targetDistanceKm) * 1000)) : ''
                        }
                        onChange={(e) =>
                          onTargetDistanceChange(
                            e.target.value ? String(Number(e.target.value) / 1000) : ''
                          )
                        }
                        onWheel={preventWheelNumberChange}
                        placeholder="1500"
                        className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-10`}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RulerIcon className="h-4 w-4 text-stone-400" />
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-stone-400">
                        m
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        name="target_distance_km"
                        type="number"
                        min={0}
                        step={0.1}
                        value={targetDistanceKm}
                        onChange={(e) => onTargetDistanceChange(e.target.value)}
                        onWheel={preventWheelNumberChange}
                        placeholder="14,3"
                        className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-10`}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RulerIcon className="h-4 w-4 text-stone-400" />
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-stone-400">
                        km
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <input
                    name="target_duration_minutes"
                    type="number"
                    min={1}
                    value={targetDurationMinutes}
                    onChange={(e) => onTargetDurationChange(e.target.value)}
                    onWheel={preventWheelNumberChange}
                    placeholder="22"
                    className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-12`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-stone-400">{tWorkouts('form.durationUnit')}</span>
                  </div>
                </div>

                {hasElevation ? (
                  <div className="relative">
                    <input
                      name="target_elevation_m"
                      type="number"
                      min={0}
                      value={targetElevationM}
                      onChange={(e) => onTargetElevationChange(e.target.value)}
                      onWheel={preventWheelNumberChange}
                      placeholder="200"
                      className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-14`}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MountainIcon className="h-4 w-4 text-stone-400" />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-xs text-stone-400">{tWorkouts('form.elevationUnit')}</span>
                    </div>
                  </div>
                ) : (
                  <input type="hidden" name="target_elevation_m" value="" />
                )}

                <div className="relative">
                  <input
                    name="target_pace"
                    type="number"
                    min={0}
                    step={sportType === 'velo' ? 1 : 0.1}
                    value={targetPace}
                    onChange={(e) => onTargetPaceChange(e.target.value)}
                    onWheel={preventWheelNumberChange}
                    placeholder={sportType === 'course' ? '5.0' : sportType === 'velo' ? '39' : '2.0'}
                    className={`${FORM_BASE_CLASSES} ${DISABLED_NUMBER_CLASSES} font-semibold pl-10 pr-16`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LightningIcon className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-stone-400">
                    {sportType === 'course'
                      ? tWorkouts('form.paceUnitRunning')
                      : sportType === 'velo'
                        ? tWorkouts('form.paceUnitCycling')
                        : tWorkouts('form.paceUnitSwimming')}
                  </div>
                </div>
              </div>
            )}

            <hr className="my-3 border-stone-200" />
            <Textarea
              name="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              placeholder={tWorkouts('form.descriptionPlaceholder')}
              className={`${FORM_BASE_CLASSES} ${TEXTAREA_SPECIFIC_CLASSES} min-h-[80px]`}
              aria-label={tWorkouts('form.description')}
            />
          </div>

          {currentWorkout && (
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-stone-200/80 rounded-full text-stone-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{tWorkouts('comments.athleteComment')}</h3>
              </div>
              <p className="text-sm text-stone-600">
                {currentWorkout.athlete_comment?.trim()
                  ? currentWorkout.athlete_comment
                  : tWorkouts('comments.noComment')}
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  )
})
