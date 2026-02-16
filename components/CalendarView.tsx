'use client'

import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from './Button'
import { IconClose } from './icons/IconClose'
import { WorkoutModal } from './WorkoutModal'
import { Modal } from './Modal'
import { IconRunning, IconBiking, IconSwimming, IconDumbbell, IconNordicSki, IconBackcountrySki, IconIceSkating } from './SportIcons'
import { SPORT_ICONS, SPORT_CARD_STYLES, SPORT_TRANSLATION_KEYS } from '@/lib/sportStyles'
import { ActivityTile } from './ActivityTile'
import type { Workout, SportType, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'

/** Formate une durée en minutes (ex. "4h00", "45'"). */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}'`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h00`
}

/** Formate la vitesse selon le type de sport. */
function formatPace(pace: number | null | undefined, sportType: SportType): string {
  if (!pace || pace <= 0) return ''
  if (sportType === 'course') {
    // min/km
    return `${pace.toFixed(1)} min/km`
  } else if (sportType === 'velo') {
    // km/h
    return `${Math.round(pace)} km/h`
  } else if (sportType === 'natation') {
    // min/100m
    return `${pace.toFixed(1)} min/100m`
  }
  return ''
}

/** Formate l'objectif d'un entraînement pour affichage (ex. "45'", "1h30", "10.5 km", "120m D+"). */
function formatWorkoutTarget(w: Workout): { primary: string; secondary?: string; hasDistance?: boolean } {
  if (w.target_duration_minutes != null && w.target_duration_minutes > 0) {
    const m = w.target_duration_minutes
    const primary = m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : '00'}` : `${m}'`
    return { primary, secondary: undefined, hasDistance: false }
  }
  if (w.target_distance_km != null && w.target_distance_km > 0) {
    const primary =
      w.sport_type === 'natation'
        ? `${Math.round(w.target_distance_km * 1000)} m`
        : `${Number(w.target_distance_km) % 1 === 0 ? w.target_distance_km : (w.target_distance_km as number).toFixed(1)} km`
    const secondary =
      w.target_elevation_m != null && w.target_elevation_m > 0 ? `${w.target_elevation_m}m D+` : undefined
    return { primary, secondary, hasDistance: true }
  }
  return { primary: '' }
}

/** Formate les métadonnées d'un entraînement pour ActivityTile (ex. ["1h30", "15 km", "200m D+"]). */
function formatWorkoutMetadata(w: Workout): string[] {
  const metadata: string[] = []
  if (w.target_duration_minutes != null && w.target_duration_minutes > 0) {
    metadata.push(formatDuration(w.target_duration_minutes))
  }
  if (w.target_distance_km != null && w.target_distance_km > 0) {
    const dist = w.sport_type === 'natation'
      ? `${Math.round(w.target_distance_km * 1000)} m`
      : `${Number(w.target_distance_km) % 1 === 0 ? w.target_distance_km : (w.target_distance_km as number).toFixed(1)} km`
    metadata.push(dist)
  }
  if (w.target_elevation_m != null && w.target_elevation_m > 0) {
    metadata.push(`${w.target_elevation_m}m D+`)
  }
  return metadata
}

/** Formate les métadonnées d'une activité Strava pour ActivityTile (ex. ["10.5 km", "150m D+"]). */
function formatStravaMetadata(a: ImportedActivity): string[] {
  const metadata: string[] = []
  const raw = a.raw_data as { moving_time?: number; distance?: number; total_elevation_gain?: number } | null
  if (!raw) return metadata
  
  const distanceM = raw.distance
  const elevationM = raw.total_elevation_gain
  
  if (distanceM != null && distanceM > 0) {
    const km = distanceM / 1000
    metadata.push(`${km % 1 === 0 ? km : km.toFixed(1)} km`)
  }
  if (elevationM != null && elevationM > 0) {
    metadata.push(`${Math.round(elevationM)}m D+`)
  }
  return metadata
}

/** Libellé du type d'activité pour l'affichage (activity_type, raw_data.type ou type de sport). */
function getImportedActivityTypeLabel(a: ImportedActivity, tSports: (key: string) => string): string {
  if (a.activity_type && String(a.activity_type).trim()) return String(a.activity_type).trim()
  const raw = a.raw_data as { type?: string } | null
  if (raw?.type && typeof raw.type === 'string') return raw.type.trim()
  const translationKey = SPORT_TRANSLATION_KEYS[a.sport_type]
  return translationKey ? tSports(translationKey) : a.sport_type
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

import { getWeekMonday, toDateStr } from '@/lib/dateUtils'

// Day names will be dynamically loaded using translations

/** Totaux "fait" par sport pour une semaine (minutes, distance km). */
type WeekFaitBySport = Record<SportType, { minutes: number; distanceKm: number }>

type CalendarViewProps = {
  athleteId: string
  athleteEmail: string
  workouts: Workout[]
  importedActivities?: ImportedActivity[]
  /** Totaux hebdomadaires (activités importées) pour afficher le "fait". */
  weeklyTotals?: ImportedActivityWeeklyTotal[]
  /** Totaux hebdomadaires précalculés (entraînements prévus) pour afficher le "prévu". */
  workoutTotals?: WorkoutWeeklyTotal[]
  goals?: Goal[]
  canEdit: boolean
  /** Vue athlète (son propre calendrier) : modale "Mon entrainement" */
  athleteView?: boolean
  pathToRevalidate: string
  referenceMonday?: Date
  onNavigate?: (weeksOffset: number) => void
  /** Appelé après enregistrement réussi (modale fermée). Si updatedWorkout est fourni, le parent peut fusionner au lieu de tout recharger. */
  onWorkoutSaved?: (updatedWorkout?: Workout) => void
  /** Quand true, le titre de la première semaine n'est pas affiché (il est dans la barre de navigation). */
  hideFirstWeekTitle?: boolean
}

/** Icône cible avec badge 1 (objectif principal) ou 2 (secondaire). */
function GoalTargetBadge({ isPrimary, title }: { isPrimary: boolean; title: string }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" title={title}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-palette-forest-dark">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
      <span className="ml-0.5 text-[10px] font-bold text-palette-forest-dark leading-none">{isPrimary ? '1' : '2'}</span>
    </span>
  )
}

const EMPTY_FAIT: WeekFaitBySport = {
  course: { minutes: 0, distanceKm: 0 },
  velo: { minutes: 0, distanceKm: 0 },
  natation: { minutes: 0, distanceKm: 0 },
  musculation: { minutes: 0, distanceKm: 0 },
  nordic_ski: { minutes: 0, distanceKm: 0 },
  backcountry_ski: { minutes: 0, distanceKm: 0 },
  ice_skating: { minutes: 0, distanceKm: 0 },
}

export function CalendarView({
  athleteId,
  workouts,
  importedActivities = [],
  weeklyTotals = [],
  workoutTotals = [],
  goals = [],
  canEdit,
  athleteView = false,
  pathToRevalidate,
  referenceMonday,
  onNavigate,
  onWorkoutSaved,
  hideFirstWeekTitle = false,
}: CalendarViewProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const tCalendar = useTranslations('calendar')
  const tWorkouts = useTranslations('workouts')
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const tSports = useTranslations('sports')
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>('')
  const [modalWorkout, setModalWorkout] = useState<Workout | null>(null)
  const [workoutModalKey, setWorkoutModalKey] = useState(0)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedImportedActivity, setSelectedImportedActivity] = useState<ImportedActivity | null>(null)
  const [extraActivitiesModalOpen, setExtraActivitiesModalOpen] = useState(false)
  const [extraActivitiesList, setExtraActivitiesList] = useState<Array<{ type: 'workout'; item: Workout; dateStr: string } | { type: 'imported'; item: ImportedActivity; dateStr: string } | { type: 'goal'; item: Goal; dateStr: string }>>([])
  const [extraActivitiesModalDate, setExtraActivitiesModalDate] = useState<string | null>(null)

  const openGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setGoalModalOpen(true)
  }

  const { startMonday, weeks } = useMemo(() => {
    const today = new Date()
    const baseMonday = referenceMonday ? getWeekMonday(referenceMonday) : getWeekMonday(today)
    const startMonday = new Date(baseMonday)
    startMonday.setDate(startMonday.getDate() - 7)

    // Get month names based on locale
    const getMonthName = (monthIndex: number): string => {
      const date = new Date(2000, monthIndex, 1)
      return new Intl.DateTimeFormat(localeTag, { month: 'long' }).format(date)
    }
    
    const getShortMonthName = (monthIndex: number): string => {
      const date = new Date(2000, monthIndex, 1)
      return new Intl.DateTimeFormat(localeTag, { month: 'short' }).format(date).replace('.', '')
    }
    
    const getDayNames = (): string[] => {
      return [
        tCalendar('days.mon'),
        tCalendar('days.tue'),
        tCalendar('days.wed'),
        tCalendar('days.thu'),
        tCalendar('days.fri'),
        tCalendar('days.sat'),
        tCalendar('days.sun'),
      ]
    }
    
    const DAY_NAMES = getDayNames()
    
    const weeks: { label: string; monthLabel: string; rangeLabel: string; isCurrentWeek: boolean; days: { dateStr: string; label: string; dayName: string; isToday: boolean; isTomorrow: boolean; isPast: boolean }[] }[] = []
    
    const todayMonday = getWeekMonday(today)

    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(startMonday)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const weekMonday = getWeekMonday(weekStart)
      const monthLabel = getMonthName(weekStart.getMonth())
      
      const firstDay = new Date(weekStart)
      const lastDay = new Date(weekStart)
      lastDay.setDate(lastDay.getDate() + 6)
      const rangeLabel = `${firstDay.getDate()} ${getShortMonthName(firstDay.getMonth())} - ${lastDay.getDate()} ${getShortMonthName(lastDay.getMonth())}`
      let weekLabel = ''
      let isCurrentWeek = false
      if (weekMonday.getTime() === todayMonday.getTime()) {
        weekLabel = tCalendar('currentWeek')
        isCurrentWeek = true
      } else if (weekMonday.getTime() < todayMonday.getTime()) {
        const diffWeeks = Math.round((todayMonday.getTime() - weekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        weekLabel = diffWeeks === 1 ? tCalendar('previousWeek') : tCalendar('weeksAgo', { weeks: diffWeeks })
      } else {
        const diffWeeks = Math.round((weekMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
        weekLabel = diffWeeks === 1 ? tCalendar('nextWeek') : tCalendar('inWeeks', { weeks: diffWeeks })
      }

      const days: { dateStr: string; label: string; dayName: string; isToday: boolean; isTomorrow: boolean; isPast: boolean }[] = []
      const todayStr = toDateStr(today)
      const tomorrowDate = new Date(today)
      tomorrowDate.setDate(tomorrowDate.getDate() + 1)
      const tomorrowStr = toDateStr(tomorrowDate)
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const dateStr = toDateStr(day)
        const isToday = todayStr === dateStr
        const isTomorrow = tomorrowStr === dateStr
        const isPast = dateStr < todayStr
        const dayIndex = (day.getDay() + 6) % 7
        days.push({
          dateStr,
          label: day.getDate().toString(),
          dayName: DAY_NAMES[dayIndex],
          isToday,
          isTomorrow,
          isPast,
        })
      }
      weeks.push({ label: weekLabel, monthLabel, rangeLabel, isCurrentWeek, days })
    }

    return { startMonday, weeks }
  }, [referenceMonday, locale, localeTag, tCalendar])

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

  /** Totaux prévus par semaine et par sport (depuis workout_weekly_totals précalculés). Distance en km pour course/vélo/natation, temps pour musculation. */
  const weekPrevuBySport = useMemo(() => {
    if (!referenceMonday) return [EMPTY_FAIT, EMPTY_FAIT, EMPTY_FAIT]
    
    return weeks.map((week) => {
      // Trouver le lundi de cette semaine
      const weekStartDate = new Date(week.days[0]!.dateStr + 'T12:00:00')
      const weekMonday = getWeekMonday(weekStartDate)
      const weekStartStr = toDateStr(weekMonday)
      
      // Récupérer les totaux précalculés pour cette semaine
      const totalsForWeek = workoutTotals.filter((t) => t.week_start === weekStartStr)
      
      const bySport: Record<SportType, { minutes: number; distanceKm: number }> = {
        course: { minutes: 0, distanceKm: 0 },
        velo: { minutes: 0, distanceKm: 0 },
        natation: { minutes: 0, distanceKm: 0 },
        musculation: { minutes: 0, distanceKm: 0 },
        nordic_ski: { minutes: 0, distanceKm: 0 },
        backcountry_ski: { minutes: 0, distanceKm: 0 },
        ice_skating: { minutes: 0, distanceKm: 0 },
      }
      
      for (const total of totalsForWeek) {
        bySport[total.sport_type] = {
          minutes: Math.round(Number(total.total_duration_minutes) || 0),
          distanceKm: Math.round(Number(total.total_distance_km) || 0),
        }
      }
      
      return bySport
    })
  }, [weeks, workoutTotals, referenceMonday])

  /** Totaux "fait" par semaine (depuis imported_activity_weekly_totals). */
  const weekFaitBySport = useMemo((): WeekFaitBySport[] => {
    const empty = (): WeekFaitBySport => ({
      course: { minutes: 0, distanceKm: 0 },
      velo: { minutes: 0, distanceKm: 0 },
        natation: { minutes: 0, distanceKm: 0 },
        musculation: { minutes: 0, distanceKm: 0 },
        nordic_ski: { minutes: 0, distanceKm: 0 },
        backcountry_ski: { minutes: 0, distanceKm: 0 },
        ice_skating: { minutes: 0, distanceKm: 0 },
      })
    if (!referenceMonday) return [empty(), empty(), empty()]
    return [0, 1, 2].map((wi) => {
      const mon = new Date(referenceMonday)
      mon.setDate(mon.getDate() + (wi - 1) * 7)
      const weekStartStr = toDateStr(mon)
      const rows = weeklyTotals.filter((t) => t.week_start === weekStartStr)
      const bySport: WeekFaitBySport = {
        course: { minutes: 0, distanceKm: 0 },
        velo: { minutes: 0, distanceKm: 0 },
        natation: { minutes: 0, distanceKm: 0 },
        musculation: { minutes: 0, distanceKm: 0 },
        nordic_ski: { minutes: 0, distanceKm: 0 },
        backcountry_ski: { minutes: 0, distanceKm: 0 },
        ice_skating: { minutes: 0, distanceKm: 0 },
      }
      for (const r of rows) {
        bySport[r.sport_type] = {
          minutes: Math.round((r.total_moving_time_seconds ?? 0) / 60),
          distanceKm: Math.round((r.total_distance_m ?? 0) / 1000),
        }
      }
      // Arrondir les totaux à l'entier
      return {
        course: { minutes: Math.round(bySport.course.minutes), distanceKm: Math.round(bySport.course.distanceKm) },
        velo: { minutes: Math.round(bySport.velo.minutes), distanceKm: Math.round(bySport.velo.distanceKm) },
        natation: { minutes: Math.round(bySport.natation.minutes), distanceKm: Math.round(bySport.natation.distanceKm) },
        musculation: { minutes: Math.round(bySport.musculation.minutes), distanceKm: Math.round(bySport.musculation.distanceKm) },
        nordic_ski: { minutes: Math.round(bySport.nordic_ski.minutes), distanceKm: Math.round(bySport.nordic_ski.distanceKm) },
        backcountry_ski: { minutes: Math.round(bySport.backcountry_ski.minutes), distanceKm: Math.round(bySport.backcountry_ski.distanceKm) },
        ice_skating: { minutes: Math.round(bySport.ice_skating.minutes), distanceKm: Math.round(bySport.ice_skating.distanceKm) },
      }
    })
  }, [referenceMonday, weeklyTotals])

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

  const handleWorkoutModalClose = useCallback((closedBySuccess?: boolean, updatedWorkout?: Workout) => {
    setModalOpen(false)
    if (closedBySuccess) {
      onWorkoutSaved?.(updatedWorkout)
      setTimeout(() => router.refresh(), 150)
    }
  }, [router, onWorkoutSaved])

  const renderCompactCard = (w: Workout, dateStr: string) => {
    const style = SPORT_CARD_STYLES[w.sport_type]
    const target = formatWorkoutTarget(w)
    const SportIcon = SPORT_ICONS[w.sport_type]
    const hasDuration = w.target_duration_minutes != null && w.target_duration_minutes > 0
    const hasDistance = w.target_distance_km != null && w.target_distance_km > 0
    const hasPace = w.target_pace != null && w.target_pace > 0
    const paceStr = formatPace(w.target_pace, w.sport_type)
    
    return (
      <div
        key={w.id}
        onClick={(e) => {
          e.stopPropagation()
          openWorkout(dateStr, w)
        }}
        className={`bg-white rounded border-l-4 ${style.borderLeft} shadow-sm p-1.5 h-full flex flex-col justify-between cursor-pointer ${canEdit ? 'training-card' : 'hover:shadow-md transition-shadow'}`}
        role="button"
      >
        <div>
          <div>
            <span className={`float-left inline-flex items-center mr-1.5 ${style.badge} ${style.badgeBg} px-1 py-0.5 rounded shrink-0`}>
              <SportIcon className="w-2.5 h-2.5" />
            </span>
            <div className="text-xs font-semibold text-stone-700 leading-tight">{w.title}</div>
            <div className="clear-both"></div>
          </div>
        </div>
        {(hasDuration || hasDistance || hasPace) && (
          <div className="flex items-center gap-1 flex-wrap text-[10px] text-stone-400 font-medium mt-1">
            {hasDuration && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(Math.round(w.target_duration_minutes!))}</span>
              </div>
            )}
            {hasDistance && (
              <>
                {hasDuration && <div className="w-px h-2.5 bg-stone-300" />}
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>
                    {w.sport_type === 'natation' 
                      ? `${Math.round(w.target_distance_km! * 1000)} m`
                      : `${Math.round(w.target_distance_km!)} km`}
                  </span>
                </div>
              </>
            )}
            {hasPace && (
              <>
                {(hasDuration || hasDistance) && <div className="w-px h-2.5 bg-stone-300" />}
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{paceStr}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderDetailedCard = (w: Workout, dateStr: string) => {
    const style = SPORT_CARD_STYLES[w.sport_type]
    const target = formatWorkoutTarget(w)
    const SportIcon = SPORT_ICONS[w.sport_type]
    const hasDuration = w.target_duration_minutes != null && w.target_duration_minutes > 0
    const hasDistance = w.target_distance_km != null && w.target_distance_km > 0
    const hasPace = w.target_pace != null && w.target_pace > 0
    const paceStr = formatPace(w.target_pace, w.sport_type)
    
    return (
      <div
        key={w.id}
        onClick={(e) => {
          e.stopPropagation()
          openWorkout(dateStr, w)
        }}
        className={`bg-white p-3 rounded-lg shadow-sm border border-stone-100 border-l-4 ${style.borderLeft} cursor-pointer ${canEdit ? 'training-card' : 'hover:shadow-md transition-shadow'}`}
        role="button"
      >
        <div className="mb-2">
          <span className={`float-left inline-flex items-center mr-2 ${style.badge} ${style.badgeBg} px-1.5 py-0.5 rounded shrink-0`}>
            <SportIcon className="w-3 h-3" />
          </span>
          <h4 className="text-sm font-bold text-stone-900 leading-tight">{w.title}</h4>
          <div className="clear-both"></div>
        </div>
        <p className="text-xs text-stone-500 leading-snug mb-3 line-clamp-2">{w.description || '—'}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium flex-wrap">
          {hasDuration && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDuration(Math.round(w.target_duration_minutes!))}</span>
            </div>
          )}
          {hasDistance && (
            <>
              {hasDuration && <div className="w-px h-3 bg-stone-300" />}
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>
                  {w.sport_type === 'natation' 
                    ? `${Math.round(w.target_distance_km! * 1000)} m`
                    : `${Math.round(w.target_distance_km!)} km`}
                </span>
              </div>
            </>
          )}
          {hasPace && (
            <>
              {(hasDuration || hasDistance) && <div className="w-px h-3 bg-stone-300" />}
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{paceStr}</span>
              </div>
            </>
          )}
          {target.secondary && (hasDuration || hasDistance || hasPace) && (
            <>
              <div className="w-px h-3 bg-stone-300" />
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{target.secondary}</span>
              </div>
            </>
          )}
        </div>
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
                <div className={`flex items-center justify-between w-full gap-4 mb-3 ${isDetailed ? 'mb-4 mt-8' : ''}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    {isDetailed ? (
                      <>
                        <h2 className="text-xl font-bold text-palette-forest-dark">
                          {week.label}
                        </h2>
                        <span className="text-stone-400 font-medium text-sm">— {week.rangeLabel.replace(' - ', ' au ')}</span>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{week.label}</h2>
                        <span className="text-stone-400 font-medium text-xs">— {week.rangeLabel.replace(' - ', ' au ')}</span>
                        <div className="h-px w-12 bg-stone-200 shrink-0" />
                      </>
                    )}
                  </div>
                  {!isDetailed && (
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-500 shrink-0 flex-wrap justify-end">
                      {(() => {
                        const prevu = weekPrevuBySport[wi]
                        const fait = weekFaitBySport[wi]
                        const totalPrevuMin = prevu ? Math.round((prevu.course?.minutes ?? 0) + (prevu.velo?.minutes ?? 0) + (prevu.natation?.minutes ?? 0) + (prevu.musculation?.minutes ?? 0) + (prevu.nordic_ski?.minutes ?? 0) + (prevu.backcountry_ski?.minutes ?? 0) + (prevu.ice_skating?.minutes ?? 0)) : 0
                        const totalFaitMin = fait ? Math.round((fait.course?.minutes ?? 0) + (fait.velo?.minutes ?? 0) + (fait.natation?.minutes ?? 0) + (fait.musculation?.minutes ?? 0) + (fait.nordic_ski?.minutes ?? 0) + (fait.backcountry_ski?.minutes ?? 0) + (fait.ice_skating?.minutes ?? 0)) : 0
                        const showTime = totalPrevuMin > 0 || totalFaitMin > 0
                        const formatDist = (km: number) => String(Math.round(km))
                        return (
                          <>
                            {showTime && (
                              <>
                                <span className="flex items-center gap-1.5 text-stone-600" title={tCalendar('weekly.timeCompletedPlanned')}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatDuration(totalFaitMin)} / {formatDuration(totalPrevuMin)}
                                </span>
                                <span className="w-px h-3 bg-stone-300" />
                              </>
                            )}
                            {(prevu?.course?.distanceKm ?? 0) > 0 || (fait?.course?.distanceKm ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-palette-forest-dark" title={tCalendar('weekly.runningDistanceCompletedPlanned')}>
                                <IconRunning className="w-3.5 h-3.5" />
                                {formatDist(fait?.course?.distanceKm ?? 0)} km / {formatDist(prevu?.course?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                            {(prevu?.velo?.distanceKm ?? 0) > 0 || (fait?.velo?.distanceKm ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-palette-olive" title={tCalendar('weekly.cyclingDistanceCompletedPlanned')}>
                                <IconBiking className="w-3.5 h-3.5" />
                                {formatDist(fait?.velo?.distanceKm ?? 0)} km / {formatDist(prevu?.velo?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                            {((prevu?.natation?.distanceKm ?? 0) > 0 || (fait?.natation?.distanceKm ?? 0) > 0 || (prevu?.natation?.minutes ?? 0) > 0 || (fait?.natation?.minutes ?? 0) > 0) ? (
                              <span className="flex items-center gap-1.5 text-sky-600" title={tCalendar('weekly.swimmingDistanceCompletedPlanned')}>
                                <IconSwimming className="w-3.5 h-3.5" />
                                {formatDist(fait?.natation?.distanceKm ?? 0)} km / {formatDist(prevu?.natation?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                            {(prevu?.musculation?.minutes ?? 0) > 0 || (fait?.musculation?.minutes ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-stone-600" title={tCalendar('weekly.strengthTimeCompletedPlanned')}>
                                <IconDumbbell className="w-3.5 h-3.5" />
                                {formatDuration(fait?.musculation?.minutes ?? 0)} / {formatDuration(prevu?.musculation?.minutes ?? 0)}
                              </span>
                            ) : null}
                            {(prevu?.nordic_ski?.distanceKm ?? 0) > 0 || (fait?.nordic_ski?.distanceKm ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-palette-sage" title={tCalendar('weekly.nordicSkiDistanceCompletedPlanned')}>
                                <IconNordicSki className="w-3.5 h-3.5" />
                                {formatDist(fait?.nordic_ski?.distanceKm ?? 0)} km / {formatDist(prevu?.nordic_ski?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                            {(prevu?.backcountry_ski?.distanceKm ?? 0) > 0 || (fait?.backcountry_ski?.distanceKm ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-palette-gold" title={tCalendar('weekly.backcountrySkiDistanceCompletedPlanned')}>
                                <IconBackcountrySki className="w-3.5 h-3.5" />
                                {formatDist(fait?.backcountry_ski?.distanceKm ?? 0)} km / {formatDist(prevu?.backcountry_ski?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                            {(prevu?.ice_skating?.distanceKm ?? 0) > 0 || (fait?.ice_skating?.distanceKm ?? 0) > 0 ? (
                              <span className="flex items-center gap-1.5 text-cyan-600" title={tCalendar('weekly.iceSkatingDistanceCompletedPlanned')}>
                                <IconIceSkating className="w-3.5 h-3.5" />
                                {formatDist(fait?.ice_skating?.distanceKm ?? 0)} km / {formatDist(prevu?.ice_skating?.distanceKm ?? 0)} km
                              </span>
                            ) : null}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
              {isDetailed && (() => {
                const prevu = weekPrevuBySport[1]
                const fait = weekFaitBySport[1]
                const prevWeekFait = weekFaitBySport[0]
                const totalPrevuMin = prevu ? Math.round((prevu.course?.minutes ?? 0) + (prevu.velo?.minutes ?? 0) + (prevu.natation?.minutes ?? 0) + (prevu.musculation?.minutes ?? 0) + (prevu.nordic_ski?.minutes ?? 0) + (prevu.backcountry_ski?.minutes ?? 0) + (prevu.ice_skating?.minutes ?? 0)) : 0
                const totalFaitMin = fait ? Math.round((fait.course?.minutes ?? 0) + (fait.velo?.minutes ?? 0) + (fait.natation?.minutes ?? 0) + (fait.musculation?.minutes ?? 0) + (fait.nordic_ski?.minutes ?? 0) + (fait.backcountry_ski?.minutes ?? 0) + (fait.ice_skating?.minutes ?? 0)) : 0
                const prevTotalMin = prevWeekFait ? Math.round((prevWeekFait.course?.minutes ?? 0) + (prevWeekFait.velo?.minutes ?? 0) + (prevWeekFait.natation?.minutes ?? 0) + (prevWeekFait.musculation?.minutes ?? 0) + (prevWeekFait.nordic_ski?.minutes ?? 0) + (prevWeekFait.backcountry_ski?.minutes ?? 0) + (prevWeekFait.ice_skating?.minutes ?? 0)) : 0
                const diffPct = prevTotalMin > 0 ? Math.round(((totalFaitMin - prevTotalMin) / prevTotalMin) * 100) : 0
                const progressPct = totalPrevuMin > 0 ? Math.round((totalFaitMin / totalPrevuMin) * 100) : 0
                const sports = [
                  { key: 'course' as const, Icon: IconRunning, color: 'text-palette-forest-dark', bg: 'bg-palette-forest-dark', label: tCalendar('weekly.sportLabels.run'), prevuVal: prevu?.course?.distanceKm ?? 0, faitVal: fait?.course?.distanceKm ?? 0, useTime: false },
                  { key: 'velo' as const, Icon: IconBiking, color: 'text-palette-olive', bg: 'bg-palette-olive', label: tCalendar('weekly.sportLabels.cycling'), prevuVal: prevu?.velo?.distanceKm ?? 0, faitVal: fait?.velo?.distanceKm ?? 0, useTime: false },
                  { 
                    key: 'natation' as const, 
                    Icon: IconSwimming, 
                    color: 'text-sky-600', 
                    bg: 'bg-sky-500', 
                    label: tCalendar('weekly.sportLabels.swimming'), 
                    prevuVal: prevu?.natation?.distanceKm ?? 0, 
                    faitVal: fait?.natation?.distanceKm ?? 0, 
                    useTime: false 
                  },
                  { key: 'musculation' as const, Icon: IconDumbbell, color: 'text-stone-600', bg: 'bg-stone-500', label: tCalendar('weekly.sportLabels.strength'), prevuVal: prevu?.musculation?.minutes ?? 0, faitVal: fait?.musculation?.minutes ?? 0, useTime: true },
                  { key: 'nordic_ski' as const, Icon: IconNordicSki, color: 'text-palette-sage', bg: 'bg-palette-sage', label: tCalendar('weekly.sportLabels.nordicSki'), prevuVal: prevu?.nordic_ski?.distanceKm ?? 0, faitVal: fait?.nordic_ski?.distanceKm ?? 0, useTime: false },
                  { key: 'backcountry_ski' as const, Icon: IconBackcountrySki, color: 'text-palette-gold', bg: 'bg-palette-gold', label: tCalendar('weekly.sportLabels.backcountrySki'), prevuVal: prevu?.backcountry_ski?.distanceKm ?? 0, faitVal: fait?.backcountry_ski?.distanceKm ?? 0, useTime: false },
                  { key: 'ice_skating' as const, Icon: IconIceSkating, color: 'text-cyan-600', bg: 'bg-cyan-500', label: tCalendar('weekly.sportLabels.iceSkating'), prevuVal: prevu?.ice_skating?.distanceKm ?? 0, faitVal: fait?.ice_skating?.distanceKm ?? 0, useTime: false },
                ].filter(s => s.prevuVal > 0 || s.faitVal > 0)
                const hasAnyTotals = (totalPrevuMin > 0 || totalFaitMin > 0) || sports.length > 0
                if (!hasAnyTotals) return null
                return (
                  <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 pt-3 pb-5 mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {(totalPrevuMin > 0 || totalFaitMin > 0) && (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs mb-2 min-h-7">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-palette-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="font-semibold text-palette-amber leading-tight">{tCalendar('weekly.totalTimeVolume')}</span>
                          </div>
                          <div className="relative w-full mt-2">
                            <div className="w-full bg-stone-100 rounded-full h-1.5 relative">
                              {totalFaitMin > 0 && (
                                <div className="bg-palette-amber h-1.5 rounded-full transition-all relative overflow-visible" style={{ width: totalPrevuMin > 0 ? `${Math.min(100, progressPct)}%` : '100%' }}>
                                  <span className="absolute right-0 top-0 translate-y-[-100%] text-[10px] text-palette-amber font-bold whitespace-nowrap" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                    {formatDuration(totalFaitMin)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {totalPrevuMin > 0 && (
                              <span className="absolute right-0 top-full mt-0.5 text-[10px] text-stone-400">
                                {formatDuration(totalPrevuMin)} {tCalendar('weekly.planned')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {sports.map(({ key, Icon, color, bg, label, prevuVal, faitVal, useTime }) => {
                        const barPct = prevuVal > 0 ? Math.min(100, Math.round((faitVal / prevuVal) * 100)) : (faitVal > 0 ? 100 : 0)
                        const prevuDisplay = useTime ? formatDuration(Math.round(prevuVal)) : (prevuVal > 0 ? `${Math.round(prevuVal)} km` : '—')
                        const faitDisplay = useTime ? formatDuration(Math.round(faitVal)) : (faitVal > 0 ? `${Math.round(faitVal)} km` : '0 km')
                        return (
                              <div key={key} className="flex flex-col">
                                <div className="flex items-center gap-2 text-xs mb-2 min-h-7">
                                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                                  <span className={`font-semibold ${color} leading-tight`}>{label}</span>
                                </div>
                                <div className="relative w-full mt-2">
                                  <div className="w-full bg-stone-100 rounded-full h-1.5 relative">
                                    {faitVal > 0 && (
                                      <div className={`h-full ${bg} rounded-full transition-all relative overflow-visible`} style={{ width: `${barPct}%` }}>
                                        <span className={`absolute right-0 top-0 translate-y-[-100%] text-[10px] ${color} font-bold whitespace-nowrap`} style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                          {faitDisplay}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {prevuVal > 0 && (
                                    <span className="absolute right-0 top-full mt-0.5 text-[10px] text-stone-400">
                                      {prevuDisplay} {tCalendar('weekly.planned')}
                                    </span>
                                  )}
                                </div>
                              </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
              <div className={`grid grid-cols-7 gap-2 min-w-[800px] overflow-x-auto hide-scroll items-stretch ${isDetailed ? 'gap-3' : ''}`}>
                {isCondensed &&
                  <>
                  {week.days.map((day) => {
                    const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                    const dayImported = importedByDate[day.dateStr] ?? []
                    const dayGoals = goalsByDate[day.dateStr] ?? []
                    const firstWorkout = dayWorkouts[0]
                    const firstImported = dayImported[0]
                    const firstGoal = dayGoals[0]
                    const isEmpty = !firstWorkout && !firstImported && !firstGoal
                    const showAddInCondensed = (wi === 0 || wi === 2) && canEdit && !day.isPast && isEmpty
                    const showAddAtBottom = (wi === 0 || wi === 2) && canEdit && !day.isPast && !isEmpty
                    const dayTotal = dayWorkouts.length + dayImported.length + dayGoals.length
                    const dayExtraCount = dayTotal > 1 ? dayTotal - 1 : 0
                    const dayFullList: Array<{ type: 'workout'; item: Workout; dateStr: string } | { type: 'imported'; item: ImportedActivity; dateStr: string } | { type: 'goal'; item: Goal; dateStr: string }> = []
                    if (dayTotal > 0) {
                      dayGoals.forEach((goal) => dayFullList.push({ type: 'goal', item: goal, dateStr: day.dateStr }))
                      dayWorkouts.forEach((workout) => dayFullList.push({ type: 'workout', item: workout, dateStr: day.dateStr }))
                      dayImported.forEach((act) => dayFullList.push({ type: 'imported', item: act, dateStr: day.dateStr }))
                    }
                    return (
                      <div
                        key={day.dateStr}
                        onClick={showAddInCondensed ? () => openDay(day.dateStr, day.isPast) : undefined}
                        role={showAddInCondensed ? 'button' : undefined}
                        className={`min-h-24 rounded-lg border border-stone-200 p-1.5 flex flex-col ${
                          showAddInCondensed
                            ? 'border-2 border-dashed border-stone-300 justify-center items-center cursor-pointer hover:border-palette-forest-dark hover:bg-palette-forest-dark/5 transition-all group'
                            : isEmpty
                              ? 'bg-stone-100/50'
                              : 'bg-white shadow-sm'
                        }`}
                      >
                        {showAddAtBottom ? (
                          <>
                            <div className="min-h-0 shrink-0">
                              {firstGoal && !firstWorkout && !firstImported && (() => {
                                const isPrimary = firstGoal.is_primary
                                const borderColor = isPrimary ? 'border-palette-amber' : 'border-palette-sage'
                                const badgeColor = isPrimary ? 'text-palette-amber bg-palette-amber/10' : 'text-palette-sage bg-palette-sage/10'
                                return (
                                  <div
                                    onClick={(e) => { e.stopPropagation(); openGoal(firstGoal) }}
                                    className={`bg-white rounded border-l-4 ${borderColor} shadow-sm p-1.5 h-full flex flex-col justify-between cursor-pointer training-card`}
                                    role="button"
                                  >
                                    <div>
                                      <div>
                                        <span className={`float-left inline-flex items-center mr-1.5 ${badgeColor} px-1 py-0.5 rounded shrink-0`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                          </svg>
                                        </span>
                                        <div className="text-xs font-semibold text-stone-700 leading-tight">{firstGoal.race_name}</div>
                                        <div className="clear-both"></div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap text-[10px] text-stone-400 font-medium mt-1">
                                      <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <span>{firstGoal.distance} km</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })()}
                              {firstWorkout && renderCompactCard(firstWorkout, day.dateStr)}
                              {!firstWorkout && !firstGoal && firstImported && (() => {
                                const target = formatImportedActivityTarget(firstImported)
                                return (
                                  <div
                                    onClick={(e) => { e.stopPropagation(); setSelectedImportedActivity(firstImported) }}
                                    className="bg-white rounded border-l-4 border-palette-strava shadow-sm h-full p-1.5 flex flex-col justify-between cursor-pointer training-card w-full"
                                    role="button"
                                  >
                                    <div>
                                      <div className="inline-flex items-center gap-1 align-middle">
                                        <img src="/strava-icon.svg" alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                        <span className="text-[9px] font-bold uppercase text-palette-strava bg-orange-100 px-1 py-0.5 rounded leading-none">
                                          {getImportedActivityTypeLabel(firstImported, tSports)}
                                        </span>
                                      </div>
                                      <div className="text-xs font-semibold text-stone-700 mt-1 truncate">{firstImported.title}</div>
                                    </div>
                                    {target.primary && (
                                      <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                                        {target.hasDistance ? (
                                          <><MapIcon /><span>{target.primary}</span>{target.secondary && <><span className="w-px h-2.5 bg-stone-300" /><MountainIcon /><span>{target.secondary}</span></>}</>
                                        ) : (
                                          <><ClockIcon /><span>{target.primary}</span></>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}
                            </div>
                            {(wi === 0 || wi === 2) && dayExtraCount > 0 && (
                              <div className="flex-1 min-h-0 flex items-center justify-center pt-1.5">
                                <Button
                                  type="button"
                                  variant="muted"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExtraActivitiesList(dayFullList)
                                    setExtraActivitiesModalDate(day.dateStr)
                                    setExtraActivitiesModalOpen(true)
                                  }}
                                  className="w-full text-[10px] py-1"
                                >
                                  {tCalendar(dayExtraCount === 1 ? 'moreActivities' : 'moreActivities_plural', { count: dayExtraCount })}
                                </Button>
                              </div>
                            )}
                            <div
                              className="shrink-0 w-full flex justify-center pt-1"
                              onClick={(e) => { e.stopPropagation(); openDay(day.dateStr, day.isPast) }}
                              role="button"
                              aria-label={tWorkouts('addWorkout')}
                            >
                              <div className="w-6 h-6 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-400 hover:text-white hover:bg-palette-forest-dark hover:border-palette-forest-dark transition-all cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="min-h-0 shrink-0 flex flex-col gap-0.5">
                              {firstGoal && !firstWorkout && !firstImported && (() => {
                                const isPrimary = firstGoal.is_primary
                                const borderColor = isPrimary ? 'border-palette-amber' : 'border-palette-sage'
                                const badgeColor = isPrimary ? 'text-palette-amber bg-palette-amber/10' : 'text-palette-sage bg-palette-sage/10'
                                return (
                                  <div
                                    onClick={(e) => { e.stopPropagation(); openGoal(firstGoal) }}
                                    className={`bg-white rounded border-l-4 ${borderColor} shadow-sm p-1.5 h-full flex flex-col justify-between cursor-pointer training-card`}
                                    role="button"
                                  >
                                    <div>
                                      <div>
                                        <span className={`float-left inline-flex items-center mr-1.5 ${badgeColor} px-1 py-0.5 rounded shrink-0`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                          </svg>
                                        </span>
                                        <div className="text-xs font-semibold text-stone-700 leading-tight">{firstGoal.race_name}</div>
                                        <div className="clear-both"></div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap text-[10px] text-stone-400 font-medium mt-1">
                                      <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <span>{firstGoal.distance} km</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })()}
                              {firstWorkout && renderCompactCard(firstWorkout, day.dateStr)}
                              {!firstWorkout && !firstGoal && firstImported && (() => {
                                const target = formatImportedActivityTarget(firstImported)
                                return (
                                  <div
                                    onClick={(e) => { e.stopPropagation(); setSelectedImportedActivity(firstImported) }}
                                    className="bg-white rounded border-l-4 border-palette-strava shadow-sm h-full p-1.5 flex flex-col justify-between cursor-pointer training-card w-full"
                                    role="button"
                                  >
                                    <div>
                                      <div className="inline-flex items-center gap-1 align-middle">
                                        <img src="/strava-icon.svg" alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                        <span className="text-[9px] font-bold uppercase text-palette-strava bg-orange-100 px-1 py-0.5 rounded leading-none">
                                          {getImportedActivityTypeLabel(firstImported, tSports)}
                                        </span>
                                      </div>
                                      <div className="text-xs font-semibold text-stone-700 mt-1 truncate">{firstImported.title}</div>
                                    </div>
                                    {target.primary && (
                                      <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                                        {target.hasDistance ? (
                                          <><MapIcon /><span>{target.primary}</span>{target.secondary && <><span className="w-px h-2.5 bg-stone-300" /><MountainIcon /><span>{target.secondary}</span></>}</>
                                        ) : (
                                          <><ClockIcon /><span>{target.primary}</span></>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}
                              {(wi === 0 || wi === 2) && dayExtraCount > 0 && (
                                <Button
                                  type="button"
                                  variant="muted"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExtraActivitiesList(dayFullList)
                                    setExtraActivitiesModalDate(day.dateStr)
                                    setExtraActivitiesModalOpen(true)
                                  }}
                                  className="shrink-0 w-full text-[10px] py-1 mt-1.5"
                                >
                                  {tCalendar(dayExtraCount === 1 ? 'moreActivities' : 'moreActivities_plural', { count: dayExtraCount })}
                                </Button>
                              )}
                            </div>
                            {showAddInCondensed && (
                              <div className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-300 shadow-sm group-hover:text-white group-hover:bg-palette-forest-dark group-hover:border-palette-forest-dark transition-all transform group-hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                  </>
                }
                {isDetailed && (
                  week.days.map((day) => {
                    const dayWorkouts = workoutsByDate[day.dateStr] ?? []
                    const dayImported = importedByDate[day.dateStr] ?? []
                    const dayGoals = goalsByDate[day.dateStr] ?? []
                    const hasContent = dayWorkouts.length > 0 || dayGoals.length > 0 || dayImported.length > 0
                    const canAddWorkout = canEdit && !day.isPast
                    return (
                      <div key={day.dateStr} className="flex flex-col gap-2 min-h-0">
                        <div
                          className={`shrink-0 text-center pb-2 border-b ${day.isToday ? 'border-b-2 border-palette-forest-dark' : 'border-stone-200'}`}
                        >
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 text-sm font-semibold ${day.isToday ? 'text-palette-forest-dark' : 'text-stone-600'}`}
                          >
                            <span className="uppercase">{day.dayName}.</span>
                            <span className={day.isToday ? 'font-bold' : ''}>{day.label}</span>
                          </span>
                        </div>
                        <div
                          className={`flex-1 min-h-[202px] rounded-xl border p-1.5 flex flex-col gap-3 overflow-y-auto ${
                            day.isToday
                              ? 'bg-palette-forest-dark/5 border-palette-forest-dark/30'
                              : hasContent
                                ? 'bg-white border-stone-200'
                                : 'bg-stone-50 border-stone-200 border-dashed'
                          } ${canAddWorkout && !hasContent ? 'border-2 border-dashed border-stone-300 cursor-pointer hover:border-palette-forest-dark hover:bg-palette-forest-dark/5 transition-all group' : ''}`}
                          onClick={() => canAddWorkout && !hasContent && openDay(day.dateStr, day.isPast)}
                          role={canAddWorkout && !hasContent ? 'button' : undefined}
                        >
                          {hasContent ? (
                            <>
                              <div className="min-h-0 flex flex-col gap-3 overflow-y-auto shrink-0 pb-3">
                              {dayGoals.map((g) => {
                                const isPrimary = g.is_primary
                                const borderColor = isPrimary ? 'border-palette-amber' : 'border-palette-sage'
                                const badgeColor = isPrimary ? 'text-palette-amber bg-palette-amber/10' : 'text-palette-sage bg-palette-sage/10'
                                
                                return (
                                  <div
                                    key={g.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openGoal(g)
                                    }}
                                    className={`training-card bg-white rounded border-l-4 ${borderColor} shadow-sm p-1.5 h-full flex flex-col justify-between ${canEdit ? 'cursor-pointer' : ''}`}
                                    role={canEdit ? 'button' : undefined}
                                  >
                                    <div>
                                      <div>
                                        <span className={`float-left inline-flex items-center mr-1.5 ${badgeColor} px-1 py-0.5 rounded shrink-0`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                          </svg>
                                        </span>
                                        <div className="text-xs font-semibold text-stone-700 leading-tight">{g.race_name}</div>
                                        <div className="clear-both"></div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap text-[10px] text-stone-400 font-medium mt-1">
                                      <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <span>{g.distance} km</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                              {dayImported.map((a) => {
                                const target = formatImportedActivityTarget(a)
                                return (
                                  <div
                                    key={a.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedImportedActivity(a)
                                    }}
                                    className="training-card bg-white p-3 rounded-lg shadow-sm border border-stone-100 border-l-4 border-l-palette-strava cursor-pointer"
                                    role="button"
                                  >
                                    <div className="inline-flex items-center gap-1.5 mb-2">
                                      <img src="/strava-icon.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden />
                                      <span className="text-[10px] font-bold uppercase text-palette-strava bg-orange-100 px-1.5 py-0.5 rounded leading-none">
                                        {getImportedActivityTypeLabel(a, tSports)}
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
                              </div>
                              {canAddWorkout && (
                                <div
                                  className="flex-1 min-h-0 flex items-center justify-center"
                                  onClick={(e) => { e.stopPropagation(); openDay(day.dateStr, day.isPast) }}
                                  role="button"
                                  aria-label={tWorkouts('addWorkout')}
                                >
                                  <div className="w-10 h-10 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-400 shadow-sm hover:text-white hover:bg-palette-forest-dark hover:border-palette-forest-dark transition-all transform hover:scale-110 cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : canAddWorkout ? (
                            <div className="flex-1 flex items-center justify-center min-h-[126px]">
                              <div className="w-10 h-10 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-300 shadow-sm group-hover:text-white group-hover:bg-palette-forest-dark group-hover:border-palette-forest-dark transition-all transform group-hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                )}
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
        athleteView={athleteView}
        workout={modalWorkout}
      />

      <Modal
        isOpen={extraActivitiesModalOpen && extraActivitiesList.length > 0}
        onClose={() => { setExtraActivitiesModalOpen(false); setExtraActivitiesModalDate(null) }}
        size="md"
        title={extraActivitiesModalDate
          ? (() => {
              const s = new Date(extraActivitiesModalDate + 'T12:00:00').toLocaleDateString(localeTag, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              return s.charAt(0).toUpperCase() + s.slice(1)
            })()
          : tCalendar('modals.dayActivities')}
        titleId="extra-activities-modal-title"
        contentClassName="px-6 py-4"
      >
        <div className="space-y-3">
          {extraActivitiesList.map((entry) => {
            const dateLabel = new Date(entry.dateStr + 'T12:00:00').toLocaleDateString(localeTag, { weekday: 'short', day: 'numeric', month: 'short' })
            
            if (entry.type === 'goal') {
              const g = entry.item
              return (
                <ActivityTile
                  key={`g-${g.id}`}
                  type="goal"
                  isPrimary={g.is_primary}
                  title={g.race_name}
                  distance={Number(g.distance)}
                  date={dateLabel}
                  onClick={() => {
                    setExtraActivitiesModalOpen(false)
                    setExtraActivitiesModalDate(null)
                    openGoal(g)
                  }}
                />
              )
            }
            
            if (entry.type === 'workout') {
              const w = entry.item
              return (
                <ActivityTile
                  key={`w-${w.id}`}
                  type="workout"
                  sportType={w.sport_type}
                  title={w.title}
                  metadata={formatWorkoutMetadata(w)}
                  date={dateLabel}
                  onClick={() => {
                    setExtraActivitiesModalOpen(false)
                    setExtraActivitiesModalDate(null)
                    openWorkout(entry.dateStr, w)
                  }}
                />
              )
            }
            
            // Type: imported (Strava)
            const a = entry.item
            return (
              <ActivityTile
                key={`i-${a.id}`}
                type="strava"
                activityLabel={getImportedActivityTypeLabel(a, tSports)}
                title={a.title}
                metadata={formatStravaMetadata(a)}
                date={dateLabel}
                onClick={() => {
                  setExtraActivitiesModalOpen(false)
                  setExtraActivitiesModalDate(null)
                  setSelectedImportedActivity(a)
                }}
              />
            )
          })}
        </div>
      </Modal>

      {goalModalOpen && selectedGoal && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
            onClick={() => setGoalModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
          >
            <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* En-tête */}
              <div className="shrink-0 px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-full ${
                    selectedGoal.is_primary ? 'bg-palette-amber/10 text-palette-amber' : 'bg-palette-sage/10 text-palette-sage'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h2 id="goal-modal-title" className="text-lg font-bold text-stone-900 truncate">
                    {tCalendar('modals.goalDetails')}
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setGoalModalOpen(false)}
                  className="shrink-0"
                  aria-label={tCommon('close')}
                >
                  <IconClose className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="px-6 py-4">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">Date</dt>
                      <dd className="text-sm text-stone-900">
                        {new Date(selectedGoal.date + 'T12:00:00').toLocaleDateString(localeTag, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">{tGoals('raceName')}</dt>
                      <dd className="text-sm text-stone-900">{selectedGoal.race_name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">{tGoals('distance')}</dt>
                      <dd className="text-sm text-stone-900 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {selectedGoal.distance} km
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">{tGoals('goalType')}</dt>
                      <dd className="text-sm text-stone-900 flex items-center gap-2">
                        {selectedGoal.is_primary ? (
                          <span className="bg-palette-amber/10 text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber">
                            Principal
                          </span>
                        ) : (
                          <span className="bg-palette-sage/10 text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage">
                            Secondaire
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {selectedImportedActivity && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
            onClick={() => setSelectedImportedActivity(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="imported-activity-modal-title"
          >
            <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* En-tête comme dans WorkoutModal */}
              <div className="shrink-0 px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-palette-strava">
                    <img src="/strava-icon.svg" alt="" className="h-5 w-5 object-contain" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-palette-strava uppercase tracking-wide mb-0.5">
                      {getImportedActivityTypeLabel(selectedImportedActivity, tSports)}
                    </div>
                    <h2 id="imported-activity-modal-title" className="text-lg font-bold text-stone-900 truncate">
                      {tCalendar('modals.activityDetails')}
                    </h2>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedImportedActivity(null)}
                  className="shrink-0"
                  aria-label={tCommon('close')}
                >
                  <IconClose className="w-5 h-5" />
                </Button>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="px-6 py-4">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.date')}</dt>
                      <dd className="text-stone-900">
                        {new Date(selectedImportedActivity.date + 'T12:00:00').toLocaleDateString(localeTag, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.source')}</dt>
                      <dd className="text-stone-900 capitalize">{selectedImportedActivity.source}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.sportType')}</dt>
                      <dd className="text-stone-900">{tSports(SPORT_TRANSLATION_KEYS[selectedImportedActivity.sport_type])}</dd>
                    </div>
                    {selectedImportedActivity.activity_type && (
                      <div>
                        <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.activityType')}</dt>
                        <dd className="text-stone-900">{selectedImportedActivity.activity_type}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.title')}</dt>
                      <dd className="text-stone-900">{selectedImportedActivity.title}</dd>
                    </div>
                    {selectedImportedActivity.description && (
                      <div>
                        <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.description')}</dt>
                        <dd className="text-stone-900 whitespace-pre-wrap">{selectedImportedActivity.description}</dd>
                      </div>
                    )}
                    {selectedImportedActivity.raw_data && typeof selectedImportedActivity.raw_data === 'object' && (
                      <>
                        {typeof (selectedImportedActivity.raw_data as { distance?: number }).distance === 'number' && (
                          <div>
                            <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.distance')}</dt>
                            <dd className="text-stone-900">
                              {((selectedImportedActivity.raw_data as { distance: number }).distance / 1000).toFixed(2)} km
                            </dd>
                          </div>
                        )}
                        {typeof (selectedImportedActivity.raw_data as { moving_time?: number }).moving_time === 'number' && (
                          <div>
                            <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.movingTime')}</dt>
                            <dd className="text-stone-900">
                              {Math.floor((selectedImportedActivity.raw_data as { moving_time: number }).moving_time / 60)} min
                            </dd>
                          </div>
                        )}
                        {typeof (selectedImportedActivity.raw_data as { total_elevation_gain?: number }).total_elevation_gain === 'number' && (
                          <div>
                            <dt className="text-sm font-medium text-stone-700 mb-1">{tCalendar('modals.elevationGain')}</dt>
                            <dd className="text-stone-900">
                              {Math.round((selectedImportedActivity.raw_data as { total_elevation_gain: number }).total_elevation_gain)} m
                            </dd>
                          </div>
                        )}
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
