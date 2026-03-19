'use client'

import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { formatFacilitySlotTime, DAYS_ORDER } from '@/lib/facilityHoursUtils'
import type { AthleteFacility, FacilityDayKey, FacilityType } from '@/types/database'
import { useTranslations } from 'next-intl'
import type { SportType } from '@/lib/sportStyles'
import { Trash2 } from 'lucide-react'

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

export type AthleteFacilityCardProps = {
  facility: AthleteFacility
  onEdit: () => void
  onDelete: () => void
  deleteError?: string | null
}

export function AthleteFacilityCard({ facility, onEdit, onDelete, deleteError }: AthleteFacilityCardProps) {
  const t = useTranslations('facilities')
  const tDays = useTranslations('facilities.days')
  const tFacilityTypes = useTranslations('facilities.facilityTypes')
  const tHours = useTranslations('facilities.hours')
  const badgeSport = facilityTypeToSport(facility.facility_type)

  const renderDayRow = (dayKey: FacilityDayKey) => {
    const dayOpening = facility.opening_hours[dayKey]
    const isOpen = dayOpening.open

    return (
      <div
        key={dayKey}
        className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-3 items-start"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-stone-500 leading-none">{tDays(dayKey)}</div>

        <div className="flex justify-center">
          {isOpen ? (
            <div className="text-sm font-medium text-stone-700 text-center leading-none">
              {formatSlots(dayOpening.slots)}
            </div>
          ) : (
            <div className="min-h-[1.5rem]" />
          )}
        </div>

        <div className="flex items-start justify-end">
          <span className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 whitespace-nowrap">
            {isOpen ? tHours('open') : tHours('closed')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-stone-100 bg-white rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge sport={badgeSport} className="bg-white">
              {tFacilityTypes(facility.facility_type)}
            </Badge>
            <div className="text-sm font-bold text-stone-900 truncate">{facility.facility_name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="muted" onClick={onEdit}>
            {t('editButton')}
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete} aria-label={t('deleteButtonAriaLabel')}>
            <Trash2 className="w-5 h-5" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-start">
        {/* Left: address */}
        <div className="text-sm text-stone-700 space-y-1.5">
          <div className="whitespace-pre-wrap">{facility.address}</div>
          <div>
            {facility.address_postal_code} · {facility.address_city}
          </div>
          <div>{facility.address_country}</div>
          {facility.address_complement ? <div className="text-stone-500">{facility.address_complement}</div> : null}
        </div>

        {/* Right: opening hours */}
        <div>
          <div className="space-y-1">{DAYS_ORDER.map((dayKey) => renderDayRow(dayKey))}</div>
        </div>
      </div>

      {deleteError ? <p className="mt-3 text-sm text-palette-danger">{deleteError}</p> : null}
    </div>
  )
}

