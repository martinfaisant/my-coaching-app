'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  createAthleteLoggedActivity,
  updateAthleteLoggedActivity,
  deleteAthleteLoggedActivity,
  type AthleteLoggedActivityFormState,
} from '@/app/[locale]/dashboard/athlete-logged-activity/actions'
import type { Workout, WorkoutTimeOfDay } from '@/types/database'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { CoachWorkoutForm } from '@/components/workout-modal/CoachWorkoutForm'
import { DatePickerPopover } from '@/components/workout-modal/DatePickerPopover'
import { WorkoutFeedbackSection } from '@/components/workout-modal/WorkoutFeedbackSection'
import { useWorkoutFormReducer } from '@/components/workout-modal/useWorkoutFormReducer'
import { formatDateFr } from '@/lib/dateUtils'
import { FORM_INPUT_HEIGHT, FORM_INPUT_TEXT_SIZE } from '@/lib/formStyles'
import {
  PERSISTED_WORKOUT_SPORT_TYPES,
  workoutHasElevationField,
  workoutHasTimeDistanceTargets,
  workoutIsTimeOnlySport,
} from '@/lib/sportsRegistry'
import { isAthleteLoggedActivityFormValid, getAthleteLoggedActivityMetricsUi } from '@/lib/athleteLoggedActivityValidation'
import { ATHLETE_LOGGED_MODAL_BADGE_CLASSNAME } from '@/lib/athleteLoggedWorkout'
import {
  SPORT_BADGE_STYLES,
  SPORT_ICONS,
  SPORT_PILL_STYLES,
  SPORT_TRANSLATION_KEYS,
} from '@/lib/sportStyles'
import { AthleteLoggedCoachReadOnlyView } from '@/components/athlete-logged-activity/AthleteLoggedCoachReadOnlyView'

type AthleteLoggedActivityModalProps = {
  isOpen: boolean
  onClose: (closedBySuccess?: boolean, updatedWorkout?: Workout) => void
  date: string
  athleteId: string
  pathToRevalidate: string
  workout?: Workout | null
  readOnly?: boolean
}

function SubmitButton({
  disabled,
  showSuccess,
  isSubmitting,
}: {
  disabled?: boolean
  showSuccess?: boolean
  isSubmitting?: boolean
}) {
  const { pending } = useFormStatus()
  const tCommon = useTranslations('common')
  return (
    <Button
      type="submit"
      form="athlete-logged-activity-form"
      variant="primaryDark"
      disabled={disabled || pending || isSubmitting}
      loading={pending || isSubmitting}
      loadingText={tCommon('saving')}
      success={showSuccess}
      successText={tCommon('saved')}
      className="flex-1 min-w-0"
    >
      {tCommon('save')}
    </Button>
  )
}

export function AthleteLoggedActivityModal({
  isOpen,
  onClose,
  date,
  athleteId,
  pathToRevalidate,
  workout = null,
  readOnly = false,
}: AthleteLoggedActivityModalProps) {
  const locale = useLocale()
  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('athleteLoggedActivity')
  const tWorkouts = useTranslations('workouts')
  const tSports = useTranslations('sports')
  const tCommon = useTranslations('common')

  const isEdit = workout != null
  const workoutForm = useWorkoutFormReducer({
    workout,
    date,
    coachPrimaryMetrics: null,
  })

  const [perceivedFeeling, setPerceivedFeeling] = useState<number | null>(workout?.perceived_feeling ?? null)
  const [perceivedIntensity, setPerceivedIntensity] = useState<number | null>(workout?.perceived_intensity ?? null)
  const [perceivedPleasure, setPerceivedPleasure] = useState<number | null>(workout?.perceived_pleasure ?? null)
  const [commentText, setCommentText] = useState(workout?.athlete_comment?.trim() ?? '')

  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const noopAction = async (_prev: AthleteLoggedActivityFormState): Promise<AthleteLoggedActivityFormState> => ({})

  const actionWithUiSync = useCallback(
    async (prevState: AthleteLoggedActivityFormState, formData: FormData) => {
      const result =
        isEdit && workout
          ? await updateAthleteLoggedActivity(workout.id, athleteId, pathToRevalidate, prevState, formData)
          : await createAthleteLoggedActivity(athleteId, pathToRevalidate, prevState, formData)

      setIsSubmitting(false)

      if (result?.success && result.workout) {
        setShowSavedFeedback(true)
        if (successTimerRef.current) clearTimeout(successTimerRef.current)
        successTimerRef.current = setTimeout(() => {
          setShowSavedFeedback(false)
          onClose(true, result.workout)
        }, 1200)
      } else if (result?.error) {
        setShowSavedFeedback(false)
      }

      return result
    },
    [athleteId, pathToRevalidate, isEdit, workout, onClose]
  )

  const [state, action] = useActionState(
    readOnly ? noopAction : actionWithUiSync,
    {} as AthleteLoggedActivityFormState
  )

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  const {
    sportType,
    title,
    description,
    targetMode,
    targetDurationMinutes,
    targetDistanceKm,
    targetElevationM,
    targetPace,
    editableDate,
    timeOfDaySegment,
  } = workoutForm.values

  const hasTimeDistanceChoice = sportType != null && workoutHasTimeDistanceTargets(sportType)
  const hasElevation = sportType != null && workoutHasElevationField(sportType)
  const isTimeOnly = sportType != null && workoutIsTimeOnlySport(sportType)

  const isFormValid = useMemo(
    () =>
      isAthleteLoggedActivityFormValid({
        sportType,
        title,
        targetDurationMinutes,
        targetDistanceKm,
        targetElevationM,
        targetPace,
      }),
    [sportType, title, targetDurationMinutes, targetDistanceKm, targetElevationM, targetPace]
  )

  const metricsUi = useMemo(
    () => (sportType != null ? getAthleteLoggedActivityMetricsUi(sportType) : null),
    [sportType]
  )

  const openDatePicker = useCallback(() => {
    const rect = dateTriggerRef.current?.getBoundingClientRect()
    if (rect) setDatePickerAnchor(rect)
    setShowDatePickerPopup(true)
  }, [])

  const closeDatePicker = useCallback(() => {
    setShowDatePickerPopup(false)
    setDatePickerAnchor(null)
  }, [])

  const handleDelete = async () => {
    if (!workout) return
    setDeleteLoading(true)
    setDeleteError(null)
    const result = await deleteAthleteLoggedActivity(workout.id, athleteId, pathToRevalidate)
    setDeleteLoading(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    onClose(true)
  }

  const dateBlock = (
    <div
      ref={dateTriggerRef}
      className={`flex items-center gap-2 border border-stone-300 rounded-lg py-2.5 px-4 bg-white ${FORM_INPUT_TEXT_SIZE} ${FORM_INPUT_HEIGHT} ${
        readOnly ? '' : 'focus-within:ring-2 focus-within:ring-palette-forest-dark focus-within:border-transparent transition'
      }`}
    >
      <span className="text-sm font-bold text-stone-900 min-w-[10rem]" aria-hidden>
        {formatDateFr(editableDate, true, localeForPicker)}
      </span>
      {!readOnly && (
        <button
          type="button"
          onClick={openDatePicker}
          className="shrink-0 p-1 rounded text-stone-400 hover:text-palette-forest-dark hover:bg-stone-100"
          title={tWorkouts('form.chooseDate')}
          aria-label={tWorkouts('form.chooseDate')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  )

  const personalBadge = (
    <span className={`shrink-0 ${ATHLETE_LOGGED_MODAL_BADGE_CLASSNAME}`}>
      {t('badgePersonal')}
    </span>
  )

  const coachAthleteAddedBadge = (
    <span className={`shrink-0 ${ATHLETE_LOGGED_MODAL_BADGE_CLASSNAME}`}>
      {t('coachReadOnly.headerBadge')}
    </span>
  )

  const buildSportHeaderPill = (w: Workout) => {
    if (!(w.sport_type in SPORT_ICONS)) return null
    const sport = w.sport_type as keyof typeof SPORT_ICONS
    const Icon = SPORT_ICONS[sport]
    const styles =
      sport in SPORT_BADGE_STYLES
        ? SPORT_BADGE_STYLES[sport as keyof typeof SPORT_BADGE_STYLES]
        : { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300' }
    const borderClass =
      w.sport_type in SPORT_PILL_STYLES
        ? SPORT_PILL_STYLES[w.sport_type as keyof typeof SPORT_PILL_STYLES].border
        : 'border-stone-300'
    const label =
      sport in SPORT_TRANSLATION_KEYS
        ? tSports(SPORT_TRANSLATION_KEYS[sport as keyof typeof SPORT_TRANSLATION_KEYS])
        : w.sport_type
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 ${borderClass} ${styles.bg} ${styles.text} text-xs font-medium shrink-0 shadow-[0_4px_6px_-1px_rgba(98,126,89,0.2)]`}
        aria-hidden
      >
        <Icon className="w-3 h-3 shrink-0" aria-hidden />
        <span>{label}</span>
      </span>
    )
  }

  if (readOnly && workout) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => onClose()}
        size="workout"
        title={workout.title}
        icon={buildSportHeaderPill(workout)}
        iconRaw
        titleWrap
        headerRight={coachAthleteAddedBadge}
        contentClassName="px-0"
      >
        <AthleteLoggedCoachReadOnlyView workout={workout} locale={locale} tWorkouts={tWorkouts} />
      </Modal>
    )
  }

  return (
    <>
      <DatePickerPopover
        isOpen={showDatePickerPopup}
        anchor={datePickerAnchor}
        value={editableDate}
        onChange={(dateStr) => {
          workoutForm.setValue('editableDate', dateStr)
          closeDatePicker()
        }}
        onClose={closeDatePicker}
        locale={localeForPicker}
        monthDropdownId="athlete-logged-date-picker-month"
      />
      <Modal
        isOpen={isOpen}
        onClose={() => onClose()}
        size="workout"
        icon={dateBlock}
        iconRaw
        headerRight={personalBadge}
        contentClassName="px-0"
        footer={
          <div className="w-full">
            {(state?.error || deleteError) && (
              <p className="text-sm text-palette-danger mb-3" role="alert">
                {state?.error ?? deleteError}
              </p>
            )}
            <div className="flex gap-3">
              {isEdit && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  loading={deleteLoading}
                  loadingText={tCommon('deleting')}
                  className="flex-1 min-w-0"
                >
                  {tCommon('delete')}
                </Button>
              )}
              <SubmitButton
                disabled={!isFormValid}
                showSuccess={showSavedFeedback}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        }
      >
        <CoachWorkoutForm
            action={action}
            canEdit
            isEdit={isEdit}
            currentWorkout={workout}
            workoutStatus="completed"
            editableDate={editableDate}
            sportType={sportType}
            title={title}
            description={description}
            targetMode={targetMode}
            targetDurationMinutes={targetDurationMinutes}
            targetDistanceKm={targetDistanceKm}
            targetElevationM={targetElevationM}
            targetPace={targetPace}
            hasCvNTargets={hasTimeDistanceChoice}
            hasElevation={hasElevation}
            isTimeOnly={isTimeOnly}
            workoutSportTypes={[...PERSISTED_WORKOUT_SPORT_TYPES]}
            onSportChange={(sport) => workoutForm.setValue('sportType', sport)}
            onTitleChange={(value) => workoutForm.setValue('title', value)}
            onDescriptionChange={(value) => workoutForm.setValue('description', value)}
            onTargetDurationChange={(value) => workoutForm.setValue('targetDurationMinutes', value)}
            onTargetDistanceChange={(value) => workoutForm.setValue('targetDistanceKm', value)}
            onTargetElevationChange={(value) => workoutForm.setValue('targetElevationM', value)}
            onTargetPaceChange={(value) => workoutForm.setValue('targetPace', value)}
            timeOfDaySegment={timeOfDaySegment ?? ''}
            onTimeOfDayChange={(value) =>
              workoutForm.setValue('timeOfDaySegment', (value || null) as WorkoutTimeOfDay | null)
            }
            tWorkouts={tWorkouts}
            metricsHeading={metricsUi ? t(metricsUi.headingKey) : t('form.activityRealized')}
            requiredFields={metricsUi?.requiredFields}
            titleRequired
            showAthleteCommentReadOnly={false}
            formId="athlete-logged-activity-form"
            onSubmit={() => setIsSubmitting(true)}
            extraContent={
              <div className="space-y-4 border-t border-stone-100 pt-4">
                <input type="hidden" name="_locale" value={locale} />
                <input type="hidden" name="perceived_feeling" value={perceivedFeeling ?? ''} />
                <input type="hidden" name="perceived_intensity" value={perceivedIntensity ?? ''} />
                <input type="hidden" name="perceived_pleasure" value={perceivedPleasure ?? ''} />
                <input type="hidden" name="athlete_comment" value={commentText} />
                <WorkoutFeedbackSection
                  perceivedFeeling={perceivedFeeling}
                  perceivedIntensity={perceivedIntensity}
                  perceivedPleasure={perceivedPleasure}
                  onFeelingChange={setPerceivedFeeling}
                  onIntensityChange={setPerceivedIntensity}
                  onPleasureChange={setPerceivedPleasure}
                  tWorkouts={tWorkouts}
                />
                <Textarea
                  label={tWorkouts('comments.athleteComment')}
                  placeholder={tWorkouts('comments.placeholderForCoach')}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
              </div>
            }
          />
      </Modal>
    </>
  )
}
