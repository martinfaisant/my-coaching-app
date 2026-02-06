'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useActionState } from 'react'
import {
  createWorkout,
  updateWorkout,
  saveWorkoutComment,
  type WorkoutFormState,
  type CommentFormState,
} from '@/app/dashboard/workouts/actions'
import { PrimaryButton } from '@/components/PrimaryButton'
import type { SportType, Workout } from '@/types/database'

const SPORT_OPTIONS: { value: SportType; label: string }[] = [
  { value: 'course', label: 'Course' },
  { value: 'musculation', label: 'Musculation' },
  { value: 'natation', label: 'Natation' },
  { value: 'velo', label: 'Vélo' },
]

/** Course et vélo : choix temps ou distance + dénivelé facultatif. Musculation : temps. Natation : temps ou distance. */
type TargetMode = 'time' | 'distance'

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const s = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type WorkoutModalProps = {
  isOpen: boolean
  onClose: (closedBySuccess?: boolean) => void
  date: string
  athleteId: string
  pathToRevalidate: string
  canEdit: boolean
  workout?: Workout | null
}

export function WorkoutModal({
  isOpen,
  onClose,
  date,
  athleteId,
  pathToRevalidate,
  canEdit,
  workout,
}: WorkoutModalProps) {
  const [sportType, setSportType] = useState<SportType>('course')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetMode, setTargetMode] = useState<TargetMode>('time')
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<string>('')
  const [targetDistanceKm, setTargetDistanceKm] = useState<string>('')
  const [targetElevationM, setTargetElevationM] = useState<string>('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState('')

  const isEdit = !!workout
  const hasTimeDistanceChoice = sportType === 'course' || sportType === 'velo' || sportType === 'natation'
  const hasElevation = sportType === 'course' || sportType === 'velo'
  const isTimeOnly = sportType === 'musculation'

  const isValid =
    sportType &&
    title.trim() &&
    description.trim() &&
    (isTimeOnly
      ? targetDurationMinutes.trim() !== '' && Number(targetDurationMinutes) > 0
      : targetMode === 'time'
        ? targetDurationMinutes.trim() !== '' && Number(targetDurationMinutes) > 0
        : targetDistanceKm.trim() !== '' && Number(targetDistanceKm) > 0)

  useEffect(() => {
    if (workout) {
      setSportType(workout.sport_type)
      setTitle(workout.title)
      setDescription(workout.description)
      setTargetDurationMinutes(workout.target_duration_minutes != null ? String(workout.target_duration_minutes) : '')
      setTargetDistanceKm(workout.target_distance_km != null ? String(workout.target_distance_km) : '')
      setTargetElevationM(workout.target_elevation_m != null ? String(workout.target_elevation_m) : '')
      setTargetMode(
        workout.target_distance_km != null && workout.target_distance_km > 0 ? 'distance' : 'time'
      )
      setCommentText(workout.athlete_comment ?? '')
    } else {
      setSportType('course')
      setTitle('')
      setDescription('')
      setTargetMode('time')
      setTargetDurationMinutes('')
      setTargetDistanceKm('')
      setTargetElevationM('')
      setCommentText('')
    }
    if (!isOpen) setShowCommentForm(false)
  }, [workout, isOpen])

  useEffect(() => {
    if (sportType === 'musculation') setTargetMode('time')
  }, [sportType])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const [createState, createAction] = useActionState<WorkoutFormState, FormData>(
    (_, fd) => createWorkout(athleteId, pathToRevalidate, {}, fd),
    {}
  )
  const [updateState, updateAction] = useActionState<WorkoutFormState, FormData>(
    (_, fd) =>
      workout
        ? updateWorkout(workout.id, athleteId, pathToRevalidate, {}, fd)
        : Promise.resolve({}),
    {}
  )
  const [commentState, commentAction] = useActionState<CommentFormState, FormData>(
    (_, fd) =>
      workout
        ? saveWorkoutComment(workout.id, athleteId, pathToRevalidate, {}, fd)
        : Promise.resolve({}),
    {}
  )

  const state = isEdit ? updateState : createState
  const action = isEdit ? updateAction : createAction

  useEffect(() => {
    if (state?.success) onClose(true)
    // onClose volontairement omis des deps pour éviter une boucle (référence change à chaque rendu du parent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success])

  useEffect(() => {
    if (commentState?.success) {
      setShowCommentForm(false)
      onClose(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentState?.success])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col rounded-2xl border-2 border-palette-forest-dark bg-white shadow-2xl">
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-stone-200 bg-white rounded-t-2xl">
          <h2 id="workout-modal-title" className="text-lg font-semibold text-stone-900">
            {isEdit ? 'Modifier l\'entraînement' : 'Nouvel entraînement'}
          </h2>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form action={action} className="flex flex-col flex-1 min-h-0">
          <input type="hidden" name="date" value={date} />
          {isEdit && <input type="hidden" name="workout_id" value={workout.id} />}

          <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
          <p className="text-sm text-stone-600">
            {formatDateFr(date)}
          </p>

          <div>
            <label htmlFor="sport_type" className="block text-sm font-medium text-stone-700 mb-2">
              Type de sport
            </label>
            <select
              id="sport_type"
              name="sport_type"
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              required
              disabled={!canEdit}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition disabled:opacity-60"
            >
              {SPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Paramètres cible selon le sport (coach) ou affichage (lecture) */}
          {(canEdit || (workout && (workout.target_duration_minutes != null || workout.target_distance_km != null))) && (
            <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <p className="text-sm font-medium text-stone-700">
                Objectif
              </p>
              {!canEdit && workout && (workout.target_duration_minutes != null || workout.target_distance_km != null) && (
                <p className="text-sm text-stone-600">
                  {workout.target_duration_minutes != null && workout.target_duration_minutes > 0 && (
                    <span>{workout.target_duration_minutes} min</span>
                  )}
                  {workout.target_distance_km != null && workout.target_distance_km > 0 && (
                    <span>{workout.target_duration_minutes != null && workout.target_duration_minutes > 0 ? ' · ' : ''}{workout.target_distance_km} km</span>
                  )}
                  {workout.target_elevation_m != null && workout.target_elevation_m > 0 && (
                    <span> · {workout.target_elevation_m} m D+</span>
                  )}
                </p>
              )}
              {canEdit && isTimeOnly && (
                <div>
                  <label htmlFor="target_duration_musc" className="block text-xs text-stone-600 mb-1">
                    Durée (minutes)
                  </label>
                  <input
                    id="target_duration_musc"
                    name="target_duration_minutes"
                    type="number"
                    min={1}
                    value={targetDurationMinutes}
                    onChange={(e) => setTargetDurationMinutes(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Ex. 60"
                    className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                  />
                  <input type="hidden" name="target_distance_km" value="" />
                  <input type="hidden" name="target_elevation_m" value="" />
                </div>
              )}
              {canEdit && hasTimeDistanceChoice && (
                <>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="target_mode"
                        value="time"
                        checked={targetMode === 'time'}
                        onChange={() => setTargetMode('time')}
                        className="rounded-full border-stone-300"
                      />
                      <span className="text-sm">Temps</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="target_mode"
                        value="distance"
                        checked={targetMode === 'distance'}
                        onChange={() => setTargetMode('distance')}
                        className="rounded-full border-stone-300"
                      />
                      <span className="text-sm">Distance</span>
                    </label>
                  </div>
                  {targetMode === 'time' && (
                    <div>
                      <label htmlFor="target_duration" className="block text-xs text-stone-600 mb-1">
                        Durée (minutes)
                      </label>
                      <input
                        id="target_duration"
                        name="target_duration_minutes"
                        type="number"
                        min={1}
                        value={targetDurationMinutes}
                        onChange={(e) => setTargetDurationMinutes(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Ex. 45"
                        className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                      />
                      <input type="hidden" name="target_distance_km" value="" />
                      <input type="hidden" name="target_elevation_m" value="" />
                    </div>
                  )}
                  {targetMode === 'distance' && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="target_distance" className="block text-xs text-stone-600 mb-1">
                          Distance (km)
                        </label>
                        <input
                          id="target_distance"
                          name="target_distance_km"
                          type="number"
                          min={0}
                          step={0.1}
                          value={targetDistanceKm}
                          onChange={(e) => setTargetDistanceKm(e.target.value)}
                          disabled={!canEdit}
                          placeholder="Ex. 10"
                          className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                        <input type="hidden" name="target_duration_minutes" value="" />
                      </div>
                      {hasElevation && (
                        <div>
                          <label htmlFor="target_elevation" className="block text-xs text-stone-600 mb-1">
                            Dénivelé (m) — facultatif
                          </label>
                          <input
                            id="target_elevation"
                            name="target_elevation_m"
                            type="number"
                            min={0}
                            value={targetElevationM}
                            onChange={(e) => setTargetElevationM(e.target.value)}
                            disabled={!canEdit}
                            placeholder="Ex. 200"
                            className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                          />
                        </div>
                      )}
                      {!hasElevation && <input type="hidden" name="target_elevation_m" value="" />}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2">
              Titre de l&apos;exercice
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!canEdit}
              placeholder="Ex. Footing 45 min"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={!canEdit}
              rows={4}
              placeholder="Détails de l'entraînement..."
              className="w-full px-4 py-2.5 rounded-lg border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y transition disabled:opacity-60"
            />
          </div>

          {(state?.error || state?.success) && (
            <p
              className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark'}`}
              role="alert"
            >
              {state.error || state.success}
            </p>
          )}
          </div>

          {canEdit && (
            <div className="shrink-0 p-4 pt-3 border-t border-stone-200 bg-white rounded-b-2xl">
              <PrimaryButton
                type="submit"
                disabled={!isValid}
                fullWidth
              >
                {isEdit ? 'Enregistrer les modifications' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          )}
        </form>

        {workout && (
          <div className="px-6 pb-6 pt-2 border-t border-stone-200">
            <h3 className="text-sm font-medium text-stone-700 mb-2">
              {canEdit ? 'Commentaire de l\'athlète' : 'Votre commentaire'}
            </h3>
            {(workout.athlete_comment ?? null) ? (
              <p className="text-sm text-stone-600 whitespace-pre-wrap mb-3">
                {workout.athlete_comment}
              </p>
            ) : (
              !showCommentForm && (
                <p className="text-sm text-stone-500 mb-3">
                  Aucun commentaire.
                </p>
              )
            )}
            {!canEdit && (
              <>
                {!showCommentForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(true)}
                    className="rounded-xl bg-stone-200 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-300 transition"
                  >
                    {(workout.athlete_comment ?? null) ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
                  </button>
                ) : (
                  <form action={commentAction} className="space-y-3">
                    <input type="hidden" name="workout_id" value={workout.id} />
                    <textarea
                      name="comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      placeholder="Saisissez votre commentaire..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 resize-y"
                    />
                    {(commentState?.error || commentState?.success) && (
                      <p
                        className={`text-sm ${commentState.error ? 'text-red-600' : 'text-palette-forest-dark'}`}
                        role="alert"
                      >
                        {commentState.error || commentState.success}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded-xl bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="rounded-xl bg-stone-200 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
