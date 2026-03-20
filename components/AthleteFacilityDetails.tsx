'use client'

import { Badge } from '@/components/Badge'
import { formatFacilitySlotTime, DAYS_ORDER } from '@/lib/facilityHoursUtils'
import type { AthleteFacility, FacilityDayKey, FacilityType } from '@/types/database'
import type { SportType } from '@/lib/sportStyles'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

function facilityTypeToSport(facilityType: FacilityType): SportType {
  switch (facilityType) {
    case 'piscine':
      return 'natation'
    case 'salle':
      return 'musculation'
    case 'stade':
      return 'course'
    case 'autre':
      return 'musculation'
  }
}

function formatSlots(slots: { start: string; end: string }[]) {
  return slots.map((s, idx) => {
    const start = formatFacilitySlotTime(s.start)
    const end = formatFacilitySlotTime(s.end)
    const isLast = idx >= slots.length - 1
    return (
      <span key={`${s.start}-${s.end}-${idx}`} className="whitespace-nowrap">
        {start} - {end}
        {!isLast ? (
          <>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
          </>
        ) : null}
      </span>
    )
  })
}

export type AthleteFacilityDetailsProps = {
  facility: AthleteFacility
  /** Zone à droite du titre (ex. boutons Modifier / Supprimer). */
  headerRight?: ReactNode
  /** Sous le bloc adresse + horaires (ex. message d’erreur suppression). */
  footer?: ReactNode
}

/**
 * Affichage lecture seule d’une installation : type (badge sport), nom, adresse, horaires sur 7 jours.
 * Utilisé par `AthleteFacilityCard` (avec actions) et par le calendrier coach (sans actions).
 */
export function AthleteFacilityDetails({ facility, headerRight, footer }: AthleteFacilityDetailsProps) {
  const tDays = useTranslations('facilities.days')
  const tFacilityTypes = useTranslations('facilities.facilityTypes')
  const tHours = useTranslations('facilities.hours')
  const badgeSport = facilityTypeToSport(facility.facility_type)

  const renderDayRow = (dayKey: FacilityDayKey) => {
    const dayOpening = facility.opening_hours[dayKey]
    const isOpen = dayOpening.open

    const hasSlotHours = isOpen && dayOpening.slots.length > 0

    return (
      <div
        key={dayKey}
        className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 shrink-0">
          {tDays(dayKey)}
        </span>
        <span
          className={
            hasSlotHours
              ? 'inline-flex min-w-0 shrink flex-wrap items-center gap-x-0.5 rounded-full border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700'
              : 'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700'
          }
        >
          {isOpen ? (
            <>
              {tHours('open')}
              {hasSlotHours ? (
                <>
                  <span className="text-stone-500">{tHours('dayHoursSeparator')}</span>
                  <span className="font-medium text-stone-800">{formatSlots(dayOpening.slots)}</span>
                </>
              ) : null}
            </>
          ) : (
            tHours('closed')
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="border border-stone-100 bg-white rounded-2xl p-4">
      {/* Colonne sur mobile : évite que badge+titre écrasent les boutons (refactor AthleteFacilityDetails). */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3">
            <Badge sport={badgeSport} className="bg-white w-fit shrink-0">
              {tFacilityTypes(facility.facility_type)}
            </Badge>
            <div className="text-sm font-bold text-stone-900 break-words min-w-0 sm:truncate">
              {facility.facility_name}
            </div>
          </div>
        </div>

        {headerRight ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-end">{headerRight}</div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
        <div className="text-sm text-stone-700 space-y-1.5">
          <div className="whitespace-pre-wrap">{facility.address}</div>
          <div>
            {facility.address_postal_code} · {facility.address_city}
          </div>
          <div>{facility.address_country}</div>
          {facility.address_complement ? <div className="text-stone-500">{facility.address_complement}</div> : null}
        </div>

        <div>
          <div
            className="space-y-0.5"
            data-testid="facility-opening-schedule"
          >
            {DAYS_ORDER.map((dayKey) => renderDayRow(dayKey))}
          </div>
        </div>
      </div>

      {footer}
    </div>
  )
}
