'use client'

import type { useTranslations } from 'next-intl'

import type { CoachSessionUnitsFormState } from '@/app/[locale]/dashboard/coaching-settings/actions'
import { Button } from '@/components/Button'
import {
  CoachSessionUnitsGrid,
  type SessionUnitValue,
} from '@/components/coach/CoachSessionUnitsGrid'

type CoachUnitsSetupViewProps = {
  locale: string
  tWorkouts: ReturnType<typeof useTranslations<'workouts'>>
  tSports: ReturnType<typeof useTranslations<'sports'>>
  tCommon: ReturnType<typeof useTranslations<'common'>>
  unitsAction: (payload: FormData) => void
  unitsPending: boolean
  unitsState: CoachSessionUnitsFormState
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

type UnitValue = SessionUnitValue

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
  return (
    <form id="coach-units-form" action={unitsAction} className="flex flex-col flex-1 min-h-0 px-6 py-4 space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <p className="text-sm text-stone-600">{tWorkouts('form.unitsSetupIntro')}</p>

      <CoachSessionUnitsGrid
        variant="modal"
        tWorkouts={tWorkouts}
        tSports={tSports}
        unitCourse={unitCourse}
        setUnitCourse={setUnitCourse}
        unitTrail={unitTrail}
        setUnitTrail={setUnitTrail}
        unitVelo={unitVelo}
        setUnitVelo={setUnitVelo}
        unitNatation={unitNatation}
        setUnitNatation={setUnitNatation}
        unitTriathlon={unitTriathlon}
        setUnitTriathlon={setUnitTriathlon}
        unitCanot={unitCanot}
        setUnitCanot={setUnitCanot}
        unitNordicSki={unitNordicSki}
        setUnitNordicSki={setUnitNordicSki}
        unitBackcountrySki={unitBackcountrySki}
        setUnitBackcountrySki={setUnitBackcountrySki}
        unitIceSkating={unitIceSkating}
        setUnitIceSkating={setUnitIceSkating}
        unitRandonnee={unitRandonnee}
        setUnitRandonnee={setUnitRandonnee}
      />

      {unitsState?.error ? (
        <p className="text-sm text-palette-danger" role="alert">
          {unitsState.error}
        </p>
      ) : null}

      <Button type="submit" variant="primaryDark" className="w-full" loading={unitsPending} loadingText={tCommon('saving')}>
        {tWorkouts('form.saveUnits')}
      </Button>
    </form>
  )
}
