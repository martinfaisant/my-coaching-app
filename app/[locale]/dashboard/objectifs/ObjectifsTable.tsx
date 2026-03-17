'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { TileCard } from '@/components/TileCard'
import { DatePickerPopup } from '@/components/DatePickerPopup'
import { addGoal, deleteGoal, type GoalFormState } from './actions'
import type { Goal } from '@/types/database'
import { getDaysUntil, formatDateFr, toDateStr } from '@/lib/dateUtils'
import { hasGoalResult, formatGoalResultTime, formatGoalResultPlaceOrdinal, hasTargetTime, formatTargetTime } from '@/lib/goalResultUtils'
import { GoalResultModal } from './GoalResultModal'
import { GoalEditModal } from './GoalEditModal'


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
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
)

const ClockIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Fonction pour formater la date en mois/jour
function formatDateBlock(dateStr: string, localeTag: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString(localeTag, { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

export function ObjectifsTable({ goals: initialGoals }: ObjectifsTableProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [state, action] = useActionState<GoalFormState, FormData>(addGoal, {})
  const formRef = useRef<HTMLFormElement>(null)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const datePickerPopupRef = useRef<HTMLDivElement>(null)
  const [addFormDate, setAddFormDate] = useState('')
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)
  const [priority, setPriority] = useState<'primary' | 'secondary'>('primary')
  const [goalForResultModal, setGoalForResultModal] = useState<Goal | null>(null)
  const [goalForEditModal, setGoalForEditModal] = useState<Goal | null>(null)

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
    target_time_hours: '',
    target_time_minutes: '',
    target_time_seconds: '',
  })


  const checkUnsavedChanges = useCallback((priorityOverride?: 'primary' | 'secondary') => {
    const form = formRef.current
    if (!form) return false
    const raceName = (form.querySelector('[name="race_name"]') as HTMLInputElement)?.value.trim() || ''
    const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value.trim() || ''
    const distance = (form.querySelector('[name="distance"]') as HTMLInputElement)?.value.trim() || ''
    if (!raceName || !date || !distance) return false
    const currentPriority = priorityOverride ?? priority
    const th = (form.querySelector('[name="target_time_hours"]') as HTMLInputElement)?.value ?? ''
    const tm = (form.querySelector('[name="target_time_minutes"]') as HTMLInputElement)?.value ?? ''
    const ts = (form.querySelector('[name="target_time_seconds"]') as HTMLInputElement)?.value ?? ''
    const initial = initialValuesRef.current
    if (raceName !== initial.race_name) return true
    if (date !== initial.date) return true
    if (distance !== initial.distance) return true
    if (currentPriority !== initial.is_primary) return true
    if (th !== initial.target_time_hours || tm !== initial.target_time_minutes || ts !== initial.target_time_seconds) return true
    return false
  }, [priority])

  const closeDatePicker = useCallback(() => {
    setShowDatePickerPopup(false)
    setDatePickerAnchor(null)
  }, [])

  const openDatePicker = useCallback(() => {
    const rect = dateTriggerRef.current?.getBoundingClientRect()
    if (rect) setDatePickerAnchor(rect)
    setShowDatePickerPopup(true)
  }, [])

  useEffect(() => {
    if (!showDatePickerPopup) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      const inPopup = datePickerPopupRef.current?.contains(target)
      const inTrigger = dateTriggerRef.current?.contains(target)
      if (!inPopup && !inTrigger) closeDatePicker()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDatePicker()
    }

    const onRepositionOrClose = () => {
      // Si l'utilisateur scroll/resize, on évite un popover "perdu" en le refermant.
      closeDatePicker()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onRepositionOrClose)
    window.addEventListener('scroll', onRepositionOrClose, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onRepositionOrClose)
      window.removeEventListener('scroll', onRepositionOrClose, true)
    }
  }, [showDatePickerPopup, closeDatePicker])

  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges())
  }, [addFormDate, checkUnsavedChanges])

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
        setAddFormDate('')
        initialValuesRef.current = { race_name: '', date: '', distance: '', is_primary: 'primary', target_time_hours: '', target_time_minutes: '', target_time_seconds: '' }
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
            <p className="text-sm text-stone-500">{tGoals('noGoals')}</p>
          </div>
        ) : (
          seasons.map((seasonYear) => {
            const seasonGoals = goalsBySeason.get(seasonYear)!
            return (
              <div key={seasonYear} className="space-y-6">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide">{tGoals('season', { year: seasonYear })}</h3>
                {seasonGoals.map((goal) => {
                  const isPast = goal.date < today
                  const daysUntil = getDaysUntil(goal.date)
                  const dateBlock = formatDateBlock(goal.date, localeTag)
                  const isPrimary = goal.is_primary
                  const isResult = goal.date <= today

                  return (
                    <TileCard
                      key={goal.id}
                      leftBorderColor={isResult ? 'stone' : isPrimary ? 'amber' : 'sage'}
                      borderLeftOnly={isResult}
                      className={isPast ? 'opacity-75' : ''}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-4 items-center min-w-0">
                          {/* Date Block */}
                          <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-14 h-14 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                            <span className="text-xl font-bold text-stone-800">{dateBlock.day}</span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={`text-base font-bold truncate ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                {goal.race_name}
                              </h3>
                              {isPrimary ? (
                                <span className="bg-white text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                                  {tGoals('priority.primary')}
                                </span>
                              ) : (
                                <span className="bg-white text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                                  {tGoals('priority.secondary')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-stone-500 font-medium flex-wrap">
                              <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{goal.distance} km</span>
                              {hasTargetTime(goal) && (
                                <>
                                  <span className="text-stone-400">·</span>
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    {isPast && hasGoalResult(goal) ? (
                                      <span>{tGoals('targetTimeLabel')} {formatTargetTime(goal)} · {tGoals('achieved')} {formatGoalResultTime(goal)}</span>
                                    ) : (
                                      <span>{tGoals('targetTimeLabel')} : {formatTargetTime(goal)}</span>
                                    )}
                                  </span>
                                </>
                              )}
                              {!hasTargetTime(goal) && isPast && hasGoalResult(goal) && (
                                <>
                                  <span className="text-stone-400">·</span>
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span>{formatGoalResultTime(goal)}</span>
                                  </span>
                                </>
                              )}
                              {hasGoalResult(goal) && goal.result_place != null && (
                                <>
                                  <span className="text-stone-400">·</span>
                                  <span>{formatGoalResultPlaceOrdinal(goal.result_place, locale)}</span>
                                </>
                              )}
                            </div>
                            {isPast && !hasGoalResult(goal) && (
                              <p className="text-xs text-stone-400 mt-1">{tGoals('result.noResult')}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {daysUntil !== null && !isPast && (
                            <span className="text-sm font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-3 py-1 rounded-lg">
                              {tGoals('daysUntil', { days: daysUntil })}
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5"
                            onClick={() => setGoalForEditModal(goal)}
                          >
                            {tGoals('editGoal')}
                          </Button>
                          {isPast && (
                            <Button
                              type="button"
                              variant={hasGoalResult(goal) ? 'secondary' : 'outline'}
                              className="px-3 py-1.5"
                              onClick={() => setGoalForResultModal(goal)}
                            >
                              {hasGoalResult(goal) ? tGoals('result.editResult') : tGoals('result.addResult')}
                            </Button>
                          )}
                          <DeleteGoalButton goalId={goal.id} />
                        </div>
                      </div>
                    </TileCard>
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
            {tGoals('addGoal')}
          </h2>

          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-5">
            <Input
              id="race_name"
              label={tGoals('raceName')}
              name="race_name"
              type="text"
              required
              placeholder={tGoals('raceNamePlaceholder')}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="objectif-date-trigger" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 ml-1">
                  {tGoals('date')} *
                </label>
                <input type="hidden" name="date" value={addFormDate} required readOnly aria-hidden />
                <div
                  ref={dateTriggerRef}
                  id="objectif-date-trigger"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    openDatePicker()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openDatePicker()
                    }
                  }}
                  className="flex items-center gap-2 w-full border border-stone-300 rounded-lg py-3 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition text-left"
                  aria-label={tGoals('date')}
                >
                  <span className={`text-sm flex-1 ${addFormDate ? 'font-medium text-stone-900' : 'text-stone-400'}`}>
                    {addFormDate ? formatDateFr(addFormDate, true, localeTag) : tGoals('date')}
                  </span>
                  <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <Input
                id="distance"
                label={tGoals('distance')}
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
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">{tGoals('priority.label')}</label>
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
                  <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                    priority === 'primary' 
                      ? 'bg-white text-palette-amber border-palette-amber' 
                      : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}>
                    <span>{tGoals('priority.primary')}</span>
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
                  <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                    priority === 'secondary' 
                      ? 'bg-white text-palette-sage border-palette-sage' 
                      : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}>
                    <span>{tGoals('priority.secondary')}</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">
                {tGoals('targetTimeOptional')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <Input
                    id="target_time_hours"
                    name="target_time_hours"
                    type="number"
                    min={0}
                    max={99}
                    placeholder=""
                    className="text-center pr-9"
                    aria-label={tGoals('result.hours')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitHours')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="target_time_minutes"
                    name="target_time_minutes"
                    type="number"
                    min={0}
                    max={59}
                    placeholder=""
                    className="text-center pr-10"
                    aria-label={tGoals('result.minutes')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitMinutes')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="target_time_seconds"
                    name="target_time_seconds"
                    type="number"
                    min={0}
                    max={59}
                    placeholder=""
                    className="text-center pr-8"
                    aria-label={tGoals('result.seconds')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitSeconds')}
                  </span>
                </div>
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
              loadingText={tCommon('saving')}
              success={showSavedFeedback}
              successText={tCommon('saved')}
              error={!!state?.error}
              errorText={tCommon('notSaved')}
            >
              {tGoals('addGoal')}
            </Button>
          </div>
        </form>
      </div>

      {goalForResultModal && (
        <GoalResultModal
          goal={goalForResultModal}
          isOpen={!!goalForResultModal}
          onClose={() => setGoalForResultModal(null)}
        />
      )}
      {goalForEditModal && (
        <GoalEditModal
          goal={goalForEditModal}
          isOpen={!!goalForEditModal}
          onClose={() => setGoalForEditModal(null)}
        />
      )}

      {showDatePickerPopup && datePickerAnchor && typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed z-[110] shadow-xl"
              ref={datePickerPopupRef}
              style={(() => {
                const POPUP_W = 320
                const POPUP_H = 360
                const M = 8
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
                const vh = typeof window !== 'undefined' ? window.innerHeight : 800
                const left = Math.max(M, Math.min(datePickerAnchor.left, vw - POPUP_W - M))
                const preferBottomTop = datePickerAnchor.bottom + M
                const fitsBelow = preferBottomTop + POPUP_H <= vh - M
                const top = fitsBelow
                  ? preferBottomTop
                  : Math.max(M, datePickerAnchor.top - M - POPUP_H)
                return { top, left, maxHeight: `calc(100vh - ${M * 2}px)` }
              })()}
            >
              <DatePickerPopup
                value={addFormDate || toDateStr(new Date())}
                onChange={(dateStr) => {
                  setAddFormDate(dateStr)
                  closeDatePicker()
                }}
                locale={localeTag}
                monthDropdownId="objectif-form-date-picker-month"
              />
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

function DeleteGoalButton({ goalId }: { goalId: string }) {
  const locale = useLocale()
  const tGoals = useTranslations('goals')
  return (
    <form
      action={async () => {
        await deleteGoal(goalId, locale)
      }}
      className="inline"
    >
      <Button
        type="submit"
        variant="danger"
        className="p-2"
        title={tGoals('deleteTitle')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </form>
  )
}
