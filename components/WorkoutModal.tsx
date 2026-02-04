'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import {
  createWorkout,
  updateWorkout,
  saveWorkoutComment,
  type WorkoutFormState,
  type CommentFormState,
} from '@/app/dashboard/workouts/actions'
import type { SportType, Workout } from '@/types/database'

const SPORT_OPTIONS: { value: SportType; label: string }[] = [
  { value: 'course', label: 'Course' },
  { value: 'musculation', label: 'Musculation' },
  { value: 'natation', label: 'Natation' },
  { value: 'velo', label: 'Vélo' },
]

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
  onClose: () => void
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
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState('')

  const isEdit = !!workout
  const isValid = sportType && title.trim() && description.trim()

  useEffect(() => {
    if (workout) {
      setSportType(workout.sport_type)
      setTitle(workout.title)
      setDescription(workout.description)
      setCommentText(workout.athlete_comment ?? '')
    } else {
      setSportType('course')
      setTitle('')
      setDescription('')
      setCommentText('')
    }
    if (!isOpen) setShowCommentForm(false)
  }, [workout, isOpen])

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
    if (state?.success) onClose()
  }, [state?.success, onClose])

  useEffect(() => {
    if (commentState?.success) {
      setShowCommentForm(false)
      onClose()
    }
  }, [commentState?.success, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
    >
      <div
        className="absolute inset-0 bg-palette-forest-dark/60bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-stone-200border-stone-700 bg-whitebg-palette-forest-dark rounded-t-2xl z-10">
          <h2 id="workout-modal-title" className="text-lg font-semibold text-stone-900text-white">
            {isEdit ? 'Modifier l\'entraînement' : 'Nouvel entraînement'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white0 hover:text-stone-700 hover:bg-stone-100hover:bg-palette-olive transition"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form action={action} className="p-6 space-y-5">
          <input type="hidden" name="date" value={date} />
          {isEdit && <input type="hidden" name="workout_id" value={workout.id} />}

          <p className="text-sm text-stone-600text-stone-400">
            {formatDateFr(date)}
          </p>

          <div>
            <label htmlFor="sport_type" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
              Type de sport
            </label>
            <select
              id="sport_type"
              name="sport_type"
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              required
              disabled={!canEdit}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark text-stone-900text-white focus:outline-none focus:ring-2 focus:ring-stone-900focus:ring-stone-100 focus:border-transparent transition disabled:opacity-60"
            >
              {SPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
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
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900focus:ring-stone-100 focus:border-transparent transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
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
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900focus:ring-stone-100 focus:border-transparent resize-y transition disabled:opacity-60"
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

          {canEdit && (
            <button
              type="submit"
              disabled={!isValid}
              className="w-full py-2.5 px-4 rounded-lg bg-palette-forest-darkbg-white text-whitetext-stone-900 font-medium hover:bg-palette-olivehover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Enregistrer les modifications' : 'Enregistrer'}
            </button>
          )}
        </form>

        {workout && (
          <div className="px-6 pb-6 pt-2 border-t border-stone-200border-stone-700">
            <h3 className="text-sm font-medium text-stone-700text-stone-300 mb-2">
              {canEdit ? 'Commentaire de l\'athlète' : 'Votre commentaire'}
            </h3>
            {(workout.athlete_comment ?? null) ? (
              <p className="text-sm text-stone-600text-stone-400 whitespace-pre-wrap mb-3">
                {workout.athlete_comment}
              </p>
            ) : (
              !showCommentForm && (
                <p className="text-sm text-white0text-white0 mb-3">
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
                    className="rounded-xl bg-stone-200bg-stone-700 px-4 py-2 text-sm font-medium text-stone-900text-white hover:bg-stone-300hover:bg-stone-600 transition"
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
                      className="w-full px-4 py-3 rounded-xl border border-stone-300border-stone-600 bg-whitebg-stone-800 text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 resize-y"
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
                        className="rounded-xl bg-palette-forest-darkbg-white px-4 py-2 text-sm font-medium text-whitetext-stone-900 hover:bg-palette-olivehover:bg-stone-100 transition"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="rounded-xl bg-stone-200bg-stone-700 px-4 py-2 text-sm font-medium text-stone-900text-white hover:bg-stone-300hover:bg-stone-600 transition"
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
}
