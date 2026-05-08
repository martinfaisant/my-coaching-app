'use client'

import type { useTranslations } from 'next-intl'

import type { ProfileFormState } from '@/app/[locale]/dashboard/profile/actions'
import { Button } from '@/components/Button'
import { Segments } from '@/components/Segments'
import { SPORT_CARD_STYLES } from '@/lib/sportStyles'

type UnitValue = 'time' | 'distance'

type CoachUnitsSetupViewProps = {
  locale: string
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
  tSports: ReturnType<typeof useTranslations<'sports'>>
  tCommon: ReturnType<typeof useTranslations<'common'>>
  unitsAction: (payload: FormData) => void
  unitsPending: boolean
  unitsState: ProfileFormState
  unitCourse: UnitValue
  setUnitCourse: (v: UnitValue) => void
  unitTrail: UnitValue
  setUnitTrail: (v: UnitValue) => void
  unitVelo: UnitValue
  setUnitVelo: (v: UnitValue) => void
  unitNatation: UnitValue
  setUnitNatation: (v: UnitValue) => void
  unitTriathlon: UnitValue
  setUnitTriathlon: (v: UnitValue) => void
  unitCanot: UnitValue
  setUnitCanot: (v: UnitValue) => void
  unitNordicSki: UnitValue
  setUnitNordicSki: (v: UnitValue) => void
  unitBackcountrySki: UnitValue
  setUnitBackcountrySki: (v: UnitValue) => void
  unitIceSkating: UnitValue
  setUnitIceSkating: (v: UnitValue) => void
  unitRandonnee: UnitValue
  setUnitRandonnee: (v: UnitValue) => void
}

export function CoachUnitsSetupView({
  locale,
  tWorkouts,
  tSports,
  tCommon,
  unitsAction,
  unitsPending,
  unitsState,
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
}: CoachUnitsSetupViewProps) {
  const unitOptions = [
    { value: 'time' as const, label: tWorkouts('form.targetMode.time') },
    { value: 'distance' as const, label: tWorkouts('form.targetMode.distance') },
  ]

  return (
    <form id="coach-units-form" action={unitsAction} className="flex flex-col flex-1 min-h-0 px-6 py-4 space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <p className="text-sm text-stone-600">{tWorkouts('form.unitsSetupIntro')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.course.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('course')}</span>
          <Segments
            name="workout_primary_metric_course"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitCourse}
            onChange={(v) => setUnitCourse(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.trail.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('trail')}</span>
          <Segments
            name="workout_primary_metric_trail"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitTrail}
            onChange={(v) => setUnitTrail(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.velo.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('velo')}</span>
          <Segments
            name="workout_primary_metric_velo"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitVelo}
            onChange={(v) => setUnitVelo(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.natation.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('natation')}</span>
          <Segments
            name="workout_primary_metric_natation"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitNatation}
            onChange={(v) => setUnitNatation(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.triathlon.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('triathlon')}</span>
          <Segments
            name="workout_primary_metric_triathlon"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitTriathlon}
            onChange={(v) => setUnitTriathlon(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.canot.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('canot')}</span>
          <Segments
            name="workout_primary_metric_canot"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitCanot}
            onChange={(v) => setUnitCanot(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.nordic_ski.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('ski_fond')}</span>
          <Segments
            name="workout_primary_metric_nordic_ski"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitNordicSki}
            onChange={(v) => setUnitNordicSki(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.backcountry_ski.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('ski_randonnee')}</span>
          <Segments
            name="workout_primary_metric_backcountry_ski"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitBackcountrySki}
            onChange={(v) => setUnitBackcountrySki(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.ice_skating.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('patinage_glace')}</span>
          <Segments
            name="workout_primary_metric_ice_skating"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitIceSkating}
            onChange={(v) => setUnitIceSkating(v as UnitValue)}
            options={unitOptions}
          />
        </div>

        <div className={`rounded-xl border border-stone-200 bg-white p-3 flex flex-col gap-2 border-l-4 ${SPORT_CARD_STYLES.randonnee.borderLeft}`}>
          <span className="text-sm font-semibold text-stone-800">{tSports('rando')}</span>
          <Segments
            name="workout_primary_metric_randonnee"
            ariaLabel={tWorkouts('form.targetMode.time')}
            size="sm"
            value={unitRandonnee}
            onChange={(v) => setUnitRandonnee(v as UnitValue)}
            options={unitOptions}
          />
        </div>
      </div>


      {unitsState?.error && (
        <p className="text-sm text-palette-danger" role="alert">
          {unitsState.error}
        </p>
      )}

      <Button type="submit" variant="primaryDark" className="w-full" loading={unitsPending} loadingText={tCommon('saving')}>
        {tWorkouts('form.saveUnits')}
      </Button>
    </form>
  )
}

