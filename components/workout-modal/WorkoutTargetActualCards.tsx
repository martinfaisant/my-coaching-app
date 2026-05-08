'use client'

import { memo } from 'react'
import { CheckCircle2, Target, Trophy } from 'lucide-react'

import type { SportType, Workout } from '@/types/database'
import {
  computeActualPace,
  formatDistance,
  formatDistanceDelta,
  formatDurationDelta,
  formatDurationHM,
  formatElevation,
  formatElevationDelta,
  formatPaceDelta,
  formatPaceValue,
  getEffectiveActualMetrics,
  isPositiveTarget,
  isRenderableActual,
  shouldShowActualCard,
  summaryHasDistance,
  summaryHasElevation,
  summaryHasPace,
  type LiveActualMetrics,
  type WorkoutLocale,
} from '@/lib/workoutFormatting'
import {
  workoutPaceIsRunningStyle,
  workoutIsTimeOnlySport,
} from '@/lib/sportsRegistry'

type TWorkouts = (key: string) => string

type Props = {
  workout: Workout
  /** Si fourni, écrase les valeurs persistées (live preview athlète). */
  liveActual?: LiveActualMetrics
  /** Commentaire athlète à afficher en bas de la card Réalisé (lecture seule). */
  athleteComment?: string | null
  locale: WorkoutLocale
  tWorkouts: TWorkouts
}

/** Label "Allure" vs "Vitesse" selon sport. */
function getPaceLabels(sportType: SportType, t: TWorkouts) {
  const isSpeed = sportType === 'velo' || sportType === 'triathlon' || sportType === 'canot'
  return {
    target: isSpeed ? t('summary.speedLabel') : t('summary.paceLabel'),
    actual: isSpeed ? t('summary.actualSpeedLabel') : t('summary.actualPaceLabel'),
  }
}

/** Suffixe d'unité allure / vitesse selon sport. */
function getPaceUnit(sportType: SportType, t: TWorkouts): string {
  if (workoutPaceIsRunningStyle(sportType)) return t('form.paceUnitRunning')
  if (sportType === 'natation') return t('form.paceUnitSwimming')
  return t('form.paceUnitCycling')
}

export const WorkoutTargetActualCards = memo(function WorkoutTargetActualCards({
  workout,
  liveActual,
  athleteComment,
  locale,
  tWorkouts,
}: Props) {
  const sport = workout.sport_type
  const isTimeOnly = workoutIsTimeOnlySport(sport)
  const showDistance = summaryHasDistance(sport)
  const showPace = summaryHasPace(sport)
  const showElevation = summaryHasElevation(sport)

  const effective = getEffectiveActualMetrics(workout, liveActual)
  const hasActualMetrics = shouldShowActualCard(workout, liveActual)
  const actualPace = showPace ? computeActualPace(sport, effective.durationMinutes, effective.distanceKm) : null

  // Lignes Objectif visibles
  const targetDuration = workout.target_duration_minutes ?? null
  const targetDistance = workout.target_distance_km ?? null
  const targetPace = workout.target_pace ?? null
  const targetElevation = workout.target_elevation_m ?? null

  const showTargetDuration = isPositiveTarget(targetDuration)
  const showTargetDistance = !isTimeOnly && showDistance && isPositiveTarget(targetDistance)
  const showTargetPace = showPace && isPositiveTarget(targetPace)
  const showTargetElevation = showElevation && isPositiveTarget(targetElevation)
  const description = workout.description?.trim() ?? ''
  const showDescription = description.length > 0

  // Lignes Réalisé visibles (uniquement si au moins une métrique réalisée existe)
  const showActualDuration = hasActualMetrics && isRenderableActual(effective.durationMinutes)
  const showActualDistance = hasActualMetrics && !isTimeOnly && showDistance && isRenderableActual(effective.distanceKm)
  const showActualPace = hasActualMetrics && showPace && actualPace !== null
  const showActualElevation = hasActualMetrics && showElevation && isRenderableActual(effective.elevationM)

  // Commentaire athlète : affiché en bas de la card Réalisé (séparateur si métriques au-dessus).
  const commentTrim = athleteComment?.trim() ?? ''
  const hasAthleteComment = commentTrim.length > 0

  // La carte Réalisé est rendue dès qu'il y a des métriques OU un commentaire athlète.
  const showActualCard = hasActualMetrics || hasAthleteComment

  const paceLabels = getPaceLabels(sport, tWorkouts)
  const paceUnit = getPaceUnit(sport, tWorkouts)

  return (
    <div className={`grid grid-cols-1 ${showActualCard ? 'md:grid-cols-2' : ''} gap-4`}>
      {/* Carte Objectif */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
        <div className="flex items-center gap-2 mb-4 text-stone-400">
          <Target className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            {tWorkouts('summary.targetTitle')}
          </span>
        </div>
        <div className={`${!showActualCard ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5' : 'space-y-3.5'}`}>
          {showTargetDuration && (
            <div className="flex items-center justify-between min-h-7">
              <span className="text-sm text-stone-500 font-medium">
                {tWorkouts('summary.targetDurationLabel')}
              </span>
              <span className="font-bold text-stone-800">{formatDurationHM(targetDuration)}</span>
            </div>
          )}
          {showTargetDistance && (
            <div className="flex items-center justify-between min-h-7">
              <span className="text-sm text-stone-500 font-medium">
                {tWorkouts('summary.distanceLabel')}
              </span>
              <span className="font-bold text-stone-800">{formatDistance(targetDistance, sport, locale)}</span>
            </div>
          )}
          {showTargetPace && (
            <div className="flex items-center justify-between min-h-7">
              <span className="text-sm text-stone-500 font-medium">{paceLabels.target}</span>
              <span className="font-bold text-stone-800">
                {formatPaceValue(targetPace, sport, locale)}
                <span className="text-xs ml-1">{paceUnit}</span>
              </span>
            </div>
          )}
          {showTargetElevation && (
            <div className="flex items-center justify-between min-h-7">
              <span className="text-sm text-stone-500 font-medium">
                {tWorkouts('summary.elevationLabel')}
              </span>
              <span className="font-bold text-stone-800">{formatElevation(targetElevation)}</span>
            </div>
          )}
        </div>
        {showDescription && (
          <div className="pt-4 border-t border-stone-200 mt-4">
            <p className="text-xs text-stone-500 italic leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        )}
      </div>

      {/* Carte Réalisé (hero) */}
      {showActualCard && (
        <div className="bg-palette-forest-dark rounded-2xl p-6 text-white shadow-xl shadow-palette-forest-dark/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none" aria-hidden>
            <Trophy className="h-20 w-20 rotate-12" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2 mb-4 text-white/60 relative z-10">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {tWorkouts('summary.actualTitle')}
            </span>
          </div>
          {hasActualMetrics && (
            <div className="space-y-3.5 relative z-10">
              {showActualDuration && (
                <ActualRow
                  label={tWorkouts('summary.actualDurationLabel')}
                  value={formatDurationHM(effective.durationMinutes ?? 0)}
                  delta={formatDurationDelta(targetDuration, effective.durationMinutes)}
                />
              )}
              {showActualDistance && (
                <ActualRow
                  label={tWorkouts('summary.distanceLabel')}
                  value={formatDistance(effective.distanceKm ?? 0, sport, locale)}
                  delta={formatDistanceDelta(targetDistance, effective.distanceKm, sport, locale)}
                />
              )}
              {showActualPace && actualPace !== null && (
                <ActualRow
                  label={paceLabels.actual}
                  value={formatPaceValue(actualPace, sport, locale)}
                  unit={paceUnit}
                  delta={formatPaceDelta(targetPace, actualPace, sport, locale)}
                />
              )}
              {showActualElevation && (
                <ActualRow
                  label={tWorkouts('summary.elevationLabel')}
                  value={formatElevation(effective.elevationM ?? 0)}
                  delta={formatElevationDelta(targetElevation, effective.elevationM)}
                />
              )}
            </div>
          )}
          {hasAthleteComment && (
            <div className={`relative z-10 ${hasActualMetrics ? 'pt-4 border-t border-white/20 mt-4' : ''}`}>
              <p className="text-xs text-white/80 italic leading-relaxed whitespace-pre-wrap">{commentTrim}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

type ActualRowProps = {
  label: string
  value: string
  unit?: string
  delta: { value: string; unit: string } | null
}

function ActualRow({ label, value, unit, delta }: ActualRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 min-h-7">
      <span className="text-sm text-white/70 font-medium">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        {delta && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 whitespace-nowrap leading-none">
            {delta.value}
            {delta.unit ? (
              <span className="font-normal text-white/60 ml-0.5">{delta.unit}</span>
            ) : null}
          </span>
        )}
        <span className="font-black text-xl whitespace-nowrap leading-none">
          {value}
          {unit ? <span className="text-xs ml-1">{unit}</span> : null}
        </span>
      </div>
    </div>
  )
}
