'use client'

import { memo } from 'react'
import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react'

import { FEELING_TILE_CLASSES, INTENSITY_TILE_CLASSES } from '@/lib/workoutFeedbackColors'

const FEELING_ICONS = [Angry, Frown, Meh, Smile, Laugh] as const

type TWorkouts = (key: string) => string

type Props = {
  perceivedFeeling: number | null | undefined
  perceivedIntensity: number | null | undefined
  perceivedPleasure: number | null | undefined
  tWorkouts: TWorkouts
}

/**
 * Stat cards lecture seule (Ressenti / Intensité (RPE) / Plaisir).
 * Composant masqué si tous les feedbacks sont null.
 * Couleur tuile : dégradé sémantique défini dans FEELING_TILE_CLASSES (1-5) et INTENSITY_TILE_CLASSES (1-10).
 */
export const WorkoutFeedbackSummary = memo(function WorkoutFeedbackSummary({
  perceivedFeeling,
  perceivedIntensity,
  perceivedPleasure,
  tWorkouts,
}: Props) {
  const feeling = isFeeling(perceivedFeeling) ? perceivedFeeling : null
  const intensity = isIntensity(perceivedIntensity) ? perceivedIntensity : null
  const pleasure = isFeeling(perceivedPleasure) ? perceivedPleasure : null

  if (feeling === null && intensity === null && pleasure === null) return null

  return (
    <div className="border-t border-stone-100 pt-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {feeling !== null && (
          <div className="flex-1 min-w-0">
            <FeelingCard
              label={tWorkouts('summary.feedback.feelingLabel')}
              value={feeling}
              text={tWorkouts(`feedback.feelingScale.${feeling}`)}
            />
          </div>
        )}
        {intensity !== null && (
          <div className="flex-1 min-w-0">
            <IntensityCard
              label={tWorkouts('summary.feedback.intensityLabel')}
              scale={tWorkouts('summary.feedback.intensityScale')}
              value={intensity}
            />
          </div>
        )}
        {pleasure !== null && (
          <div className="flex-1 min-w-0">
            <FeelingCard
              label={tWorkouts('summary.feedback.pleasureLabel')}
              value={pleasure}
              text={tWorkouts(`feedback.pleasureScale.${pleasure}`)}
            />
          </div>
        )}
      </div>
    </div>
  )
})

function FeelingCard({ label, value, text }: { label: string; value: number; text: string }) {
  const Icon = FEELING_ICONS[value - 1]
  const tileClasses = FEELING_TILE_CLASSES[value] ?? 'bg-stone-100 text-stone-700 border-stone-200'
  return (
    <div>
      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{label}</h4>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl border ${tileClasses}`}>
          <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />
        </div>
        <span className="font-bold text-stone-700 text-lg">{text}</span>
      </div>
    </div>
  )
}

function IntensityCard({ label, scale, value }: { label: string; scale: string; value: number }) {
  const tileClasses = INTENSITY_TILE_CLASSES[value] ?? 'bg-stone-100 text-stone-800 border-stone-200'
  return (
    <div>
      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{label}</h4>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl border font-black text-xl ${tileClasses}`}>
          {value}
        </div>
        <span className="font-medium text-stone-500 text-lg">{scale}</span>
      </div>
    </div>
  )
}

function isFeeling(value: number | null | undefined): value is number {
  return typeof value === 'number' && value >= 1 && value <= 5
}

function isIntensity(value: number | null | undefined): value is number {
  return typeof value === 'number' && value >= 1 && value <= 10
}
