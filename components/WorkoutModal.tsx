'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  createWorkout,
  updateWorkout,
  deleteWorkout,
  saveWorkoutComment,
  saveWorkoutStatusAndComment,
  type WorkoutFormState,
  type CommentFormState,
  type StatusCommentFormState,
} from '@/app/[locale]/dashboard/workouts/actions'
import type { SportType, Workout, WorkoutStatus, WorkoutTimeOfDay } from '@/types/database'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Badge } from '@/components/Badge'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react'
import { SPORT_ICONS, SPORT_PILL_STYLES, SPORT_TRANSLATION_KEYS, SPORT_BADGE_STYLES } from '@/lib/sportStyles'
import { formatDateFr, toDateStr } from '@/lib/dateUtils'
import { FORM_BASE_CLASSES, FORM_LABEL_CLASSES, FORM_INPUT_HEIGHT, FORM_INPUT_TEXT_SIZE, TEXTAREA_SPECIFIC_CLASSES } from '@/lib/formStyles'
import { ClockIcon, LightningIcon, MountainIcon, RulerIcon } from '@/components/workout-modal/icons'
import { useWorkoutFormReducer } from '@/components/workout-modal/useWorkoutFormReducer'
import { WorkoutFeedbackSection } from '@/components/workout-modal/WorkoutFeedbackSection'
import { DatePickerPopover } from '@/components/workout-modal/DatePickerPopover'
import { CoachWorkoutForm } from '@/components/workout-modal/CoachWorkoutForm'

/** Sports pour entraînement (sous-ensemble du calendrier). */
const WORKOUT_SPORT_TYPES: SportType[] = ['course', 'velo', 'natation', 'musculation']

const FEELING_ICONS_READONLY = [Angry, Frown, Meh, Smile, Laugh] as const

/** Course et vélo : choix temps ou distance + dénivelé facultatif. Musculation : temps. Natation : temps ou distance. */
type TargetMode = 'time' | 'distance'

type WorkoutModalProps = {
  isOpen: boolean
  onClose: (closedBySuccess?: boolean, updatedWorkout?: Workout) => void
  date: string
  athleteId: string
  pathToRevalidate: string
  canEdit: boolean
  /** Vue athlète (son propre calendrier) : titre "Mon entrainement" au lieu de "Modifier l'entraînement" */
  athleteView?: boolean
  workout?: Workout | null
}

function SubmitButton({
  disabled,
  formState,
  showSuccess,
  isSubmitting,
}: {
  disabled?: boolean
  formState?: { success?: boolean; error?: string }
  showSuccess?: boolean
  isSubmitting?: boolean
}) {
  const { pending } = useFormStatus()
  const t = useTranslations('common')
  return (
    <Button
      type="submit"
      form="workout-form"
      variant="primaryDark"
      disabled={disabled || pending || isSubmitting}
      loading={pending || isSubmitting}
      loadingText={t('saving')}
      success={showSuccess}
      successText={t('saved')}
      error={!!formState?.error}
      className="flex-1 min-w-0"
    >
      {t('save')}
    </Button>
  )
}

function CommentSubmitButton({
  formState,
  hasChanges,
  showSuccess,
}: {
  formState?: { success?: boolean; error?: string }
  hasChanges?: boolean
  showSuccess?: boolean
}) {
  const { pending } = useFormStatus()
  const t = useTranslations('common')
  
  return (
    <Button
      type="submit"
      variant="primaryDark"
      disabled={!hasChanges || pending}
      loading={pending}
      loadingText={t('saving')}
      success={showSuccess}
      successText={t('saved')}
      className="shrink-0"
    >
      {t('save')}
    </Button>
  )
}

function preventWheelNumberChange(e: React.WheelEvent<HTMLInputElement>) {
  if (document.activeElement === e.currentTarget) {
    e.currentTarget.blur()
  }
}

export function WorkoutModal({
  isOpen,
  onClose,
  date,
  athleteId,
  pathToRevalidate,
  canEdit,
  athleteView = false,
  workout,
}: WorkoutModalProps) {
  const locale = useLocale()
  const tWorkouts = useTranslations('workouts')
  const tCommon = useTranslations('common')
  const tSports = useTranslations('sports')
  const router = useRouter()
  // 🔧 FIX: Stocker le workout localement pour pouvoir le mettre à jour après sauvegarde du commentaire
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(workout ?? null)
  const workoutForm = useWorkoutFormReducer({ workout: currentWorkout, date })
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
  const [commentText, setCommentText] = useState('')
  const initialCommentRef = useRef<string>('')
  const [hasCommentChanged, setHasCommentChanged] = useState(false)
  const [showCommentSuccess, setShowCommentSuccess] = useState(false)
  /** Statut sélectionné (vue athlète, US3). */
  const [statusSegment, setStatusSegment] = useState<WorkoutStatus>('planned')
  const initialStatusRef = useRef<WorkoutStatus>('planned')
  /** Retour athlète (workout feedback). */
  const [perceivedFeeling, setPerceivedFeeling] = useState<number | null>(null)
  const [perceivedIntensity, setPerceivedIntensity] = useState<number | null>(null)
  const [perceivedPleasure, setPerceivedPleasure] = useState<number | null>(null)
  const initialFeelingRef = useRef<number | null>(null)
  const initialIntensityRef = useRef<number | null>(null)
  const initialPleasureRef = useRef<number | null>(null)
  const previousCommentPendingRef = useRef(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  /** Ouverture du popup calendrier (design system) : popover sous le champ date, pas une 2e modale. */
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)

  // Pattern standard pour le bouton "Enregistrer" du formulaire workout
  const [showWorkoutSavedFeedback, setShowWorkoutSavedFeedback] = useState(false)
  const previousWorkoutSubmittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const hasUnsavedChanges = workoutForm.hasUnsavedChanges

  const isEdit = !!currentWorkout
  const hasTimeDistanceChoice = sportType === 'course' || sportType === 'velo' || sportType === 'natation'

  /** Date dans le futur (aujourd'hui ou après) pour condition modale coach modifiable (US4). */
  const isDateInFuture = (dateStr: string) => dateStr >= toDateStr(new Date())
  /** Coach peut modifier la séance : à venir et non réalisée (US4). */
  const coachCanEdit =
    canEdit &&
    !athleteView &&
    !!currentWorkout &&
    isDateInFuture(currentWorkout.date) &&
    (currentWorkout.status ?? 'planned') !== 'completed'

  /** Même design que la modale de modification : création ou édition modifiable (coach). */
  const coachFormNewLayout = canEdit && !athleteView && (!currentWorkout || coachCanEdit)

  /** US5 : séance en lecture seule (passée ou réalisée) — pas de formulaire ni boutons. */
  const coachReadOnly = canEdit && !athleteView && !!currentWorkout && !coachCanEdit

  /** Badge statut pour l’en-tête coach (US4/US5). */
  const getStatusBadge = (s: WorkoutStatus) => {
    const map: Record<WorkoutStatus, { label: string; className: string }> = {
      planned: { label: tWorkouts('status.planned'), className: 'bg-stone-100 text-stone-500' },
      completed: { label: tWorkouts('status.completed'), className: 'bg-palette-forest-dark/15 text-palette-forest-dark' },
      not_completed: { label: tWorkouts('status.not_completed'), className: 'bg-palette-amber/20 text-stone-600' },
    }
    return map[s]
  }
  const hasElevation = sportType === 'course' || sportType === 'velo'
  const isTimeOnly = sportType === 'musculation'

  // Pour le champ désactivé : n'afficher une valeur que si les deux autres champs (temps ou distance + vitesse) sont remplis
  const paceFilled = (targetPace?.trim() ?? '') !== '' && Number(targetPace) > 0
  const timeFilled = (targetDurationMinutes?.trim() ?? '') !== '' && Number(targetDurationMinutes) > 0
  const distanceFilled = (targetDistanceKm?.trim() ?? '') !== '' && Number(targetDistanceKm) > 0
  const showDisabledDistance = targetMode === 'time' && timeFilled && paceFilled
  const showDisabledDuration = targetMode === 'distance' && distanceFilled && paceFilled

  const isValid =
    sportType &&
    title.trim() &&
    (isTimeOnly
      ? targetDurationMinutes.trim() !== '' && Number(targetDurationMinutes) > 0
      : (targetMode === 'time'
          ? targetDurationMinutes.trim() !== '' && Number(targetDurationMinutes) > 0
          : targetDistanceKm.trim() !== '' && Number(targetDistanceKm) > 0) &&
        paceFilled)

  // Synchroniser currentWorkout avec le prop workout quand il change
  useEffect(() => {
    setCurrentWorkout(workout ?? null)
  }, [workout])

  useEffect(() => {
    if (currentWorkout) {
      const initialComment = currentWorkout.athlete_comment ?? ''
      setCommentText(initialComment)
      initialCommentRef.current = initialComment
      setHasCommentChanged(false)
      const st = (currentWorkout.status ?? 'planned') as WorkoutStatus
      setStatusSegment(st)
      initialStatusRef.current = st
      const feeling = currentWorkout.perceived_feeling != null && currentWorkout.perceived_feeling >= 1 && currentWorkout.perceived_feeling <= 5 ? currentWorkout.perceived_feeling : null
      const intensity = currentWorkout.perceived_intensity != null && currentWorkout.perceived_intensity >= 1 && currentWorkout.perceived_intensity <= 10 ? currentWorkout.perceived_intensity : null
      const pleasure = currentWorkout.perceived_pleasure != null && currentWorkout.perceived_pleasure >= 1 && currentWorkout.perceived_pleasure <= 5 ? currentWorkout.perceived_pleasure : null
      setPerceivedFeeling(feeling)
      setPerceivedIntensity(intensity)
      setPerceivedPleasure(pleasure)
      initialFeelingRef.current = feeling
      initialIntensityRef.current = intensity
      initialPleasureRef.current = pleasure
    } else {
      setCommentText('')
      initialCommentRef.current = ''
      setHasCommentChanged(false)
      setStatusSegment('planned')
      initialStatusRef.current = 'planned'
      setPerceivedFeeling(null)
      setPerceivedIntensity(null)
      setPerceivedPleasure(null)
      initialFeelingRef.current = null
      initialIntensityRef.current = null
      initialPleasureRef.current = null
    }
    if (!isOpen) {
      setDeleteError(null)
    }
  }, [currentWorkout, isOpen])

  const [createState, createAction, createPending] = useActionState<WorkoutFormState, FormData>(
    (_, fd) => createWorkout(athleteId, pathToRevalidate, {}, fd),
    {}
  )
  const [updateState, updateAction, updatePending] = useActionState<WorkoutFormState, FormData>(
    (_, fd) =>
      currentWorkout
        ? updateWorkout(currentWorkout.id, athleteId, pathToRevalidate, {}, fd)
        : Promise.resolve({}),
    {}
  )
  const handleDelete = async () => {
    if (!currentWorkout || !canEdit) return
    if (!confirm(tWorkouts('deleteConfirmation'))) return
    setDeleteError(null)
    setDeleteLoading(true)
    const result = await deleteWorkout(currentWorkout.id, athleteId, pathToRevalidate)
    setDeleteLoading(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    onClose(true)
  }

  const state = isEdit ? updateState : createState
  const action = isEdit ? updateAction : createAction
  const workoutPending = isEdit ? updatePending : createPending

  // Réinitialiser isSubmitting après réponse serveur
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [state])

  // Pattern standard : Feedback "✓ Enregistré" à chaque sauvegarde
  const workoutSaveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  
  useEffect(() => {
    // Détecter la TRANSITION : était en train de soumettre, ne l'est plus
    const justFinishedSubmitting = previousWorkoutSubmittingRef.current && !isSubmitting
    previousWorkoutSubmittingRef.current = isSubmitting
    
    if (state?.success && justFinishedSubmitting) {
      setShowWorkoutSavedFeedback(true)
      // Réinitialiser l'état initial du formulaire après succès
      workoutForm.markSaved()
      
      const timer = setTimeout(() => {
        setShowWorkoutSavedFeedback(false)
        // Fermer la modal après le feedback
        onClose(true, state.workout)
      }, 1500) // 1.5s pour voir le check, puis fermeture
      
      return () => clearTimeout(timer)
    }
    
    if (state?.error) {
      setShowWorkoutSavedFeedback(false)
    }
  }, [workoutSaveFeedbackKey])

  // Fermeture immédiate si erreur (pas de délai)
  useEffect(() => {
    if (state?.error && !workoutPending) {
      // L'erreur sera affichée dans le footer, pas besoin de fermer
    }
    // onClose volontairement omis des deps pour éviter une boucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.error, workoutPending])

  // State pour la sauvegarde du commentaire avec useActionState (coach view, legacy)
  const [commentState, commentAction, commentPending] = useActionState<
    CommentFormState,
    FormData
  >(
    async (prevState: CommentFormState, formData: FormData) => {
      if (!currentWorkout) return { error: 'Workout non trouvé' }
      const result = await saveWorkoutComment(currentWorkout.id, athleteId, pathToRevalidate, prevState, formData)
      
      if (!result.error) {
        const savedComment = formData.get('comment')?.toString().trim() || ''
        
        // Mettre à jour le workout local
        const updatedWorkout = {
          ...currentWorkout,
          athlete_comment: savedComment || null,
          athlete_comment_at: savedComment ? new Date().toISOString() : null,
        }
        setCurrentWorkout(updatedWorkout)
        
        // Mettre à jour la référence initiale avec la valeur sauvegardée
        initialCommentRef.current = savedComment
        setHasCommentChanged(false)
        
        // Refresh le cache
        router.refresh()
      }
      
      return result
    },
    {}
  )

  // Vue athlète (US3) : sauvegarde statut + commentaire
  const [statusCommentState, statusCommentAction, statusCommentPending] = useActionState<
    StatusCommentFormState,
    FormData
  >(
    async (prevState: StatusCommentFormState, formData: FormData) => {
      if (!currentWorkout) return { error: 'Workout non trouvé' }
      const result = await saveWorkoutStatusAndComment(
        currentWorkout.id,
        athleteId,
        pathToRevalidate,
        prevState,
        formData
      )
      if (!result.error && result.workout) {
        setCurrentWorkout(result.workout)
        initialCommentRef.current = result.workout.athlete_comment ?? ''
        initialStatusRef.current = (result.workout.status ?? 'planned') as WorkoutStatus
        setStatusSegment(initialStatusRef.current)
        setHasCommentChanged(false)
        const w = result.workout
        const f = w.perceived_feeling != null && w.perceived_feeling >= 1 && w.perceived_feeling <= 5 ? w.perceived_feeling : null
        const i = w.perceived_intensity != null && w.perceived_intensity >= 1 && w.perceived_intensity <= 10 ? w.perceived_intensity : null
        const p = w.perceived_pleasure != null && w.perceived_pleasure >= 1 && w.perceived_pleasure <= 5 ? w.perceived_pleasure : null
        setPerceivedFeeling(f)
        setPerceivedIntensity(i)
        setPerceivedPleasure(p)
        initialFeelingRef.current = f
        initialIntensityRef.current = i
        initialPleasureRef.current = p
        router.refresh()
      }
      return result
    },
    {}
  )

  // Gérer l'affichage du feedback success (approche similaire à ProfileForm)
  const commentSaveFeedbackKey = `${commentState?.success ?? ''}|${commentState?.error ?? ''}|${commentPending}`
  useEffect(() => {
    const justFinishedSubmitting = previousCommentPendingRef.current && !commentPending
    previousCommentPendingRef.current = commentPending
    
    if (commentState?.success && justFinishedSubmitting) {
      setShowCommentSuccess(true)
      
      const timer = setTimeout(() => {
        setShowCommentSuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
    
    if (commentState?.error) {
      setShowCommentSuccess(false)
    }
  }, [commentSaveFeedbackKey])

  /** Vue athlète : affichage succès sauvegarde statut+commentaire puis fermeture (US3). */
  const [showStatusCommentSuccess, setShowStatusCommentSuccess] = useState(false)
  const prevStatusCommentPendingRef = useRef(false)
  const statusCommentFeedbackKey = `${statusCommentState?.success ?? ''}|${statusCommentState?.error ?? ''}|${statusCommentPending}`
  useEffect(() => {
    const justFinished = prevStatusCommentPendingRef.current && !statusCommentPending
    prevStatusCommentPendingRef.current = statusCommentPending
    if (statusCommentState?.success && justFinished) {
      setShowStatusCommentSuccess(true)
      const timer = setTimeout(() => {
        setShowStatusCommentSuccess(false)
        onClose(true, statusCommentState.workout)
      }, 1500)
      return () => clearTimeout(timer)
    }
    if (statusCommentState?.error) setShowStatusCommentSuccess(false)
  }, [statusCommentFeedbackKey])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const openDatePicker = useCallback(() => {
    const rect = dateTriggerRef.current?.getBoundingClientRect()
    if (rect) setDatePickerAnchor(rect)
    setShowDatePickerPopup(true)
  }, [])

  const closeDatePicker = useCallback(() => {
    setShowDatePickerPopup(false)
    setDatePickerAnchor(null)
  }, [])

  useEffect(() => {
    if (!showDatePickerPopup) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDatePicker()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [showDatePickerPopup, closeDatePicker])

  /** Bloc date seul (création / édition coach : à gauche). Ouvre le popover calendrier sous le champ (une seule modale). */
  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'
  const coachDateBlock =
    coachFormNewLayout ? (
      <div
        ref={dateTriggerRef}
        className={`flex items-center gap-2 border border-stone-300 rounded-lg py-2.5 px-4 bg-white focus-within:ring-2 focus-within:ring-palette-forest-dark focus-within:border-transparent transition ${FORM_INPUT_TEXT_SIZE} ${FORM_INPUT_HEIGHT}`}
      >
        <span className="text-sm font-bold text-stone-900 min-w-[10rem]" aria-hidden>
          {formatDateFr(editableDate, true, localeForPicker)}
        </span>
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
      </div>
    ) : null

  /** Popover calendrier : positionné sous le champ date, au-dessus de la modale (z-[110]), pas une 2e modale. */
  const datePickerPopover = (
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
      minDate={toDateStr(new Date())}
      monthDropdownId="workout-date-picker-month"
    />
  )

  /** Badge statut seul (création : à droite). */
  const coachStatusBadge = coachFormNewLayout ? (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge((currentWorkout?.status ?? 'planned') as WorkoutStatus).className}`}>
      {getStatusBadge((currentWorkout?.status ?? 'planned') as WorkoutStatus).label}
    </span>
  ) : null

  /** Titre : séance en lecture seule ; pas de titre en création ni en édition coach (aligné sur création). */
  const modalTitle =
    currentWorkout && (athleteView || coachReadOnly)
      ? currentWorkout.title
      : coachFormNewLayout
        ? undefined
        : isEdit
          ? canEdit
            ? tWorkouts('editWorkout')
            : tWorkouts('myWorkout')
          : tWorkouts('myWorkout')

  /** En-tête coach édition/création : date à gauche. Lecture seule : tuile pill. Sinon (athlète édition) : check. */
  const modalIcon =
    coachFormNewLayout
      ? coachDateBlock
      : (athleteView || coachReadOnly) && currentWorkout && currentWorkout.sport_type in SPORT_ICONS ? (
      (() => {
        const sport = currentWorkout.sport_type as keyof typeof SPORT_ICONS
        const Icon = SPORT_ICONS[sport]
        const styles = sport in SPORT_BADGE_STYLES ? SPORT_BADGE_STYLES[sport as keyof typeof SPORT_BADGE_STYLES] : { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300' }
        const borderClass =
          currentWorkout.sport_type in SPORT_PILL_STYLES
            ? SPORT_PILL_STYLES[currentWorkout.sport_type as keyof typeof SPORT_PILL_STYLES].border
            : 'border-stone-300'
        const label = sport in SPORT_TRANSLATION_KEYS ? tSports(SPORT_TRANSLATION_KEYS[sport as keyof typeof SPORT_TRANSLATION_KEYS]) : currentWorkout.sport_type
        return (
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${borderClass} ${styles.bg} ${styles.text} text-sm font-medium shrink-0 shadow-[0_4px_6px_-1px_rgba(98,126,89,0.2)]`}
            aria-hidden
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span>{label}</span>
          </span>
        )
      })()
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

  /** En-tête modale coach : lecture seule = badge statut à droite ; édition/création = date à gauche (icon) + badge statut à droite. */
  const coachModifiableHeaderRight =
    coachReadOnly && currentWorkout ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge((currentWorkout.status ?? 'planned') as WorkoutStatus).className}`}>
        {getStatusBadge((currentWorkout.status ?? 'planned') as WorkoutStatus).label}
      </span>
    ) : coachFormNewLayout ? (
      coachStatusBadge
    ) : undefined

  const isReadOnlyHeader = (athleteView || coachReadOnly) && currentWorkout

  /** Coach édition/création : date à gauche (iconRaw), pas de titre. */
  const isCoachEditableHeader = coachFormNewLayout

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="workout"
      title={modalTitle}
      icon={modalIcon}
      iconRaw={!!isReadOnlyHeader || !!isCoachEditableHeader}
      titleWrap={!!isReadOnlyHeader}
      headerRight={coachModifiableHeaderRight}
      titleId="workout-modal-title"
      contentClassName="px-0"
      footer={
        canEdit && !coachReadOnly && (
          <div className="w-full">
            {state?.error && (
              <p className="text-sm text-palette-danger mb-3" role="alert">
                {state.error}
              </p>
            )}
            {deleteError && (
              <p className="text-sm text-palette-danger mb-3" role="alert">
                {deleteError}
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
                  loadingText="Suppression…"
                  className="flex-1 min-w-0 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {tWorkouts('deleteWorkout')}
                </Button>
              )}
              <SubmitButton disabled={!isValid || !hasUnsavedChanges} formState={state} showSuccess={showWorkoutSavedFeedback} isSubmitting={isSubmitting} />
            </div>
          </div>
        )
      }
    >
      {athleteView && currentWorkout ? (
        <>
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-4 space-y-5">
              {/* Date seule — sport dans l'en-tête (tuile pill) ; moment si renseigné (US4) */}
              <p className="text-sm font-medium text-stone-600">
                {formatDateFr(date, true, locale === 'fr' ? 'fr-FR' : 'en-US')}
                {currentWorkout.time_of_day ? ` · ${currentWorkout.time_of_day === 'morning' ? tWorkouts('form.timeOfDayMorning') : currentWorkout.time_of_day === 'noon' ? tWorkouts('form.timeOfDayNoon') : tWorkouts('form.timeOfDayEvening')}` : ''}
              </p>
              {/* Objectifs de la séance : métriques avec icônes tuiles + ligne horizontale + description (sans label "Description") */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
                  {tWorkouts('form.sessionGoals')}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm text-stone-700">
                  {currentWorkout.target_duration_minutes != null && currentWorkout.target_duration_minutes > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-stone-400" />
                        {currentWorkout.target_duration_minutes >= 60
                          ? `${Math.floor(currentWorkout.target_duration_minutes / 60)}h${String(currentWorkout.target_duration_minutes % 60).padStart(2, '0')}`
                          : `${currentWorkout.target_duration_minutes} min`}
                      </span>
                      {(currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0) ||
                        (currentWorkout.target_pace != null && currentWorkout.target_pace > 0) ||
                        (currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0) ? (
                        <span className="text-stone-300">·</span>
                      ) : null}
                    </>
                  )}
                  {currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <RulerIcon className="h-4 w-4 text-stone-400" />
                        {currentWorkout.sport_type === 'natation'
                          ? `${Math.round(currentWorkout.target_distance_km * 1000)} m`
                          : `${Number(currentWorkout.target_distance_km) % 1 === 0 ? currentWorkout.target_distance_km : (currentWorkout.target_distance_km as number).toFixed(1)} km`}
                      </span>
                      {(currentWorkout.target_pace != null && currentWorkout.target_pace > 0) ||
                        (currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0) ? (
                        <span className="text-stone-300">·</span>
                      ) : null}
                    </>
                  )}
                  {currentWorkout.target_pace != null && currentWorkout.target_pace > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <LightningIcon className="h-4 w-4 text-stone-400" />
                        {currentWorkout.sport_type === 'course'
                          ? `${currentWorkout.target_pace} min/km`
                          : currentWorkout.sport_type === 'velo'
                            ? `${Math.round(currentWorkout.target_pace)} km/h`
                            : currentWorkout.sport_type === 'natation'
                              ? `${currentWorkout.target_pace} min/100m`
                              : `${currentWorkout.target_pace}`}
                      </span>
                      {currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0 ? (
                        <span className="text-stone-300">·</span>
                      ) : null}
                    </>
                  )}
                  {currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <MountainIcon className="h-4 w-4 text-stone-400" />
                      {currentWorkout.target_elevation_m} m D+
                    </span>
                  )}
                </div>
                {currentWorkout.description?.trim() && (
                  <>
                    <hr className="my-3 border-stone-200" />
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{currentWorkout.description.trim()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Section retour : statut + feedback (ressenti, intensité, plaisir) + commentaire */}
          <form
            action={statusCommentAction}
            className="px-6 py-4 border-t border-stone-100 space-y-4"
          >
            <input type="hidden" name="status" value={statusSegment} />
            <input type="hidden" name="perceived_feeling" value={perceivedFeeling ?? ''} />
            <input type="hidden" name="perceived_intensity" value={perceivedIntensity ?? ''} />
            <input type="hidden" name="perceived_pleasure" value={perceivedPleasure ?? ''} />
            <div className="flex bg-stone-200 p-0.5 rounded-lg" role="group" aria-label={tWorkouts('status.ariaLabel')}>
              {(['planned', 'completed', 'not_completed'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusSegment(value)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition ${
                    statusSegment === value
                      ? 'bg-palette-forest-dark text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tWorkouts(`status.${value}`)}
                </button>
              ))}
            </div>
            {statusSegment === 'completed' && (
              <WorkoutFeedbackSection
                perceivedFeeling={perceivedFeeling}
                perceivedIntensity={perceivedIntensity}
                perceivedPleasure={perceivedPleasure}
                onFeelingChange={setPerceivedFeeling}
                onIntensityChange={setPerceivedIntensity}
                onPleasureChange={setPerceivedPleasure}
                tWorkouts={tWorkouts}
              />
            )}
            <Textarea
              name="comment"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value)
                setHasCommentChanged(e.target.value.trim() !== initialCommentRef.current.trim())
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
              disabled={
                (statusSegment === initialStatusRef.current &&
                  commentText.trim() === initialCommentRef.current.trim() &&
                  perceivedFeeling === initialFeelingRef.current &&
                  perceivedIntensity === initialIntensityRef.current &&
                  perceivedPleasure === initialPleasureRef.current) ||
                statusCommentPending
              }
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
      ) : coachFormNewLayout ? (
      <CoachWorkoutForm
        action={action}
        canEdit={canEdit}
        isEdit={isEdit}
        currentWorkout={currentWorkout}
        workoutStatus={(currentWorkout?.status ?? 'planned') as WorkoutStatus}
        editableDate={editableDate}
        sportType={sportType}
        title={title}
        description={description}
        targetMode={targetMode}
        targetDurationMinutes={targetDurationMinutes}
        targetDistanceKm={targetDistanceKm}
        targetElevationM={targetElevationM}
        targetPace={targetPace}
        showDisabledDistance={showDisabledDistance}
        showDisabledDuration={showDisabledDuration}
        hasTimeDistanceChoice={hasTimeDistanceChoice}
        hasElevation={hasElevation}
        isTimeOnly={isTimeOnly}
        workoutSportTypes={WORKOUT_SPORT_TYPES}
        onSportChange={(sport) => workoutForm.setValue('sportType', sport)}
        onTitleChange={(value) => workoutForm.setValue('title', value)}
        onDescriptionChange={(value) => workoutForm.setValue('description', value)}
        onTargetModeChange={(mode) => workoutForm.setTargetMode(mode)}
        onTargetDurationChange={(value) => workoutForm.setValue('targetDurationMinutes', value)}
        onTargetDistanceChange={(value) => workoutForm.setValue('targetDistanceKm', value)}
        onTargetElevationChange={(value) => workoutForm.setValue('targetElevationM', value)}
        onTargetPaceChange={(value) => workoutForm.setValue('targetPace', value)}
        timeOfDaySegment={timeOfDaySegment ?? ''}
        onTimeOfDayChange={(value) =>
          workoutForm.setValue('timeOfDaySegment', (value || null) as WorkoutTimeOfDay | null)
        }
        tWorkouts={tWorkouts}
        onSubmit={() => {
          isSubmittingRef.current = true
          setIsSubmitting(true)
        }}
      />
      ) : coachReadOnly && currentWorkout ? (
      /* US5 : modale coach lecture seule — titre = titre séance, sport dans l'en-tête (tuile pill) */
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 py-4 space-y-5">
          {/* Date seule — sport dans l'en-tête ; moment si renseigné (US4) */}
          <p className="text-sm font-medium text-stone-600">
            {formatDateFr(currentWorkout.date, true, locale === 'fr' ? 'fr-FR' : 'en-US')}
            {currentWorkout.time_of_day ? ` · ${currentWorkout.time_of_day === 'morning' ? tWorkouts('form.timeOfDayMorning') : currentWorkout.time_of_day === 'noon' ? tWorkouts('form.timeOfDayNoon') : tWorkouts('form.timeOfDayEvening')}` : ''}
          </p>
          {/* Objectifs de la séance : métriques avec icônes + ligne horizontale + description */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">
              {tWorkouts('form.sessionGoals')}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-sm text-stone-700">
              {currentWorkout.target_duration_minutes != null && currentWorkout.target_duration_minutes > 0 && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-4 w-4 text-stone-400" />
                    {currentWorkout.target_duration_minutes >= 60
                      ? `${Math.floor(currentWorkout.target_duration_minutes / 60)}h${String(currentWorkout.target_duration_minutes % 60).padStart(2, '0')}`
                      : `${currentWorkout.target_duration_minutes} min`}
                  </span>
                  {(currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0) ||
                    (currentWorkout.target_pace != null && currentWorkout.target_pace > 0) ||
                    (currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0) ? (
                    <span className="text-stone-300">·</span>
                  ) : null}
                </>
              )}
              {currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0 && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <RulerIcon className="h-4 w-4 text-stone-400" />
                    {currentWorkout.sport_type === 'natation'
                      ? `${Math.round(currentWorkout.target_distance_km * 1000)} m`
                      : `${Number(currentWorkout.target_distance_km) % 1 === 0 ? currentWorkout.target_distance_km : (currentWorkout.target_distance_km as number).toFixed(1)} km`}
                  </span>
                  {(currentWorkout.target_pace != null && currentWorkout.target_pace > 0) ||
                    (currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0) ? (
                    <span className="text-stone-300">·</span>
                  ) : null}
                </>
              )}
              {currentWorkout.target_pace != null && currentWorkout.target_pace > 0 && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <LightningIcon className="h-4 w-4 text-stone-400" />
                    {currentWorkout.sport_type === 'course'
                      ? `${currentWorkout.target_pace} min/km`
                      : currentWorkout.sport_type === 'velo'
                        ? `${Math.round(currentWorkout.target_pace)} km/h`
                        : currentWorkout.sport_type === 'natation'
                          ? `${currentWorkout.target_pace} min/100m`
                          : `${currentWorkout.target_pace}`}
                  </span>
                  {currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0 ? (
                    <span className="text-stone-300">·</span>
                  ) : null}
                </>
              )}
              {currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0 && (
                <span className="inline-flex items-center gap-1">
                  <MountainIcon className="h-4 w-4 text-stone-400" />
                  {currentWorkout.target_elevation_m} m D+
                </span>
              )}
            </div>
            {currentWorkout.description?.trim() ? (
              <>
                <hr className="my-3 border-stone-200" />
                <p className="text-sm text-stone-600 whitespace-pre-wrap">{currentWorkout.description.trim()}</p>
              </>
            ) : null}
          </div>
          {/* Retour athlète (ressenti, intensité, plaisir) — lecture seule coach */}
          {(currentWorkout.perceived_feeling != null || currentWorkout.perceived_intensity != null || currentWorkout.perceived_pleasure != null) && (
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <h3 className="text-base font-semibold text-stone-800">{tWorkouts('feedback.sectionTitle')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {currentWorkout.perceived_feeling != null && currentWorkout.perceived_feeling >= 1 && currentWorkout.perceived_feeling <= 5 ? (
                    <>
                      {(() => {
                        const Icon = FEELING_ICONS_READONLY[currentWorkout.perceived_feeling - 1]
                        return <Icon className="h-5 w-5 text-stone-600 shrink-0" strokeWidth={2} aria-hidden />
                      })()}
                      <span className="text-stone-700">{tWorkouts(`feedback.feelingScale.${currentWorkout.perceived_feeling}` as 'feedback.feelingScale.1')}</span>
                    </>
                  ) : (
                    <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentWorkout.perceived_intensity != null && currentWorkout.perceived_intensity >= 1 && currentWorkout.perceived_intensity <= 10 ? (
                    <span className="text-stone-700">{tWorkouts('feedback.intensityLabel')} {currentWorkout.perceived_intensity}/10</span>
                  ) : (
                    <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentWorkout.perceived_pleasure != null && currentWorkout.perceived_pleasure >= 1 && currentWorkout.perceived_pleasure <= 5 ? (
                    <>
                      {(() => {
                        const Icon = FEELING_ICONS_READONLY[currentWorkout.perceived_pleasure - 1]
                        return <Icon className="h-5 w-5 text-stone-600 shrink-0" strokeWidth={2} aria-hidden />
                      })()}
                      <span className="text-stone-700">{tWorkouts(`feedback.pleasureScale.${currentWorkout.perceived_pleasure}` as 'feedback.pleasureScale.1')}</span>
                    </>
                  ) : (
                    <span className="text-stone-500">{tWorkouts('feedback.notSet')}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Commentaire de l'athlète */}
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
              {currentWorkout.athlete_comment?.trim() ? currentWorkout.athlete_comment : tWorkouts('comments.noComment')}
            </p>
          </div>
        </div>
      </div>
      ) : (
      <form
        id="workout-form"
        action={action}
        className={`flex flex-col flex-1 min-h-0 ${!canEdit ? 'select-none' : ''}`}
        onSubmit={(e) => {
          if (!canEdit) {
            e.preventDefault()
            return
          }
          isSubmittingRef.current = true
          setIsSubmitting(true)
        }}
      >
        <input type="hidden" name="date" value={date} />
        {isEdit && <input type="hidden" name="workout_id" value={currentWorkout?.id} />}

          <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4 space-y-5">
          <p className="text-sm font-medium text-stone-600">
            {formatDateFr(date, true, locale === 'fr' ? 'fr-FR' : 'en-US')}
          </p>

          <div>
            {canEdit && (
              <span className="block text-sm font-medium text-stone-700 mb-2">
                {tWorkouts('form.sportType')}
              </span>
            )}
            <input type="hidden" name="sport_type" value={sportType} />
            {canEdit ? (
              <div className="grid grid-cols-4 gap-2" role="group" aria-label={tWorkouts('form.sportType')}>
                {WORKOUT_SPORT_TYPES.map((sport) => {
                  const selected = sportType === sport
                  const Icon = SPORT_ICONS[sport as keyof typeof SPORT_ICONS]
                  const translationKey = SPORT_TRANSLATION_KEYS[sport as keyof typeof SPORT_TRANSLATION_KEYS]
                  const label = translationKey ? tSports(translationKey) : sport
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => workoutForm.setValue('sportType', sport)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 px-2 transition text-center min-h-[72px] ${
                        selected
                          ? 'border-palette-forest-dark bg-palette-forest-dark/10 text-palette-forest-dark font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-8 h-8 shrink-0" aria-hidden />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              (() => {
                if (!(sportType in SPORT_ICONS)) return null
                const Icon = SPORT_ICONS[sportType as keyof typeof SPORT_ICONS]
                const translationKey = SPORT_TRANSLATION_KEYS[sportType as keyof typeof SPORT_TRANSLATION_KEYS]
                const label = translationKey ? tSports(translationKey) : sportType
                return (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-palette-forest-dark bg-palette-forest-dark/10 text-palette-forest-dark font-semibold py-3 px-4 min-h-[72px] w-fit">
                    <Icon className="w-8 h-8 shrink-0" aria-hidden />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                )
              })()
            )}
          </div>

          {/* Objectifs de la séance — Design avec titre à gauche, toggle à droite, grille 2x2 */}
          {(canEdit || (currentWorkout && (currentWorkout.target_duration_minutes != null || currentWorkout.target_distance_km != null))) && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              {/* En-tête avec titre et toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  {tWorkouts('form.sessionGoals')}
                </div>
                {canEdit && hasTimeDistanceChoice && (
                  <div className="flex bg-stone-200 p-0.5 rounded-lg">
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="time" checked={targetMode === 'time'} onChange={() => workoutForm.setTargetMode('time')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'time' ? 'bg-palette-forest-dark text-white shadow-sm' : 'text-stone-600'}`}>
                        {tWorkouts('form.targetMode.time')}
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="distance" checked={targetMode === 'distance'} onChange={() => workoutForm.setTargetMode('distance')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'distance' ? 'bg-palette-forest-dark text-white shadow-sm' : 'text-stone-600'}`}>
                        {tWorkouts('form.targetMode.distance')}
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {!canEdit && currentWorkout && (currentWorkout.target_duration_minutes != null || currentWorkout.target_distance_km != null) && (
                <p className="text-sm text-stone-600">
                  {currentWorkout.target_duration_minutes != null && currentWorkout.target_duration_minutes > 0 && (
                    <span>{currentWorkout.target_duration_minutes} min</span>
                  )}
                  {currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0 && (
                    <span>{currentWorkout.target_duration_minutes != null && currentWorkout.target_duration_minutes > 0 ? ' · ' : ''}{currentWorkout.sport_type === 'natation' ? `${Math.round(currentWorkout.target_distance_km * 1000)} m` : `${currentWorkout.target_distance_km} km`}</span>
                  )}
                  {currentWorkout.target_elevation_m != null && currentWorkout.target_elevation_m > 0 && (
                    <span> · {currentWorkout.target_elevation_m} m D+</span>
                  )}
                </p>
              )}

              {canEdit && (
                <>
                  {isTimeOnly && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          id="target_duration_musc"
                          name="target_duration_minutes"
                          type="number"
                          min={1}
                          value={targetDurationMinutes}
                          onChange={(e) => workoutForm.setValue('targetDurationMinutes', e.target.value)}
                          onWheel={preventWheelNumberChange}
                          placeholder="22"
                          className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.durationUnit')}</span>
                        </div>
                        <input type="hidden" name="target_distance_km" value="" />
                        <input type="hidden" name="target_elevation_m" value="" />
                      </div>
                      <div></div>
                    </div>
                  )}

                  {hasTimeDistanceChoice && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Distance (haut gauche) */}
                      <div className="relative">
                        {sportType === 'natation' ? (
                          <>
                            <input
                              id="target_distance"
                              type="number"
                              min={0}
                              step={1}
                              value={targetMode === 'time' ? (showDisabledDistance && targetDistanceKm ? String(Math.round(Number(targetDistanceKm) * 1000)) : '') : (targetDistanceKm ? String(Math.round(Number(targetDistanceKm) * 1000)) : '')}
                              onChange={(e) => workoutForm.setValue('targetDistanceKm', e.target.value ? String(Number(e.target.value) / 1000) : '')}
                              onWheel={preventWheelNumberChange}
                              placeholder={targetMode === 'time' ? '' : '1500'}
                              disabled={targetMode === 'time'}
                              className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-10 ${
                                targetMode === 'time' 
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                                  : 'bg-white text-stone-900'
                              }`}
                            />
                            <input type="hidden" name="target_distance_km" value={targetMode === 'distance' ? targetDistanceKm : (showDisabledDistance ? targetDistanceKm : '')} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className={`text-xs font-normal ${targetMode === 'time' ? 'text-stone-300' : 'text-stone-400'}`}>m</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <input
                              id="target_distance"
                              name="target_distance_km"
                              type="number"
                              min={0}
                              step={0.1}
                              value={showDisabledDistance ? targetDistanceKm : (targetMode === 'time' ? '' : targetDistanceKm)}
                              onChange={(e) => workoutForm.setValue('targetDistanceKm', e.target.value)}
                              onWheel={preventWheelNumberChange}
                              placeholder={targetMode === 'time' ? '' : '14,3'}
                              disabled={targetMode === 'time'}
                              className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-10 ${
                                targetMode === 'time' 
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                                  : 'bg-white text-stone-900'
                              }`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className={`text-xs font-normal ${targetMode === 'time' ? 'text-stone-300' : 'text-stone-400'}`}>{tWorkouts('form.distanceUnitKm')}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Temps (haut droite) */}
                      <div className="relative">
                        <input
                          id="target_duration"
                          name="target_duration_minutes"
                          type="number"
                          min={1}
                          value={showDisabledDuration ? targetDurationMinutes : (targetMode === 'distance' ? '' : targetDurationMinutes)}
                          onChange={(e) => workoutForm.setValue('targetDurationMinutes', e.target.value)}
                          onWheel={preventWheelNumberChange}
                          placeholder={targetMode === 'distance' ? '' : '22'}
                          disabled={targetMode === 'distance'}
                          className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-12 ${
                            targetMode === 'distance' 
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                              : 'bg-white text-stone-900'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className={`text-xs font-normal ${targetMode === 'distance' ? 'text-stone-300' : 'text-stone-400'}`}>{tWorkouts('form.durationUnit')}</span>
                        </div>
                        <input type="hidden" name="target_duration_minutes" value={targetMode === 'time' ? targetDurationMinutes : (showDisabledDuration ? targetDurationMinutes : '')} />
                        <input type="hidden" name="target_distance_km" value={targetMode === 'distance' ? targetDistanceKm : (showDisabledDistance ? targetDistanceKm : '')} />
                        <input type="hidden" name="target_elevation_m" value={hasElevation ? targetElevationM : ''} />
                      </div>

                      {/* {tWorkouts('form.elevation')} (bas gauche) */}
                      {hasElevation ? (
                        <div className="relative">
                          <input
                            id="target_elevation"
                            name="target_elevation_m"
                            type="number"
                            min={0}
                            value={targetElevationM}
                            onChange={(e) => workoutForm.setValue('targetElevationM', e.target.value)}
                            onWheel={preventWheelNumberChange}
                            placeholder="200"
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-14"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xs font-normal">{tWorkouts('form.elevationUnit')}</span>
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}

                      {/* Vitesse (bas droite) */}
                      {hasTimeDistanceChoice && (
                        <div className="relative">
                          <input
                            id="target_pace"
                            name="target_pace"
                            type="number"
                            min={0}
                            step={sportType === 'velo' ? 1 : 0.1}
                            value={targetPace}
                            onChange={(e) => workoutForm.setValue('targetPace', e.target.value)}
                            onWheel={preventWheelNumberChange}
                            placeholder={sportType === 'course' ? '5.0' : sportType === 'velo' ? '39' : '2.0'}
                            title={tCommon('paceRequiredHint')}
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-16"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xs font-normal">
                              {sportType === 'course' ? tWorkouts('form.paceUnitRunning') : sportType === 'velo' ? tWorkouts('form.paceUnitCycling') : tWorkouts('form.paceUnitSwimming')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <Input
            id="title"
            label={tWorkouts('form.title')}
            name="title"
            type="text"
            value={title}
            onChange={(e) => workoutForm.setValue('title', e.target.value)}
            required
            disabled={!canEdit}
            placeholder={tWorkouts('form.titlePlaceholder')}
          />

          {(canEdit || description.trim()) && (
            <Textarea
              id="description"
              label={canEdit ? tWorkouts('form.description') : tWorkouts('form.description')}
              name="description"
              value={description}
              onChange={(e) => workoutForm.setValue('description', e.target.value)}
              disabled={!canEdit}
              rows={4}
              placeholder={tWorkouts('form.descriptionPlaceholder')}
            />
          )}

          {(state?.error || state?.success) && (
            <p
              className={`text-sm ${state.error ? 'text-palette-danger-dark' : 'text-palette-forest-dark font-medium'}`}
              role="alert"
            >
              {state.error || state.success}
            </p>
          )}

          {currentWorkout && canEdit && (
            <div className="border-t border-stone-100 mt-6">
              <div className="pt-4 pb-2 flex items-center gap-3">
                <div className="p-2 bg-stone-200/80 rounded-full text-stone-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{tWorkouts('comments.athleteComment')}</h3>
              </div>
              <div className="pt-2 pb-4">
                {(currentWorkout?.athlete_comment ?? null) ? (
                  <p className="text-sm text-stone-600 whitespace-pre-wrap">
                    {currentWorkout.athlete_comment}
                  </p>
                ) : (
                  <p className="text-sm text-stone-500">{tWorkouts('comments.noComment')}</p>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </form>
      )}
    </Modal>
    {datePickerPopover}
    </>
  )
}
