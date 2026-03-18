import { memo } from 'react'
import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react'

const FEELING_ICONS = [Angry, Frown, Meh, Smile, Laugh] as const
const FEELING_VALUES = [1, 2, 3, 4, 5] as const
const INTENSITY_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

type Props = {
  perceivedFeeling: number | null
  perceivedIntensity: number | null
  perceivedPleasure: number | null
  onFeelingChange: (value: number) => void
  onIntensityChange: (value: number) => void
  onPleasureChange: (value: number) => void
  // next-intl typing is intentionally kept generic here
  tWorkouts: (key: string) => string
}

export const WorkoutFeedbackSection = memo(function WorkoutFeedbackSection({
  perceivedFeeling,
  perceivedIntensity,
  perceivedPleasure,
  onFeelingChange,
  onIntensityChange,
  onPleasureChange,
  tWorkouts,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {tWorkouts('feedback.feelingLabel')}
        </label>
        <div className="flex w-full gap-2" role="group" aria-label={tWorkouts('feedback.feelingLabel')}>
          {FEELING_VALUES.map((value, idx) => {
            const Icon = FEELING_ICONS[idx]
            const selected = perceivedFeeling === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFeelingChange(value)}
                title={tWorkouts(`feedback.feelingScale.${value}`)}
                aria-pressed={selected}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition shrink-0 ${
                  selected
                    ? 'border-palette-forest-dark bg-palette-forest-dark/10'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <Icon
                  className={`h-7 w-7 shrink-0 ${
                    selected ? 'text-palette-forest-dark' : 'text-stone-500'
                  }`}
                  strokeWidth={2}
                  aria-hidden
                />
                <span
                  className={`text-xs font-medium text-center leading-tight line-clamp-2 ${
                    selected ? 'text-palette-forest-dark' : 'text-stone-600'
                  }`}
                >
                  {tWorkouts(`feedback.feelingScale.${value}`)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {tWorkouts('feedback.intensityLabel')}
        </label>
        <div className="flex w-full gap-2" role="group" aria-label={tWorkouts('feedback.intensityLabel')}>
          {INTENSITY_VALUES.map((value) => {
            const selected = perceivedIntensity === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onIntensityChange(value)}
                aria-pressed={selected}
                className={`flex-1 min-w-0 flex items-center justify-center h-10 rounded-lg text-xs font-semibold border transition ${
                  selected
                    ? 'border-palette-forest-dark bg-palette-forest-dark text-white'
                    : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {tWorkouts('feedback.pleasureLabel')}
        </label>
        <div className="flex w-full gap-2" role="group" aria-label={tWorkouts('feedback.pleasureLabel')}>
          {FEELING_VALUES.map((value, idx) => {
            const Icon = FEELING_ICONS[idx]
            const selected = perceivedPleasure === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPleasureChange(value)}
                title={tWorkouts(`feedback.pleasureScale.${value}`)}
                aria-pressed={selected}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition shrink-0 ${
                  selected
                    ? 'border-palette-forest-dark bg-palette-forest-dark/10'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <Icon
                  className={`h-7 w-7 shrink-0 ${
                    selected ? 'text-palette-forest-dark' : 'text-stone-500'
                  }`}
                  strokeWidth={2}
                  aria-hidden
                />
                <span
                  className={`text-xs font-medium text-center leading-tight line-clamp-2 ${
                    selected ? 'text-palette-forest-dark' : 'text-stone-600'
                  }`}
                >
                  {tWorkouts(`feedback.pleasureScale.${value}`)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})

