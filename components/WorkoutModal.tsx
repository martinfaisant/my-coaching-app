'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createWorkout,
  updateWorkout,
  deleteWorkout,
  saveWorkoutComment,
  type WorkoutFormState,
  type CommentFormState,
} from '@/app/dashboard/workouts/actions'
import type { SportType, Workout } from '@/types/database'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/sportStyles'
import { formatDateFr } from '@/lib/dateUtils'

/** Sports pour entraînement (sous-ensemble du calendrier). */
const WORKOUT_SPORT_TYPES: SportType[] = ['course', 'velo', 'natation', 'musculation']

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
  return (
    <Button
      type="submit"
      form="workout-form"
      variant="primaryDark"
      disabled={disabled || pending || isSubmitting}
      loading={pending || isSubmitting}
      loadingText="Enregistrement…"
      success={showSuccess}
      error={!!formState?.error}
      className="flex-1 min-w-0"
    >
      Enregistrer
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
  
  return (
    <Button
      type="submit"
      variant="primaryDark"
      disabled={!hasChanges || pending}
      loading={pending}
      loadingText="Enregistrement…"
      success={showSuccess}
      className="shrink-0"
    >
      Enregistrer
    </Button>
  )
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
  const router = useRouter()
  // 🔧 FIX: Stocker le workout localement pour pouvoir le mettre à jour après sauvegarde du commentaire
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(workout ?? null)
  const [sportType, setSportType] = useState<SportType>('course')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetMode, setTargetMode] = useState<TargetMode>('time')
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<string>('')
  const [targetDistanceKm, setTargetDistanceKm] = useState<string>('')
  const [targetElevationM, setTargetElevationM] = useState<string>('')
  const [targetPace, setTargetPace] = useState<string>('')
  const [commentText, setCommentText] = useState('')
  const initialCommentRef = useRef<string>('')
  const [hasCommentChanged, setHasCommentChanged] = useState(false)
  const [showCommentSuccess, setShowCommentSuccess] = useState(false)
  const previousCommentPendingRef = useRef(false)
  const workoutJustLoadedRef = useRef(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  // Pattern standard pour le bouton "Enregistrer" du formulaire workout
  const [showWorkoutSavedFeedback, setShowWorkoutSavedFeedback] = useState(false)
  const previousWorkoutSubmittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialWorkoutValuesRef = useRef<{
    sportType: string
    title: string
    description: string
    targetDurationMinutes: string
    targetDistanceKm: string
    targetElevationM: string
    targetPace: string
  } | null>(null)

  const isEdit = !!currentWorkout
  const hasTimeDistanceChoice = sportType === 'course' || sportType === 'velo' || sportType === 'natation'
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
      workoutJustLoadedRef.current = true
      setSportType(currentWorkout.sport_type)
      setTitle(currentWorkout.title)
      setDescription(currentWorkout.description)
      const durationStr = currentWorkout.target_duration_minutes != null ? String(currentWorkout.target_duration_minutes) : ''
      const distanceStr = currentWorkout.target_distance_km != null ? String(currentWorkout.target_distance_km) : ''
      const elevationStr = currentWorkout.target_elevation_m != null ? String(currentWorkout.target_elevation_m) : ''
      const paceStr = currentWorkout.target_pace != null ? String(currentWorkout.target_pace) : ''
      setTargetDurationMinutes(durationStr)
      setTargetDistanceKm(distanceStr)
      setTargetElevationM(elevationStr)
      setTargetPace(paceStr)
      setTargetMode(
        currentWorkout.target_distance_km != null && currentWorkout.target_distance_km > 0 ? 'distance' : 'time'
      )
      // Stocker les valeurs initiales pour détecter les modifications
      initialWorkoutValuesRef.current = {
        sportType: currentWorkout.sport_type,
        title: currentWorkout.title,
        description: currentWorkout.description,
        targetDurationMinutes: durationStr,
        targetDistanceKm: distanceStr,
        targetElevationM: elevationStr,
        targetPace: paceStr,
      }
      setHasUnsavedChanges(false)
      const initialComment = currentWorkout.athlete_comment ?? ''
      setCommentText(initialComment)
      initialCommentRef.current = initialComment
      setHasCommentChanged(false)
    } else {
      setSportType('course')
      setTitle('')
      setDescription('')
      setTargetMode('time')
      setTargetDurationMinutes('')
      setTargetDistanceKm('')
      setTargetElevationM('')
      setTargetPace('')
      initialWorkoutValuesRef.current = {
        sportType: 'course',
        title: '',
        description: '',
        targetDurationMinutes: '',
        targetDistanceKm: '',
        targetElevationM: '',
        targetPace: '',
      }
      setHasUnsavedChanges(false)
      setCommentText('')
      initialCommentRef.current = ''
      setHasCommentChanged(false)
    }
    if (!isOpen) {
      setDeleteError(null)
    }
  }, [currentWorkout, isOpen])

  useEffect(() => {
    if (sportType === 'musculation') setTargetMode('time')
  }, [sportType])

  // Calcul automatique avec la vitesse : ne remplir le champ non sélectionnable que si les deux autres (temps ou distance + vitesse) sont complétés
  useEffect(() => {
    if (!hasTimeDistanceChoice) return

    const paceOk = targetPace && Number(targetPace) > 0
    const pace = paceOk ? Number(targetPace) : 0
    const skipClear = workoutJustLoadedRef.current

    if (targetMode === 'distance') {
      // Champ désactivé = durée. Remplir seulement si distance ET vitesse sont renseignés
      if (targetDistanceKm && Number(targetDistanceKm) > 0 && paceOk) {
        workoutJustLoadedRef.current = false
        if (sportType === 'course') {
          const distance = Number(targetDistanceKm)
          setTargetDurationMinutes(String(Math.round(distance * pace)))
        } else if (sportType === 'velo') {
          const distance = Number(targetDistanceKm)
          const durationMinutes = (distance / pace) * 60
          setTargetDurationMinutes(String(Math.round(durationMinutes)))
        } else if (sportType === 'natation') {
          const distanceM = Number(targetDistanceKm) * 1000
          setTargetDurationMinutes(String(Math.round((distanceM / 100) * pace)))
        }
      } else if (!skipClear && (!targetDistanceKm || !paceOk)) {
        setTargetDurationMinutes('')
      }
    } else {
      // targetMode === 'time' : champ désactivé = distance. Remplir seulement si durée ET vitesse sont renseignés
      if (targetDurationMinutes && Number(targetDurationMinutes) > 0 && paceOk) {
        workoutJustLoadedRef.current = false
        if (sportType === 'course') {
          const duration = Number(targetDurationMinutes)
          setTargetDistanceKm((duration / pace).toFixed(2))
        } else if (sportType === 'velo') {
          const durationMinutes = Number(targetDurationMinutes)
          setTargetDistanceKm(((durationMinutes / 60) * pace).toFixed(2))
        } else if (sportType === 'natation') {
          const duration = Number(targetDurationMinutes)
          const distanceKm = ((duration / pace) * 100) / 1000
          setTargetDistanceKm(distanceKm.toFixed(3))
        }
      } else if (!skipClear && (!targetDurationMinutes || !paceOk)) {
        setTargetDistanceKm('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPace, targetMode, sportType, hasTimeDistanceChoice, targetDistanceKm, targetDurationMinutes])

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
    if (!confirm('Supprimer cet entraînement ? Cette action est irréversible.')) return
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
      // Réinitialiser hasUnsavedChanges après succès
      setHasUnsavedChanges(false)
      
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
  
  // Détecter les modifications pour activer/désactiver le bouton
  useEffect(() => {
    if (!initialWorkoutValuesRef.current) {
      setHasUnsavedChanges(false)
      return
    }
    
    const initial = initialWorkoutValuesRef.current
    const hasChanges = 
      sportType !== initial.sportType ||
      title !== initial.title ||
      description !== initial.description ||
      targetDurationMinutes !== initial.targetDurationMinutes ||
      targetDistanceKm !== initial.targetDistanceKm ||
      targetElevationM !== initial.targetElevationM ||
      targetPace !== initial.targetPace
    
    setHasUnsavedChanges(hasChanges)
  }, [sportType, title, description, targetDurationMinutes, targetDistanceKm, targetElevationM, targetPace])

  // Fermeture immédiate si erreur (pas de délai)
  useEffect(() => {
    if (state?.error && !workoutPending) {
      // L'erreur sera affichée dans le footer, pas besoin de fermer
    }
    // onClose volontairement omis des deps pour éviter une boucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.error, workoutPending])

  // State pour la sauvegarde du commentaire avec useActionState
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

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const modalTitle = isEdit
    ? athleteView
      ? 'Mon entrainement'
      : canEdit
        ? "Modifier l'entraînement"
        : 'Votre entraînement'
    : 'Nouvel entraînement'

  const modalIcon = (
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={modalTitle}
      icon={modalIcon}
      titleId="workout-modal-title"
      contentClassName="px-0"
      footer={
        canEdit && (
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
                  Supprimer
                </Button>
              )}
              <SubmitButton disabled={!isValid || !hasUnsavedChanges} formState={state} showSuccess={showWorkoutSavedFeedback} isSubmitting={isSubmitting} />
            </div>
          </div>
        )
      }
    >
      <form
        id="workout-form"
        action={action}
        className={`flex flex-col flex-1 min-h-0 ${!canEdit ? 'select-none' : ''}`}
        onSubmit={(e) => {
          if (!canEdit) {
            e.preventDefault()
            return
          }
          // Marquer comme en cours de soumission
          isSubmittingRef.current = true
          setIsSubmitting(true)
        }}
      >
        <input type="hidden" name="date" value={date} />
        {isEdit && <input type="hidden" name="workout_id" value={currentWorkout?.id} />}

          <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4 space-y-5">
          <p className="text-sm font-medium text-stone-600">
            {formatDateFr(date, true)}
          </p>

          <div>
            {canEdit && (
              <span className="block text-sm font-medium text-stone-700 mb-2">
                Type de sport
              </span>
            )}
            <input type="hidden" name="sport_type" value={sportType} />
            {canEdit ? (
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Type de sport">
                {WORKOUT_SPORT_TYPES.map((sport) => {
                  const selected = sportType === sport
                  const Icon = SPORT_ICONS[sport as keyof typeof SPORT_ICONS]
                  const label = SPORT_LABELS[sport as keyof typeof SPORT_LABELS] ?? sport
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => setSportType(sport)}
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
                const label = SPORT_LABELS[sportType as keyof typeof SPORT_LABELS] ?? sportType
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
                  OBJECTIFS DE LA SÉANCE
                </div>
                {canEdit && hasTimeDistanceChoice && (
                  <div className="flex bg-stone-200 p-0.5 rounded-lg">
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="time" checked={targetMode === 'time'} onChange={() => setTargetMode('time')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'time' ? 'bg-palette-forest-dark text-white shadow-sm' : 'text-stone-600'}`}>
                        Temps
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="distance" checked={targetMode === 'distance'} onChange={() => setTargetMode('distance')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'distance' ? 'bg-palette-forest-dark text-white shadow-sm' : 'text-stone-600'}`}>
                        Distance
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
                          onChange={(e) => setTargetDurationMinutes(e.target.value)}
                          placeholder="22"
                          className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-stone-400 text-xs font-normal">min</span>
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
                              onChange={(e) => setTargetDistanceKm(e.target.value ? String(Number(e.target.value) / 1000) : '')}
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
                              onChange={(e) => setTargetDistanceKm(e.target.value)}
                              placeholder={targetMode === 'time' ? '' : '14,3'}
                              disabled={targetMode === 'time'}
                              className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-10 ${
                                targetMode === 'time' 
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                                  : 'bg-white text-stone-900'
                              }`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className={`text-xs font-normal ${targetMode === 'time' ? 'text-stone-300' : 'text-stone-400'}`}>km</span>
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
                          onChange={(e) => setTargetDurationMinutes(e.target.value)}
                          placeholder={targetMode === 'distance' ? '' : '22'}
                          disabled={targetMode === 'distance'}
                          className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-12 ${
                            targetMode === 'distance' 
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                              : 'bg-white text-stone-900'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className={`text-xs font-normal ${targetMode === 'distance' ? 'text-stone-300' : 'text-stone-400'}`}>min</span>
                        </div>
                        <input type="hidden" name="target_duration_minutes" value={targetMode === 'time' ? targetDurationMinutes : (showDisabledDuration ? targetDurationMinutes : '')} />
                        <input type="hidden" name="target_distance_km" value={targetMode === 'distance' ? targetDistanceKm : (showDisabledDistance ? targetDistanceKm : '')} />
                        <input type="hidden" name="target_elevation_m" value={hasElevation ? targetElevationM : ''} />
                      </div>

                      {/* Dénivelé (bas gauche) */}
                      {hasElevation ? (
                        <div className="relative">
                          <input
                            id="target_elevation"
                            name="target_elevation_m"
                            type="number"
                            min={0}
                            value={targetElevationM}
                            onChange={(e) => setTargetElevationM(e.target.value)}
                            placeholder="200"
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-14"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xs font-normal">m D+</span>
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
                            onChange={(e) => setTargetPace(e.target.value)}
                            placeholder={sportType === 'course' ? '5.0' : sportType === 'velo' ? '39' : '2.0'}
                            title="Obligatoire pour course, vélo et natation"
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-16"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xs font-normal">
                              {sportType === 'course' ? 'min/km' : sportType === 'velo' ? 'km/h' : 'min/100m'}
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
            label="Titre de l'exercice"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={!canEdit}
            placeholder="Ex. Footing 45 min"
          />

          {(canEdit || description.trim()) && (
            <Textarea
              id="description"
              label={canEdit ? 'Description (facultatif)' : 'Description'}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
              rows={4}
              placeholder="Détails de l'entraînement..."
            />
          )}

          {(state?.error || state?.success) && (
            <p
              className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark font-medium'}`}
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
                <h3 className="text-lg font-bold text-stone-900">Commentaire de l'athlète</h3>
              </div>
              <div className="pt-2 pb-4">
                {(currentWorkout?.athlete_comment ?? null) ? (
                  <p className="text-sm text-stone-600 whitespace-pre-wrap">
                    {currentWorkout.athlete_comment}
                  </p>
                ) : (
                  <p className="text-sm text-stone-500">Aucun commentaire.</p>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </form>

      {/* Formulaire séparé pour le commentaire de l'athlète */}
      {currentWorkout && !canEdit && (
        <form action={commentAction} className="px-6 py-4 border-t border-stone-100">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
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
              <h3 className="text-lg font-bold text-stone-900">Votre commentaire</h3>
            </div>
            <CommentSubmitButton formState={commentState} hasChanges={hasCommentChanged} showSuccess={showCommentSuccess} />
          </div>
          <div>
            <Textarea
              name="comment"
              value={commentText}
              onChange={(e) => {
                const newValue = e.target.value
                setCommentText(newValue)
                const changed = newValue.trim() !== initialCommentRef.current.trim()
                setHasCommentChanged(changed)
                
                // Réinitialiser le success quand on modifie
                if (showCommentSuccess) {
                  setShowCommentSuccess(false)
                }
              }}
              rows={3}
              placeholder="Saisissez votre commentaire..."
              className="rounded-xl py-3 min-h-0"
              aria-label="Votre commentaire"
            />
            {commentState?.error && (
              <p className="text-sm text-palette-danger mt-2" role="alert">
                {commentState.error}
              </p>
            )}
            {commentState?.success && (
              <p className="text-sm text-palette-forest-dark font-medium mt-2">
                Commentaire enregistré.
              </p>
            )}
          </div>
        </form>
      )}
    </Modal>
  )
}
