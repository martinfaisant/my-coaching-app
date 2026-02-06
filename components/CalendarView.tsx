'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { WorkoutModal } from './WorkoutModal'
import type { Workout, SportType, Goal, ImportedActivity } from '@/types/database'

const SPORT_LABELS: Record<SportType, string> = {
  course: 'Course',
  musculation: 'Musculation',
  natation: 'Natation',
  velo: 'Vélo',
}

/** Style des cartes par sport (design référence: Run forest, Vélo olive, Nage sky, Muscu stone). */
const SPORT_CARD_STYLES: Record<
  SportType,
  { borderLeft: string; badge: string; badgeBg: string }
> = {
  course: {
    borderLeft: 'border-l-[#627e59]',
    badge: 'text-[#627e59]',
    badgeBg: 'bg-[#627e59]/10',
  },
  velo: {
    borderLeft: 'border-l-[#8e9856]',
    badge: 'text-[#8e9856]',
    badgeBg: 'bg-[#8e9856]/10',
  },
  natation: {
    borderLeft: 'border-l-sky-500',
    badge: 'text-sky-700',
    badgeBg: 'bg-sky-50',
  },
  musculation: {
    borderLeft: 'border-l-stone-500',
    badge: 'text-stone-600',
    badgeBg: 'bg-stone-100',
  },
}

const SPORT_COLORS: Record<
  SportType,
  { bg: string; border: string; text: string; comment: string }
> = {
  course: {
    bg: 'bg-[#627e59]/10',
    border: 'border-[#627e59]',
    text: 'text-[#627e59]',
    comment: 'text-palette-olive',
  },
  musculation: {
    bg: 'bg-stone-100',
    border: 'border-stone-500',
    text: 'text-stone-600',
    comment: 'text-palette-olive',
  },
  natation: {
    bg: 'bg-sky-50',
    border: 'border-sky-500',
    text: 'text-sky-700',
    comment: 'text-palette-olive',
  },
  velo: {
    bg: 'bg-[#8e9856]/10',
    border: 'border-[#8e9856]',
    text: 'text-[#8e9856]',
    comment: 'text-palette-olive',
  },
}

/** Formate l'objectif d'un entraînement pour affichage (ex. "45'", "1h30", "10.5 km", "120m D+"). */
function formatWorkoutTarget(w: Workout): { primary: string; secondary?: string; hasDistance?: boolean } {
  if (w.target_duration_minutes != null && w.target_duration_minutes > 0) {
    const m = w.target_duration_minutes
    const primary = m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : '00'}` : `${m}'`
    return { primary, secondary: undefined, hasDistance: false }
  }
  if (w.target_distance_km != null && w.target_distance_km > 0) {
    const primary = `${Number(w.target_distance_km) % 1 === 0 ? w.target_distance_km : (w.target_distance_km as number).toFixed(1)} km`
    const secondary =
      w.target_elevation_m != null && w.target_elevation_m > 0 ? `${w.target_elevation_m}m D+` : undefined
    return { primary, secondary, hasDistance: true }
  }
  return { primary: '' }
}

/** Libellé du type d'activité pour l'affichage (activity_type, raw_data.type ou type de sport). */
function getImportedActivityTypeLabel(a: ImportedActivity): string {
  if (a.activity_type && String(a.activity_type).trim()) return String(a.activity_type).trim()
  const raw = a.raw_data as { type?: string } | null
  if (raw?.type && typeof raw.type === 'string') return raw.type.trim()
  return SPORT_LABELS[a.sport_type]
}

/** Formate les infos Strava (raw_data) comme les objectifs des cartes coach (temps, distance, dénivelé). Préfère distance + D+ si présents. */
function formatImportedActivityTarget(a: ImportedActivity): { primary: string; secondary?: string; hasDistance: boolean } {
  const raw = a.raw_data as { moving_time?: number; distance?: number; total_elevation_gain?: number } | null
  if (!raw) return { primary: '', hasDistance: false }
  const movingTime = raw.moving_time
  const distanceM = raw.distance
  const elevationM = raw.total_elevation_gain
  if (distanceM != null && distanceM > 0) {
    const km = distanceM / 1000
    const primary = `${km % 1 === 0 ? km : km.toFixed(1)} km`
    const secondary = elevationM != null && elevationM > 0 ? `${Math.round(elevationM)}m D+` : undefined
    return { primary, secondary, hasDistance: true }
  }
  if (movingTime != null && movingTime > 0) {
    const m = Math.round(movingTime / 60)
    const primary = m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : '00'}` : `${m}'`
    return { primary, secondary: undefined, hasDistance: false }
  }
  return { primary: '', hasDistance: false }
}

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)
const MountainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Date au format YYYY-MM-DD en heure locale (évite le décalage UTC). */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type CalendarViewProps = {
  athleteId: string
  athleteEmail: string
  workouts: Workout[]
  importedActivities?: ImportedActivity[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
  referenceMonday?: Date
  onNavigate?: (weeksOffset: number) => void
  /** Quand true, le titre de la première semaine n'est pas affiché (il est dans la barre de navigation). */
  hideFirstWeekTitle?: boolean
}

/** Icône cible avec badge 1 (objectif principal) ou 2 (secondaire). */
function GoalTargetBadge({ isPrimary }: { isPrimary: boolean }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" title={isPrimary ? 'Objectif principal' : 'Objectif secondaire'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-palette-forest-dark">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
      <span className="ml-0.5 text-[10px] font-bold text-palette-forest-dark leading-none">{isPrimary ? '1' : '2'}</span>
    </span>
  )
}

export function CalendarView({
  athleteId,
  workouts,
  importedActivities = [],
  goals = [],
  canEdit,
  pathToRevalidate,
  referenceMonday,
  onNavigate,
  hideFirstWeekTitle = false,
}: CalendarViewProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>('')
  const [modalWorkout, setModalWorkout] = useState<Workout | null>(null)
  const [workoutModalKey, setWorkoutModalKey] = useState(0)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedImportedActivity, setSelectedImportedActivity] = useState<ImportedActivity | null>(null)

  const openGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setGoalModalOpen(true)
  }

  const { startMonday, weeks } = useMemo(() => {
    const today = new Date()
    const baseMonday = referenceMonday ? getWeekMonday(referenceMonday) : getWeekMonday(today)
    const startMonday = new Date(baseMonday)
    startMonday.setDate(startMonday.getDate() - 7)

    const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    const weeks: { label: string; monthLabel: string; rangeLabel: string; isCurrentWeek: boolean; days: { dateStr: string; label: string; dayName: string; isToday: boolean; isPast: boolean }[] }[] = []
    
    const todayMonday = getWeekMonday(today)

    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(startMonday)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const weekMonday = getWeekMonday(weekStart)
      const monthLabel = MONTHS_FR[weekStart.getMonth()]
      
      const firstDay = new Date(weekStart)
      const lastDay = new Date(weekStart)
      lastDay.setDate(lastDay.getDate() + 6)
      const rangeLabel = `${firstDay.getDate()} ${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][firstDay.getMonth()]} - ${lastDay.getDate()} ${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][lastDay.getMonth()]}`
      let weekLabel = ''
      let isCurrentWeek = false
      if (weekMonday.getTime() === todayMonday.getTime()) {
        weekLabel = 'Semaine actuelle'
        isCurrentWeek = true
      } else if (weekMonday.getTime() < todayMonday.getTime()) {
        const diffWeeks = Math.round((todayMonday.getTime() - weekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        weekLabel = diffWeeks === 1 ? `Semaine précédente (${rangeLabel})` : `Il y a ${diffWeeks} semaines`
      } else {
        const diffWeeks = Math.round((weekMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        weekLabel = diffWeeks === 1 ? `Semaine suivante (${rangeLabel})` : `Dans ${diffWeeks} semaines`
      }

      const days: { dateStr: string; label: string; dayName: string; isToday: boolean; isPast: boolean }[] = []
      const todayStr = toDateStr(today)
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const dateStr = toDateStr(day)
        const isToday = todayStr === dateStr
        const isPast = dateStr < todayStr
        const dayIndex = (day.getDay() + 6) % 7
        days.push({
          dateStr,
          label: day.getDate().toString(),
          dayName: DAY_NAMES[dayIndex],
          isToday,
          isPast,
        })
      }
      weeks.push({ label: weekLabel, monthLabel, rangeLabel, isCurrentWeek, days })
    }

    return { startMonday, weeks }
  }, [referenceMonday])

  const workoutsByDate = useMemo(() => {
    const map: Record<string, Workout[]> = {}
    for (const w of workouts) {
      if (!map[w.date]) map[w.date] = []
      map[w.date].push(w)
    }
    return map
  }, [workouts])

  const importedByDate = useMemo(() => {
    const map: Record<string, ImportedActivity[]> = {}
    for (const a of importedActivities) {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    }
    return map
  }, [importedActivities])

  const goalsByDate = useMemo(() => {
    const map: Record<string, Goal[]> = {}
    for (const g of goals) {
      if (!map[g.date]) map[g.date] = []
      map[g.date].push(g)
    }
    return map
  }, [goals])

  const openDay = (dateStr: string, isPast: boolean) => {
    if (!canEdit || isPast) return
    setModalDate(dateStr)
    setModalWorkout(null)
    setWorkoutModalKey((k) => k + 1)
    setModalOpen(true)
  }

  const openWorkout = (dateStr: string, workout: Workout) => {
    setModalDate(dateStr)
    setModalWorkout(workout)
    setWorkoutModalKey((k) => k + 1)
    setModalOpen(true)
  }

  const handleWorkoutModalClose = useCallback((closedBySuccess?: boolean) => {
    setModalOpen(false)
    if (closedBySuccess) router.refresh()
  }, [router])

  const renderCompactCard = (w: Workout, dateStr: string) => {
    const style = SPORT_CARD_STYLES[w.sport_type]
    const target = formatWorkoutTarget(w)
    return (
      <div
        key={w.id}
        onClick={(e) => {
          e.stopPropagation()
          openWorkout(dateStr, w)
        }}
        className={`bg-white rounded border-l-4 ${style.borderLeft} shadow-sm p-1.5 h-full flex flex-col justify-between ${canEdit ? 'cursor-pointer training-card' : ''}`}
        role={canEdit ? 'button' : undefined}
      >
        <div>
          <span className={`text-[9px] font-bold uppercase ${style.badge} ${style.badgeBg} px-1 py-0.5 rounded`}>
            {SPORT_LABELS[w.sport_type]}
          </span>
          <div className="text-xs font-semibold text-stone-700 mt-1 truncate">{w.title}</div>
        </div>
        {target.primary && (
          <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {target.primary}
            {target.secondary ? ` · ${target.secondary}` : ''}
          </div>
        )}
      </div>
    )
  }

  const renderDetailedCard = (w: Workout, dateStr: string) => {
    const style = SPORT_CARD_STYLES[w.sport_type]
    const target = formatWorkoutTarget(w)
    return (
      <div
        key={w.id}
        onClick={(e) => {
          e.stopPropagation()
          openWorkout(dateStr, w)
        }}
        className={`training-card bg-white p-3 rounded-lg shadow-sm border border-stone-100 border-l-4 ${style.borderLeft} ${canEdit ? 'cursor-pointer' : ''}`}
        role={canEdit ? 'button' : undefined}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold uppercase ${style.badge} ${style.badgeBg} px-1.5 py-0.5 rounded`}>
            {SPORT_LABELS[w.sport_type]}
          </span>
        </div>
        <h4 className="text-sm font-bold text-stone-900 leading-tight mb-2">{w.title}</h4>
        <p className="text-xs text-stone-500 leading-snug mb-3 line-clamp-2">{w.description || '—'}</p>
        {target.primary && (
          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium flex-wrap">
            {w.target_distance_km != null && w.target_distance_km > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>{target.primary}</span>
                </div>
                {target.secondary && (
                  <>
                    <div className="w-px h-3 bg-stone-300" />
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>{target.secondary}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{target.primary}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mt-0 space-y-0">
        {weeks.map((week, wi) => {
          const isDetailed = wi === 1
          const isCondensed = !isDetailed
          const sectionOpacity = wi === 0 ? 'opacity-75 hover:opacity-100 transition-opacity duration-300' : ''
          return (
            <section
              key={wi}
              className={`mb-8 ${sectionOpacity} ${wi === 1 ? 'mb-12' : ''} ${hideFirstWeekTitle && wi === 0 ? 'mt-1' : ''}`}
            >
              {!(hideFirstWeekTitle && wi === 0) && (
                <div className={`flex items-center gap-4 mb-3 ${isDetailed ? 'mb-4 mt-8' : ''}`}>
                  {isDetailed ? (
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-[#627e59]">
                        {week.isCurrentWeek ? 'Semaine actuelle' : 'Semaine'}
                      </h2>
                      <span className="text-stone-400 font-medium text-sm">— {week.rangeLabel.replace(' - ', ' au ')}</span>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{week.label}</h2>
                      <div className="h-px flex-grow bg-stone-200" />
                    </>
                  )}
                </div>
              )}
              <div className={`grid grid-cols-7 gap-2 min-w-[800px] overflow-x-auto hide-scroll items-stretch ${isDetailed ? 'gap-3' : ''}`}>
                {isCondensed &&
                  week.days.map((day) => {
                    const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                    const dayImported = importedByDate[day.dateStr] ?? []
                    const firstWorkout = dayWorkouts[0]
                    const firstImported = dayImported[0]
                    const isEmpty = !firstWorkout && !firstImported
                    const showAddInCondensed = wi === 2 && canEdit && !day.isPast && isEmpty
                    return (
                      <div
                        key={day.dateStr}
                        onClick={showAddInCondensed ? () => openDay(day.dateStr, day.isPast) : undefined}
                        role={showAddInCondensed ? 'button' : undefined}
                        className={`h-24 rounded-lg border border-stone-200 p-1.5 ${
                          showAddInCondensed
                            ? 'border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-[#627e59] hover:bg-[#627e59]/5 transition-all group'
                            : isEmpty
                              ? 'bg-stone-100/50'
                              : 'bg-white shadow-sm'
                        }`}
                      >
                        {firstWorkout && renderCompactCard(firstWorkout, day.dateStr)}
                        {!firstWorkout && firstImported && (() => {
                          const target = formatImportedActivityTarget(firstImported)
                          return (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImportedActivity(firstImported)
                              }}
                              className="bg-white rounded border-l-4 border-[#FC4C02] h-full p-1.5 flex flex-col justify-between cursor-pointer training-card w-full"
                              role="button"
                            >
                              <div>
                                <div className="inline-flex items-center gap-1 align-middle">
                                  <img src="/strava-icon.svg" alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  <span className="text-[9px] font-bold uppercase text-[#FC4C02] bg-orange-100 px-1 py-0.5 rounded leading-none">
                                    {getImportedActivityTypeLabel(firstImported)}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-stone-700 mt-1 truncate">{firstImported.title}</div>
                              </div>
                              {target.primary && (
                                <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                                  {target.hasDistance ? (
                                    <>
                                      <MapIcon />
                                      <span>{target.primary}</span>
                                      {target.secondary && (
                                        <>
                                          <span className="w-px h-2.5 bg-stone-300" />
                                          <MountainIcon />
                                          <span>{target.secondary}</span>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <ClockIcon />
                                      <span>{target.primary}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        {showAddInCondensed && (
                          <div className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-300 shadow-sm group-hover:text-white group-hover:bg-[#627e59] group-hover:border-[#627e59] transition-all transform group-hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {isDetailed &&
                  week.days.map((day) => {
                    const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                    const dayImported = importedByDate[day.dateStr] ?? []
                    const dayGoals = goalsByDate[day.dateStr] ?? []
                    const hasContent = dayWorkouts.length > 0 || dayGoals.length > 0 || dayImported.length > 0
                    const canAddWorkout = canEdit && !day.isPast
                    return (
                      <div key={day.dateStr} className="flex flex-col gap-2 min-h-0">
                        <div
                          className={`shrink-0 text-center pb-2 border-b ${day.isToday ? 'border-b-2 border-[#627e59]' : 'border-stone-200'}`}
                        >
                          <span
                            className={`block text-xs font-semibold uppercase ${day.isToday ? 'text-[#627e59]' : 'text-stone-500'}`}
                          >
                            {day.dayName}
                          </span>
                          {day.isToday ? (
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#627e59] text-white shadow-md text-xl font-bold mt-1">
                              {day.label}
                            </div>
                          ) : (
                            <span className="block text-xl font-bold text-stone-800">{day.label}</span>
                          )}
                        </div>
                        <div
                          className={`flex-1 min-h-[320px] rounded-xl border p-1.5 flex flex-col gap-3 overflow-y-auto ${
                            day.isToday
                              ? 'bg-[#627e59]/5 border-[#627e59]/30 shadow-inner'
                              : hasContent
                                ? 'bg-white border-stone-200 shadow-inner'
                                : 'bg-stone-50 border-stone-200 border-dashed'
                          } ${canAddWorkout && !hasContent ? 'border-2 border-dashed border-stone-300 cursor-pointer hover:border-[#627e59] hover:bg-[#627e59]/5 transition-all group' : ''}`}
                          onClick={() => canAddWorkout && !hasContent && openDay(day.dateStr, day.isPast)}
                          role={canAddWorkout && !hasContent ? 'button' : undefined}
                        >
                          {hasContent ? (
                            <>
                              {dayGoals.map((g) => (
                                <div
                                  key={g.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openGoal(g)
                                  }}
                                  className="training-card rounded-lg px-3 py-2 text-xs border bg-[#8e9856]/10 border-[#8e9856]/30 text-palette-forest-dark cursor-pointer"
                                  role="button"
                                >
                                  <GoalTargetBadge isPrimary={g.is_primary} />
                                  <span className="font-medium truncate block">{g.race_name}</span>
                                  <span className="text-stone-600 truncate block">{g.distance}</span>
                                </div>
                              ))}
                              {dayImported.map((a) => {
                                const target = formatImportedActivityTarget(a)
                                return (
                                  <div
                                    key={a.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedImportedActivity(a)
                                    }}
                                    className="training-card bg-white p-3 rounded-lg shadow-sm border border-stone-100 border-l-4 border-l-[#FC4C02] cursor-pointer"
                                    role="button"
                                  >
                                    <div className="inline-flex items-center gap-1.5 mb-2">
                                      <img src="/strava-icon.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden />
                                      <span className="text-[10px] font-bold uppercase text-[#FC4C02] bg-orange-100 px-1.5 py-0.5 rounded leading-none">
                                        {getImportedActivityTypeLabel(a)}
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-stone-900 leading-tight mb-2">{a.title}</h4>
                                    {a.description ? (
                                      <p className="text-xs text-stone-500 leading-snug mb-3 line-clamp-2">{a.description}</p>
                                    ) : null}
                                    {target.primary && (
                                      <div className="flex items-center gap-3 text-xs text-stone-500 font-medium flex-wrap">
                                        {target.hasDistance ? (
                                          <>
                                            <div className="flex items-center gap-1">
                                              <MapIcon />
                                              <span>{target.primary}</span>
                                            </div>
                                            {target.secondary && (
                                              <>
                                                <div className="w-px h-3 bg-stone-300" />
                                                <div className="flex items-center gap-1">
                                                  <MountainIcon />
                                                  <span>{target.secondary}</span>
                                                </div>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <div className="flex items-center gap-1.5">
                                            <ClockIcon />
                                            <span>{target.primary}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              {dayWorkouts.map((w) => renderDetailedCard(w, day.dateStr))}
                            </>
                          ) : canAddWorkout ? (
                            <div className="flex-1 flex items-center justify-center min-h-[200px]">
                              <div className="w-12 h-12 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-300 shadow-sm group-hover:text-white group-hover:bg-[#627e59] group-hover:border-[#627e59] transition-all transform group-hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>
          )
        })}
      </div>

      <WorkoutModal
        key={workoutModalKey}
        isOpen={modalOpen}
        onClose={handleWorkoutModalClose}
        date={modalDate}
        athleteId={athleteId}
        pathToRevalidate={pathToRevalidate}
        canEdit={canEdit}
        workout={modalWorkout}
      />

      {goalModalOpen && selectedGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-modal-title"
        >
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setGoalModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-xl border-2 border-palette-forest-dark bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 id="goal-modal-title" className="text-lg font-semibold text-stone-900">
                Détails de l&apos;objectif
              </h2>
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-500 font-medium">Date</dt>
                <dd className="mt-0.5 text-stone-900">
                  {new Date(selectedGoal.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Nom de la course</dt>
                <dd className="mt-0.5 text-stone-900">{selectedGoal.race_name}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Distance</dt>
                <dd className="mt-0.5 text-stone-900">{selectedGoal.distance}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Type d&apos;objectif</dt>
                <dd className="mt-0.5 flex items-center gap-1.5">
                  <GoalTargetBadge isPrimary={selectedGoal.is_primary} />
                  <span className="text-stone-900">{selectedGoal.is_primary ? 'Objectif principal' : 'Objectif secondaire'}</span>
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="rounded-lg border-2 border-palette-forest-dark px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImportedActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="imported-activity-modal-title"
        >
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setSelectedImportedActivity(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-xl border-2 border-orange-300 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <img src="/strava-icon.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-[10px] font-semibold text-[#FC4C02] uppercase tracking-wide">{getImportedActivityTypeLabel(selectedImportedActivity)}</span>
                <h2 id="imported-activity-modal-title" className="text-lg font-semibold text-stone-900 truncate">
                  Détails de l&apos;activité
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImportedActivity(null)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-500 font-medium">Date</dt>
                <dd className="mt-0.5 text-stone-900">
                  {new Date(selectedImportedActivity.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Source</dt>
                <dd className="mt-0.5 text-stone-900 capitalize">{selectedImportedActivity.source}</dd>
              </div>
              <div>
                <dt className="text-stone-500 font-medium">Type de sport</dt>
                <dd className="mt-0.5 text-stone-900">{SPORT_LABELS[selectedImportedActivity.sport_type]}</dd>
              </div>
              {selectedImportedActivity.activity_type && (
                <div>
                  <dt className="text-stone-500 font-medium">Type d'activité</dt>
                  <dd className="mt-0.5 text-stone-900">{selectedImportedActivity.activity_type}</dd>
                </div>
              )}
              <div>
                <dt className="text-stone-500 font-medium">Titre</dt>
                <dd className="mt-0.5 text-stone-900">{selectedImportedActivity.title}</dd>
              </div>
              {selectedImportedActivity.description && (
                <div>
                  <dt className="text-stone-500 font-medium">Description</dt>
                  <dd className="mt-0.5 text-stone-900 whitespace-pre-wrap">{selectedImportedActivity.description}</dd>
                </div>
              )}
              {selectedImportedActivity.raw_data && typeof selectedImportedActivity.raw_data === 'object' && (
                <>
                  {typeof (selectedImportedActivity.raw_data as { distance?: number }).distance === 'number' && (
                    <div>
                      <dt className="text-stone-500 font-medium">Distance</dt>
                      <dd className="mt-0.5 text-stone-900">
                        {((selectedImportedActivity.raw_data as { distance: number }).distance / 1000).toFixed(2)} km
                      </dd>
                    </div>
                  )}
                  {typeof (selectedImportedActivity.raw_data as { moving_time?: number }).moving_time === 'number' && (
                    <div>
                      <dt className="text-stone-500 font-medium">Temps de déplacement</dt>
                      <dd className="mt-0.5 text-stone-900">
                        {Math.floor((selectedImportedActivity.raw_data as { moving_time: number }).moving_time / 60)} min
                      </dd>
                    </div>
                  )}
                  {typeof (selectedImportedActivity.raw_data as { total_elevation_gain?: number }).total_elevation_gain === 'number' && (
                    <div>
                      <dt className="text-stone-500 font-medium">Dénivelé positif</dt>
                      <dd className="mt-0.5 text-stone-900">
                        {Math.round((selectedImportedActivity.raw_data as { total_elevation_gain: number }).total_elevation_gain)} m
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedImportedActivity(null)}
                className="rounded-lg border-2 border-orange-400 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-orange-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
