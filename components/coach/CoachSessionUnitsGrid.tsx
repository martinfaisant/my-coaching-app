'use client'

import type { useTranslations } from 'next-intl'

import { Segments } from '@/components/Segments'
import { SPORT_CARD_STYLES } from '@/lib/sportStyles'

export type SessionUnitValue = 'time' | 'distance'

export type CoachSessionUnitsGridProps = {
  variant?: 'page' | 'modal'
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
  tSports: ReturnType<typeof useTranslations<'sports'>>
  unitCourse: SessionUnitValue
  setUnitCourse: (v: SessionUnitValue) => void
  unitTrail: SessionUnitValue
  setUnitTrail: (v: SessionUnitValue) => void
  unitVelo: SessionUnitValue
  setUnitVelo: (v: SessionUnitValue) => void
  unitNatation: SessionUnitValue
  setUnitNatation: (v: SessionUnitValue) => void
  unitTriathlon: SessionUnitValue
  setUnitTriathlon: (v: SessionUnitValue) => void
  unitCanot: SessionUnitValue
  setUnitCanot: (v: SessionUnitValue) => void
  unitNordicSki: SessionUnitValue
  setUnitNordicSki: (v: SessionUnitValue) => void
  unitBackcountrySki: SessionUnitValue
  setUnitBackcountrySki: (v: SessionUnitValue) => void
  unitIceSkating: SessionUnitValue
  setUnitIceSkating: (v: SessionUnitValue) => void
  unitRandonnee: SessionUnitValue
  setUnitRandonnee: (v: SessionUnitValue) => void
}

type SportUnitRowProps = {
  sportKey: keyof typeof SPORT_CARD_STYLES
  sportLabel: string
  fieldName: string
  value: SessionUnitValue
  onChange: (v: SessionUnitValue) => void
  unitOptions: { value: SessionUnitValue; label: string }[]
  timeAriaLabel: string
  variant: 'page' | 'modal'
}

function SportUnitRow({
  sportKey,
  sportLabel,
  fieldName,
  value,
  onChange,
  unitOptions,
  timeAriaLabel,
  variant,
}: SportUnitRowProps) {
  const borderClass = SPORT_CARD_STYLES[sportKey].borderLeft
  const layoutClass =
    variant === 'page'
      ? 'flex items-center justify-between gap-3'
      : 'flex flex-col gap-2'

  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-3 border-l-4 ${borderClass} ${layoutClass}`}
    >
      <span className="text-sm font-semibold text-stone-800">{sportLabel}</span>
      <Segments
        name={fieldName}
        ariaLabel={timeAriaLabel}
        size="sm"
        value={value}
        onChange={(v) => onChange(v as SessionUnitValue)}
        options={unitOptions}
      />
    </div>
  )
}

export function CoachSessionUnitsGrid({
  variant = 'page',
  tWorkouts,
  tSports,
  unitCourse,
  setUnitCourse,
  unitTrail,
  setUnitTrail,
  unitVelo,
  setUnitVelo,
  unitNatation,
  setUnitNatation,
  unitTriathlon,
  setUnitTriathlon,
  unitCanot,
  setUnitCanot,
  unitNordicSki,
  setUnitNordicSki,
  unitBackcountrySki,
  setUnitBackcountrySki,
  unitIceSkating,
  setUnitIceSkating,
  unitRandonnee,
  setUnitRandonnee,
}: CoachSessionUnitsGridProps) {
  const unitOptions = [
    { value: 'time' as const, label: tWorkouts('form.targetMode.time') },
    { value: 'distance' as const, label: tWorkouts('form.targetMode.distance') },
  ]
  const timeAriaLabel = tWorkouts('form.targetMode.time')
  const gridGap = variant === 'page' ? 'gap-2' : 'gap-3'

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridGap}`}>
      <SportUnitRow
        sportKey="course"
        sportLabel={tSports('course')}
        fieldName="workout_primary_metric_course"
        value={unitCourse}
        onChange={setUnitCourse}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="trail"
        sportLabel={tSports('trail')}
        fieldName="workout_primary_metric_trail"
        value={unitTrail}
        onChange={setUnitTrail}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="velo"
        sportLabel={tSports('velo')}
        fieldName="workout_primary_metric_velo"
        value={unitVelo}
        onChange={setUnitVelo}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="natation"
        sportLabel={tSports('natation')}
        fieldName="workout_primary_metric_natation"
        value={unitNatation}
        onChange={setUnitNatation}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="triathlon"
        sportLabel={tSports('triathlon')}
        fieldName="workout_primary_metric_triathlon"
        value={unitTriathlon}
        onChange={setUnitTriathlon}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="canot"
        sportLabel={tSports('canot')}
        fieldName="workout_primary_metric_canot"
        value={unitCanot}
        onChange={setUnitCanot}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="nordic_ski"
        sportLabel={tSports('ski_fond')}
        fieldName="workout_primary_metric_nordic_ski"
        value={unitNordicSki}
        onChange={setUnitNordicSki}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="backcountry_ski"
        sportLabel={tSports('ski_randonnee')}
        fieldName="workout_primary_metric_backcountry_ski"
        value={unitBackcountrySki}
        onChange={setUnitBackcountrySki}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="ice_skating"
        sportLabel={tSports('patinage_glace')}
        fieldName="workout_primary_metric_ice_skating"
        value={unitIceSkating}
        onChange={setUnitIceSkating}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
      <SportUnitRow
        sportKey="randonnee"
        sportLabel={tSports('rando')}
        fieldName="workout_primary_metric_randonnee"
        value={unitRandonnee}
        onChange={setUnitRandonnee}
        unitOptions={unitOptions}
        timeAriaLabel={timeAriaLabel}
        variant={variant}
      />
    </div>
  )
}
