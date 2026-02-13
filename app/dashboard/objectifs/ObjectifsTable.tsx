'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { addGoal, deleteGoal, type GoalFormState } from './actions'
import type { Goal } from '@/types/database'
import { getDaysUntil } from '@/lib/dateUtils'

const PAST_DATE_MESSAGE = "Un objectif ne peut pas être défini dans le passé."

type ObjectifsTableProps = {
  goals: Goal[]
}

// Icônes SVG pour les priorités
const CrownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l2 4h10l2-4M5 7h14M5 7l-1 8h16l-1-8M5 7v10h14V7M9 17v-6M15 17v-6" />
  </svg>
)

const MedalIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const ZapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const TrophyIcon = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.75M16.5 18.75v-3.375c0-.621.503-1.125 1.125-1.125h.75m-9 0H5.625c-.621 0-1.125.504-1.125 1.125v3.375M3 13.125h18M3 13.125v-1.5c0-1.036.84-1.875 1.875-1.875h3.38c1.014 0 1.864.668 2.122 1.587l1.498 4.493c.073.22.28.375.505.375h6.24c.225 0 .432-.155.505-.375l1.498-4.493c.258-.919 1.108-1.587 2.122-1.587h3.38c1.036 0 1.875.84 1.875 1.875v1.5M3 13.125l-1.5 6.75m19.5-6.75l1.5 6.75" />
  </svg>
)

const MapIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

// Fonction pour formater la date en mois/jour
function formatDateBlock(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString('fr-FR', { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

export function ObjectifsTable({ goals: initialGoals }: ObjectifsTableProps) {
  const router = useRouter()
  const [state, action] = useActionState<GoalFormState, FormData>(addGoal, {})
  const dateInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [priority, setPriority] = useState<'primary' | 'secondary'>('primary')

  // Pattern bouton Enregistrer (PATTERN_SAVE_BUTTON.md)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const initialValuesRef = useRef({
    race_name: '',
    date: '',
    distance: '',
    is_primary: 'primary' as const,
  })

  useEffect(() => {
    const input = dateInputRef.current
    if (!input) return
    const today = new Date().toISOString().slice(0, 10)
    const check = () => {
      input.setCustomValidity(input.value && input.value < today ? PAST_DATE_MESSAGE : '')
    }
    check()
    input.addEventListener('change', check)
    input.addEventListener('input', check)
    return () => {
      input.removeEventListener('change', check)
      input.removeEventListener('input', check)
    }
  }, [])

  const checkUnsavedChanges = useCallback((priorityOverride?: 'primary' | 'secondary') => {
    const form = formRef.current
    if (!form) return false
    const raceName = (form.querySelector('[name="race_name"]') as HTMLInputElement)?.value.trim() || ''
    const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value.trim() || ''
    const distance = (form.querySelector('[name="distance"]') as HTMLInputElement)?.value.trim() || ''
    // Bouton actif uniquement quand les 3 champs requis sont remplis
    if (!raceName || !date || !distance) return false
    const currentPriority = priorityOverride ?? priority
    const initial = initialValuesRef.current
    if (raceName !== initial.race_name) return true
    if (date !== initial.date) return true
    if (distance !== initial.distance) return true
    if (currentPriority !== initial.is_primary) return true
    return false
  }, [priority])

  useEffect(() => {
    const form = formRef.current
    if (!form) return
    const updateUnsavedChanges = () => setHasUnsavedChanges(checkUnsavedChanges())
    const inputs = form.querySelectorAll('input, textarea')
    inputs.forEach((input) => {
      input.addEventListener('input', updateUnsavedChanges)
      input.addEventListener('change', updateUnsavedChanges)
    })
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', updateUnsavedChanges)
        input.removeEventListener('change', updateUnsavedChanges)
      })
    }
  }, [checkUnsavedChanges])

  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
    previousIsSubmittingRef.current = isSubmitting

    if (state?.success && justFinishedSubmitting) {
      setShowSavedFeedback(true)
      router.refresh()
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      if (formRef.current) {
        formRef.current.reset()
        setPriority('primary')
        initialValuesRef.current = { race_name: '', date: '', distance: '', is_primary: 'primary' }
        setHasUnsavedChanges(false)
      }
      return () => clearTimeout(t)
    }
    if (state?.error) {
      setShowSavedFeedback(false)
    }
  }, [saveFeedbackKey])

  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) {
      setShowSavedFeedback(false)
    }
  }, [hasUnsavedChanges, showSavedFeedback])

  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [state])

  // Séparer les objectifs futurs et passés
  const today = new Date().toISOString().slice(0, 10)
  const futureGoals = initialGoals.filter(g => g.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const pastGoals = initialGoals.filter(g => g.date < today).sort((a, b) => b.date.localeCompare(a.date))
  
  // Grouper les objectifs par saison (année)
  const goalsBySeason = new Map<number, Goal[]>()
  
  const allGoals = [...futureGoals, ...pastGoals]
  allGoals.forEach(goal => {
    const year = new Date(goal.date + 'T12:00:00').getFullYear()
    if (!goalsBySeason.has(year)) {
      goalsBySeason.set(year, [])
    }
    goalsBySeason.get(year)!.push(goal)
  })
  
  // Trier les saisons par ordre chronologique
  const seasons = Array.from(goalsBySeason.keys()).sort((a, b) => a - b)

  // Trouver le prochain objectif pour le widget du header
  const nextGoal = futureGoals.length > 0 ? futureGoals[0] : null
  const daysUntilNext = nextGoal ? getDaysUntil(nextGoal.date) : null

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-3 gap-8">
      {/* COLONNE GAUCHE : LISTE DES OBJECTIFS (2/3) */}
      <div className="xl:col-span-2 space-y-8">
        {seasons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
            <p className="text-sm text-stone-500">Aucun objectif pour le moment.</p>
          </div>
        ) : (
          seasons.map((seasonYear) => {
            const seasonGoals = goalsBySeason.get(seasonYear)!
            return (
              <div key={seasonYear} className="space-y-6">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide">Saison {seasonYear}</h3>
                {seasonGoals.map((goal) => {
                  const isPast = goal.date < today
                  const daysUntil = getDaysUntil(goal.date)
                  const dateBlock = formatDateBlock(goal.date)
                  const isPrimary = goal.is_primary

                  return (
                    <div
                      key={goal.id}
                      className={`bg-white rounded-2xl p-5 border-l-4 ${
                        isPrimary ? 'border-palette-amber' : 'border-palette-sage'
                      } border-y border-r border-stone-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${
                        isPast ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex gap-5 items-center">
                          {/* Date Block */}
                          <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-16 h-16 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                            <span className="text-xs font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                            <span className="text-2xl font-bold text-stone-800">{dateBlock.day}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg font-bold ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                {goal.race_name}
                              </h3>
                              {isPrimary ? (
                                <span className="bg-palette-amber/10 text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber">
                                  Principal
                                </span>
                              ) : (
                                <span className="bg-palette-sage/10 text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage">
                                  Secondaire
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                              <span className="flex items-center gap-1">
                                <MapIcon className="w-3.5 h-3.5 text-stone-400" />
                                {goal.distance} km
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          {daysUntil !== null && !isPast && (
                            <span className="text-sm font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-3 py-1 rounded-lg">
                              J-{daysUntil}
                            </span>
                          )}
                          <DeleteGoalButton goalId={goal.id} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* COLONNE DROITE : FORMULAIRE D'AJOUT (1/3) */}
      <div className="xl:col-span-1">
        <form
          ref={formRef}
          id="objectif-form"
          action={action}
          onSubmit={() => {
            isSubmittingRef.current = true
            setIsSubmitting(true)
          }}
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-lg sticky top-6"
        >
          <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
            Ajouter un objectif
          </h2>

          <div className="space-y-5">
            <Input
              id="race_name"
              label="Nom de la course"
              name="race_name"
              type="text"
              required
              placeholder="Ex: Marathon de..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                ref={dateInputRef}
                id="date"
                label="Date"
                name="date"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
              />
              <Input
                id="distance"
                label="Distance (km)"
                name="distance"
                type="number"
                required
                min={0}
                step="0.1"
                placeholder="42"
              />
            </div>

            {/* Type (Sélecteur Visuel) */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Priorité</label>
              <div className="grid grid-cols-2 gap-2">
                {/* Principal */}
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="is_primary"
                    value="primary"
                    checked={priority === 'primary'}
                    onChange={() => {
                      setPriority('primary')
                      setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges('primary')), 0)
                    }}
                    className="hidden peer"
                  />
                  <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                    priority === 'primary' 
                      ? 'bg-palette-amber/10 text-palette-amber border-palette-amber' 
                      : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}>
                    <span>Principal</span>
                  </div>
                </label>
                {/* Secondaire */}
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="is_primary"
                    value="secondary"
                    checked={priority === 'secondary'}
                    onChange={() => {
                      setPriority('secondary')
                      setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges('secondary')), 0)
                    }}
                    className="hidden peer"
                  />
                  <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                    priority === 'secondary' 
                      ? 'bg-palette-sage/10 text-palette-sage border-palette-sage' 
                      : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}>
                    <span>Secondaire</span>
                  </div>
                </label>
              </div>
            </div>

            {state?.error  && (
              <p
                className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark font-medium'}`}
                role="alert"
              >
                {state.error}
              </p>
            )}

            {/* Bouton Ajouter */}
            <Button
              type="submit"
              variant="primaryDark"
              fullWidth
              className="mt-2"
              disabled={!hasUnsavedChanges || isSubmitting}
              loading={isSubmitting}
              loadingText="Enregistrement…"
              success={showSavedFeedback}
              error={!!state?.error}
            >
              Ajouter l&apos;objectif
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteGoalButton({ goalId }: { goalId: string }) {
  return (
    <form
      action={async () => {
        await deleteGoal(goalId)
      }}
      className="inline"
    >
      <Button
        type="submit"
        variant="danger"
        className="p-2"
        title="Supprimer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </form>
  )
}
