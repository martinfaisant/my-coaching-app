'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal, useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import {
  createWorkout,
  updateWorkout,
  deleteWorkout,
  saveWorkoutComment,
  type WorkoutFormState,
  type CommentFormState,
} from '@/app/dashboard/workouts/actions'
import type { SportType, Workout } from '@/types/database'

/** Options type de sport avec emoji (aligné page infos coach / profil). */
const SPORT_OPTIONS: { value: SportType; label: string; emoji: string }[] = [
  { value: 'course', label: 'Course', emoji: '🏃' },
  { value: 'velo', label: 'Vélo', emoji: '🚴' },
  { value: 'natation', label: 'Natation', emoji: '🏊' },
  { value: 'musculation', label: 'Musculation', emoji: '💪' },
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

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex-1 min-w-0 rounded-xl bg-[#627e59] hover:bg-[#506648] text-white px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#627e59] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
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
  const [targetPace, setTargetPace] = useState<string>('')
  const [commentText, setCommentText] = useState('')
  const [commentSaveStatus, setCommentSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [commentSaveMessage, setCommentSaveMessage] = useState<string | null>(null)
  const commentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedCommentRef = useRef<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isEdit = !!workout
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

  useEffect(() => {
    if (workout) {
      setSportType(workout.sport_type)
      setTitle(workout.title)
      setDescription(workout.description)
      setTargetDurationMinutes(workout.target_duration_minutes != null ? String(workout.target_duration_minutes) : '')
      setTargetDistanceKm(workout.target_distance_km != null ? String(workout.target_distance_km) : '')
      setTargetElevationM(workout.target_elevation_m != null ? String(workout.target_elevation_m) : '')
      setTargetPace(workout.target_pace != null ? String(workout.target_pace) : '')
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
      setTargetPace('')
      setCommentText('')
    }
    if (!isOpen) {
      setDeleteError(null)
    }
  }, [workout, isOpen])

  useEffect(() => {
    if (sportType === 'musculation') setTargetMode('time')
  }, [sportType])

  // Calcul automatique avec la vitesse : ne remplir le champ non sélectionnable que si les deux autres (temps ou distance + vitesse) sont complétés
  useEffect(() => {
    if (!hasTimeDistanceChoice) return

    const paceOk = targetPace && Number(targetPace) > 0
    const pace = paceOk ? Number(targetPace) : 0

    if (targetMode === 'distance') {
      // Champ désactivé = durée. Remplir seulement si distance ET vitesse sont renseignés
      if (targetDistanceKm && Number(targetDistanceKm) > 0 && paceOk) {
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
      } else if (!targetDistanceKm || !paceOk) {
        setTargetDurationMinutes('')
      }
    } else {
      // targetMode === 'time' : champ désactivé = distance. Remplir seulement si durée ET vitesse sont renseignés
      if (targetDurationMinutes && Number(targetDurationMinutes) > 0 && paceOk) {
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
      } else if (!targetDurationMinutes || !paceOk) {
        setTargetDistanceKm('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPace, targetMode, sportType, hasTimeDistanceChoice, targetDistanceKm, targetDurationMinutes])

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
  const handleDelete = async () => {
    if (!workout || !canEdit) return
    if (!confirm('Supprimer cet entraînement ? Cette action est irréversible.')) return
    setDeleteError(null)
    setDeleteLoading(true)
    const result = await deleteWorkout(workout.id, athleteId, pathToRevalidate)
    setDeleteLoading(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    onClose(true)
  }

  const state = isEdit ? updateState : createState
  const action = isEdit ? updateAction : createAction

  useEffect(() => {
    if (state?.success) onClose(true)
    // onClose volontairement omis des deps pour éviter une boucle (référence change à chaque rendu du parent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success])

  // Auto-save du commentaire pour l'athlète (debounce 800 ms)
  const saveCommentOnFly = useCallback(async () => {
    if (!workout || canEdit) return
    const value = commentText.trim()
    if (value === (lastSavedCommentRef.current ?? '')) return
    setCommentSaveStatus('saving')
    setCommentSaveMessage(null)
    const fd = new FormData()
    fd.set('comment', commentText)
    const result = await saveWorkoutComment(workout.id, athleteId, pathToRevalidate, {}, fd)
    if (result.error) {
      setCommentSaveStatus('error')
      setCommentSaveMessage(result.error)
    } else {
      lastSavedCommentRef.current = value
      setCommentSaveStatus('saved')
      setCommentSaveMessage(null)
      setTimeout(() => setCommentSaveStatus('idle'), 2000)
    }
  }, [workout, canEdit, commentText, athleteId, pathToRevalidate])

  // À la fermeture : sauvegarder tout de suite le commentaire s'il y a des changements non enregistrés (athlète)
  const handleClose = useCallback(() => {
    const doClose = () => onClose()

    if (!workout || canEdit) {
      doClose()
      return
    }
    const current = commentText.trim()
    const saved = lastSavedCommentRef.current ?? ''
    if (current === saved) {
      doClose()
      return
    }
    if (commentDebounceRef.current) {
      clearTimeout(commentDebounceRef.current)
      commentDebounceRef.current = null
    }
    const fd = new FormData()
    fd.set('comment', commentText)
    saveWorkoutComment(workout.id, athleteId, pathToRevalidate, {}, fd).then(() => {
      doClose()
    }).catch(() => {
      doClose()
    })
  }, [workout, canEdit, commentText, athleteId, pathToRevalidate, onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!workout) lastSavedCommentRef.current = null
    else if (lastSavedCommentRef.current === null) lastSavedCommentRef.current = workout.athlete_comment ?? ''
  }, [workout])

  useEffect(() => {
    if (!workout || canEdit) return
    commentDebounceRef.current = setTimeout(saveCommentOnFly, 800)
    return () => {
      if (commentDebounceRef.current) clearTimeout(commentDebounceRef.current)
    }
  }, [workout, canEdit, commentText, saveCommentOnFly])

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

  /* Structure identique au bloc "Objectifs de l'athlète" du HTML de référence */
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={() => handleClose()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* En-tête comme dans le HTML : px-6 py-4 border-b border-stone-100 bg-stone-50/50 + icône check + titre */}
        <div className="shrink-0 px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#627e59]/10 rounded-full text-[#627e59]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 id="workout-modal-title" className="text-lg font-bold text-stone-900 truncate">
              {isEdit ? (canEdit ? 'Modifier l\'entraînement' : 'Votre entraînement') : 'Nouvel entraînement'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleClose()}
            className="shrink-0 p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-200/80 transition-colors"
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

          <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4 space-y-5">
          <p className="text-sm font-medium text-stone-600">
            {formatDateFr(date)}
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
                {SPORT_OPTIONS.map((opt) => {
                  const selected = sportType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSportType(opt.value)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 px-2 transition text-center min-h-[72px] ${
                        selected
                          ? 'border-[#627e59] bg-[#627e59]/10 text-[#627e59] font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-2xl leading-none" aria-hidden>{opt.emoji}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              (() => {
                const opt = SPORT_OPTIONS.find((o) => o.value === sportType)
                if (!opt) return null
                return (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-[#627e59] bg-[#627e59]/10 text-[#627e59] font-semibold py-3 px-4 min-h-[72px] w-fit">
                    <span className="text-2xl leading-none" aria-hidden>{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </div>
                )
              })()
            )}
          </div>

          {/* Objectifs de la séance — Design avec titre à gauche, toggle à droite, grille 2x2 */}
          {(canEdit || (workout && (workout.target_duration_minutes != null || workout.target_distance_km != null))) && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              {/* En-tête avec titre et toggle */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                  OBJECTIFS DE LA SÉANCE
                </label>
                {canEdit && hasTimeDistanceChoice && (
                  <div className="flex bg-stone-200 p-0.5 rounded-lg">
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="time" checked={targetMode === 'time'} onChange={() => setTargetMode('time')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'time' ? 'bg-[#627e59] text-white shadow-sm' : 'text-stone-600'}`}>
                        Temps
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="target_mode" value="distance" checked={targetMode === 'distance'} onChange={() => setTargetMode('distance')} className="sr-only" />
                      <div className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${targetMode === 'distance' ? 'bg-[#627e59] text-white shadow-sm' : 'text-stone-600'}`}>
                        Distance
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {!canEdit && workout && (workout.target_duration_minutes != null || workout.target_distance_km != null) && (
                <p className="text-sm text-stone-600">
                  {workout.target_duration_minutes != null && workout.target_duration_minutes > 0 && (
                    <span>{workout.target_duration_minutes} min</span>
                  )}
                  {workout.target_distance_km != null && workout.target_distance_km > 0 && (
                    <span>{workout.target_duration_minutes != null && workout.target_duration_minutes > 0 ? ' · ' : ''}{workout.sport_type === 'natation' ? `${Math.round(workout.target_distance_km * 1000)} m` : `${workout.target_distance_km} km`}</span>
                  )}
                  {workout.target_elevation_m != null && workout.target_elevation_m > 0 && (
                    <span> · {workout.target_elevation_m} m D+</span>
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
                          className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-12"
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
                              className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-10 ${
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
                              className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-10 ${
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
                          className={`w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all font-semibold placeholder-stone-300 pr-12 ${
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
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-14"
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
                            className="w-full border border-stone-300 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent transition-all bg-white text-stone-900 placeholder-stone-300 font-semibold pr-16"
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
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#627e59] focus:border-[#627e59] transition disabled:opacity-60"
            />
          </div>

          {(canEdit || description.trim()) && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
                {canEdit ? (
                  <>Description <span className="text-stone-400 font-normal">(facultatif)</span></>
                ) : (
                  'Description'
                )}
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                rows={4}
                placeholder="Détails de l'entraînement..."
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#627e59] focus:border-[#627e59] resize-y transition disabled:opacity-60"
              />
            </div>
          )}

          {(state?.error || state?.success) && (
            <p
              className={`text-sm ${state.error ? 'text-red-600' : 'text-[#627e59] font-medium'}`}
              role="alert"
            >
              {state.error || state.success}
            </p>
          )}

          {workout && (
            <div className="border-t border-stone-100 mt-6">
              <div className="pt-4 pb-2 flex items-center gap-3">
                <div className="p-2 bg-stone-200/80 rounded-full text-stone-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {canEdit ? 'Commentaire de l\'athlète' : 'Votre commentaire'}
                </h3>
              </div>
              <div className="pt-2 pb-4">
                {!canEdit ? (
                  <>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      placeholder="Saisissez votre commentaire… Il est enregistré automatiquement."
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#627e59] focus:border-[#627e59] resize-y"
                      aria-label="Votre commentaire"
                    />
                    {commentSaveStatus === 'saving' && (
                      <p className="text-sm text-stone-500 mt-2">Enregistrement…</p>
                    )}
                    {commentSaveStatus === 'saved' && (
                      <p className="text-sm text-[#627e59] font-medium mt-2">Commentaire enregistré.</p>
                    )}
                    {commentSaveStatus === 'error' && commentSaveMessage && (
                      <p className="text-sm text-red-600 mt-2" role="alert">{commentSaveMessage}</p>
                    )}
                  </>
                ) : (
                  (workout.athlete_comment ?? null) ? (
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">
                      {workout.athlete_comment}
                    </p>
                  ) : (
                    <p className="text-sm text-stone-500">Aucun commentaire.</p>
                  )
                )}
              </div>
            </div>
          )}
          </div>
          </div>

          {canEdit && (
            <div className="shrink-0 px-6 py-4 border-t border-stone-100 bg-stone-50/50 space-y-3">
              {deleteError && (
                <p className="text-sm text-red-600" role="alert">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 min-w-0 rounded-xl border border-red-300 bg-white text-red-600 hover:bg-red-50 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Suppression…' : 'Supprimer'}
                  </button>
                )}
                <SubmitButton disabled={!isValid} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
