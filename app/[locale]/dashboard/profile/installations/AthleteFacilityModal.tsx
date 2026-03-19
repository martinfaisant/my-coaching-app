'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Segments } from '@/components/Segments'
import { Input } from '@/components/Input'
import { Dropdown, type DropdownOption } from '@/components/Dropdown'
import { useTranslations } from 'next-intl'
import type { AthleteFacility, FacilityDayKey, FacilityType, FacilityWeekOpening } from '@/types/database'
import { getDefaultFacilityWeekOpening } from '@/lib/facilityHoursUtils'
import { useActionState } from 'react'
import { createAthleteFacility, updateAthleteFacility, type AthleteFacilityFormState } from './actions'
import { IconBuilding } from '@/components/icons/IconBuilding'
import { Trash2 } from 'lucide-react'

const FACILITY_TYPES: FacilityType[] = ['piscine', 'salle', 'stade', 'autre']

const TIME_VALUES_30M_START = (() => {
  const values: string[] = []
  for (let h = 0; h <= 23; h++) {
    for (const m of [0, 30] as const) {
      if (h === 23 && m === 30) {
        values.push('23:30')
      } else {
        values.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
  }
  // Remarque : la boucle ci-dessus duplique 23:30, on dé-duplique.
  return Array.from(new Set(values))
})()

const TIME_VALUES_30M_INTERNAL: string[] = [...TIME_VALUES_30M_START, '24:00']

function timeToMinutes(t: string): number {
  const [hhRaw, mmRaw] = t.split(':')
  const hh = Number(hhRaw)
  const mm = Number(mmRaw)
  return hh * 60 + mm
}

function timeToLabel(t: string): string {
  return t === '24:00' ? '00:00' : t
}

function nextTimeAfter(time: string): string | null {
  const idx = TIME_VALUES_30M_INTERNAL.indexOf(time)
  if (idx < 0) return null
  return TIME_VALUES_30M_INTERNAL[idx + 1] ?? null
}

function getEndTimeOptions(start: string): DropdownOption[] {
  const startMin = timeToMinutes(start)
  return TIME_VALUES_30M_INTERNAL.filter((t) => timeToMinutes(t) > startMin).map((t) => ({ value: t, label: timeToLabel(t) }))
}

function getStartTimeOptions(daySlots: { start: string; end: string }[], slotIndex: number): DropdownOption[] {
  if (slotIndex === 0) {
    return TIME_VALUES_30M_START.map((t) => ({ value: t, label: t }))
  }
  const prevEnd = daySlots[slotIndex - 1]?.end
  const prevEndMin = prevEnd ? timeToMinutes(prevEnd) : 0
  return TIME_VALUES_30M_START.filter((t) => timeToMinutes(t) >= prevEndMin).map((t) => ({ value: t, label: t }))
}

function getFirstValidEndValue(currentEnd: string, start: string): string {
  const options = getEndTimeOptions(start)
  const values = new Set(options.map((o) => o.value))
  if (values.has(currentEnd)) return currentEnd
  return options[0]?.value ?? '24:00'
}

type AthleteFacilityModalProps = {
  isOpen: boolean
  facility: AthleteFacility | null
  onClose: () => void
  onSaved: () => void
}

export function AthleteFacilityModal({ isOpen, facility, onClose, onSaved }: AthleteFacilityModalProps) {
  const tFacilities = useTranslations('facilities')
  const tFacilityTypes = useTranslations('facilities.facilityTypes')
  const tHours = useTranslations('facilities.hours')
  const tDays = useTranslations('facilities.days')
  const tModal = useTranslations('facilities.modal')
  const tFields = useTranslations('facilities.fields')
  const tCommon = useTranslations('common')

  const isEdit = !!facility

  const [facilityType, setFacilityType] = useState<FacilityType>(() => facility?.facility_type ?? 'piscine')
  const [facilityName, setFacilityName] = useState<string>(() => facility?.facility_name ?? '')

  const [address, setAddress] = useState<string>(() => facility?.address ?? '')
  const [addressPostalCode, setAddressPostalCode] = useState<string>(() => facility?.address_postal_code ?? '')
  const [addressCity, setAddressCity] = useState<string>(() => facility?.address_city ?? '')
  const [addressCountry, setAddressCountry] = useState<string>(() => facility?.address_country ?? '')
  const [addressComplement, setAddressComplement] = useState<string>(() => facility?.address_complement ?? '')

  const [openingHours, setOpeningHours] = useState<FacilityWeekOpening>(() =>
    facility?.opening_hours ? facility.opening_hours : getDefaultFacilityWeekOpening()
  )

  const [state, action, isPending] = useActionState<AthleteFacilityFormState, FormData>(
    async (_prev, fd) => {
      if (isEdit) return updateAthleteFacility(_prev, fd)
      return createAthleteFacility(_prev, fd)
    },
    {} as AthleteFacilityFormState
  )

  useEffect(() => {
    if (state?.success) {
      onSaved()
    }
  }, [state?.success, onSaved])

  const openBadgePill = (dayKey: FacilityDayKey) => {
    const dayOpening = openingHours[dayKey]
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 whitespace-nowrap">
        {dayOpening.open ? tHours('open') : tHours('closed')}
      </span>
    )
  }

  const splitFacilityLabelOnSmall = (label: string) => {
    const trimmed = label.trim()
    const parts = trimmed.split(/\s+/g).filter(Boolean)
    if (parts.length <= 1) return label
    const first = parts[0]
    const rest = parts.slice(1).join(' ')

    return (
      <>
        <span className="hidden sm:inline">{trimmed}</span>
        <span className="sm:hidden whitespace-normal leading-tight">
          {first}
          <br />
          {rest}
        </span>
      </>
    )
  }

  const handleSetSlot = (dayKey: FacilityDayKey, slotIndex: number, patch: Partial<{ start: string; end: string }>) => {
    setOpeningHours((prev) => {
      const day = prev[dayKey]
      const nextSlots = day.slots.map((s, idx) => {
        if (idx !== slotIndex) return s
        return { ...s, ...patch }
      })

      // Garantie : end strictement après start (important pour le comportement end dropdown filtré).
      if (patch.start) {
        const nextStart = patch.start
        const currentEnd = nextSlots[slotIndex]?.end ?? '24:00'
        const nextEnd = getFirstValidEndValue(currentEnd, nextStart)
        nextSlots[slotIndex] = { ...nextSlots[slotIndex], start: nextStart, end: nextEnd }
      }

      return { ...prev, [dayKey]: { ...day, slots: nextSlots } }
    })
  }

  const handleAddSlot = (dayKey: FacilityDayKey) => {
    setOpeningHours((prev) => {
      const day = prev[dayKey]
      const slots = [...day.slots]

      let newSlot: { start: string; end: string } | null = null
      if (slots.length === 0) {
        newSlot = { start: '07:00', end: '12:00' }
      } else {
        const lastEnd = slots[slots.length - 1]?.end
        const nextStart = nextTimeAfter(lastEnd)
        if (!nextStart) return prev

        // Par défaut : durée 2h si possible, sinon la première fin valide.
        const desiredEndMin = timeToMinutes(nextStart) + 120
        const endOptions = getEndTimeOptions(nextStart).map((o) => o.value)
        const candidate = endOptions.find((end) => timeToMinutes(end) >= desiredEndMin && timeToMinutes(end) > timeToMinutes(nextStart))
        newSlot = { start: nextStart, end: candidate ?? endOptions[0] }
      }

      return {
        ...prev,
        [dayKey]: {
          open: true,
          slots: [...slots, newSlot].filter(Boolean) as { start: string; end: string }[],
        },
      }
    })
  }

  const handleRemoveSlot = (dayKey: FacilityDayKey, slotIndex: number) => {
    setOpeningHours((prev) => {
      const day = prev[dayKey]
      const nextSlots = day.slots.filter((_, idx) => idx !== slotIndex)
      return {
        ...prev,
        [dayKey]: { open: nextSlots.length > 0, slots: nextSlots },
      }
    })
  }

  const hoursBlock = (
    <div className="mt-6">
      <h3 className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 ml-1">{tHours('title')}</h3>

      <div className="space-y-4">
        {(
          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as FacilityDayKey[]
        ).map((dayKey) => {
          const dayOpening = openingHours[dayKey]
          const isOpen = dayOpening.open

          return (
            <div key={dayKey} className="border border-stone-200 rounded-lg p-3 bg-white">
              {(() => {
                const badge = openBadgePill(dayKey)
                const dayLabel = tDays(dayKey)

                const slotsContent = isOpen ? (
                  <div className="flex flex-col items-center space-y-2">
                    {dayOpening.slots.map((slot, slotIndex) => {
                      const startOptions = getStartTimeOptions(dayOpening.slots, slotIndex)
                      const endOptions = getEndTimeOptions(slot.start)

                      const displayedEnd = getFirstValidEndValue(slot.end, slot.start)
                      const slotEnd = displayedEnd

                      return (
                        <div
                          key={`${dayKey}-${slotIndex}`}
                          className="grid grid-cols-[104px_auto_104px_32px] items-center justify-center gap-2 w-full"
                        >
                          <div className="w-full flex justify-center">
                            <Dropdown
                              id={`start-${dayKey}-${slotIndex}`}
                              label={tHours('slotStartAria')}
                              options={startOptions}
                              value={slot.start}
                              onChange={(v) => handleSetSlot(dayKey, slotIndex, { start: v })}
                              ariaLabel={tHours('slotStartAria')}
                              hideLabel
                              minWidth="104px"
                              triggerClassName="justify-between"
                            />
                          </div>
                          <span className="text-stone-400 font-medium text-sm text-center">-</span>
                          <div className="w-full flex justify-center">
                            <Dropdown
                              id={`end-${dayKey}-${slotIndex}`}
                              label={tHours('slotEndAria')}
                              options={endOptions}
                              value={slotEnd}
                              onChange={(v) => handleSetSlot(dayKey, slotIndex, { end: v })}
                              ariaLabel={tHours('slotEndAria')}
                              hideLabel
                              minWidth="104px"
                              triggerClassName="justify-between"
                            />
                          </div>
                          <div className="w-full flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveSlot(dayKey, slotIndex)}
                              aria-label={tHours('removeSlotAriaLabel')}
                              className="!min-h-10 !min-w-10"
                            >
                              <Trash2 className="w-5 h-5" aria-hidden />
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    <div className="mt-1">
                      <Button type="button" variant="muted" onClick={() => handleAddSlot(dayKey)} className="mt-3">
                        {tHours('addHours')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Button
                      type="button"
                      variant="muted"
                      onClick={() => handleAddSlot(dayKey)}
                      className="mt-3"
                    >
                      {tHours('addHours')}
                    </Button>
                  </div>
                )

                return (
                  <>
                    {/* Mobile : 1re ligne = jour + badge, puis créneaux sur pleine largeur */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-stone-500">{dayLabel}</div>
                        <div className="flex items-center justify-end">{badge}</div>
                      </div>
                      <div className="w-full">{slotsContent}</div>
                    </div>

                    {/* Desktop : 3 colonnes (jour / créneaux / badge) */}
                    <div className="hidden sm:grid sm:grid-cols-[160px_1fr_auto] sm:gap-4 sm:items-start min-w-0">
                      <div>{dayLabel}</div>
                      <div className="mx-auto w-full max-w-full">{slotsContent}</div>
                      <div className="flex items-center justify-end">{badge}</div>
                    </div>
                  </>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )

  const formId = 'facility-form'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? tModal('editTitle') : tModal('addTitle')}
      icon={<IconBuilding className="w-5 h-5" />}
      size="2xl"
      contentClassName="px-6 py-4"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="muted" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={isPending}
            loading={isPending}
            loadingText={tCommon('saving')}
          >
            {isEdit ? tModal('saveButton') : tModal('addButton')}
          </Button>
        </div>
      }
    >
      <form id={formId} action={action} className="space-y-5">
        {isEdit && facility?.id ? (
          <input type="hidden" name="facility_id" value={facility.id} readOnly aria-hidden />
        ) : null}

        <div>
          <Segments
            name="facility_type"
            ariaLabel={tFacilities('form.typeLabel')}
            options={FACILITY_TYPES.map((ft) => ({
              value: ft,
              label: splitFacilityLabelOnSmall(tFacilityTypes(ft)),
            }))}
            value={facilityType}
            onChange={(v) => setFacilityType(v as FacilityType)}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Input
            label={tFields('facilityName')}
            name="facility_name"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            required
          />

          <Input
            label={tFields('streetAndNumber')}
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={tFields('postalCode')}
            name="address_postal_code"
            value={addressPostalCode}
            onChange={(e) => setAddressPostalCode(e.target.value)}
            required
          />
          <Input label={tFields('city')} name="address_city" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required />
          <Input
            label={tFields('country')}
            name="address_country"
            value={addressCountry}
            onChange={(e) => setAddressCountry(e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label={tFields('addressComplement')}
            name="address_complement"
            value={addressComplement}
            onChange={(e) => setAddressComplement(e.target.value)}
          />
        </div>

        {/* JSONB persisté côté serveur (validation stricte). */}
        <input type="hidden" name="opening_hours" value={JSON.stringify(openingHours)} readOnly aria-hidden />

        {hoursBlock}

        {state?.error ? <p className="text-sm text-palette-danger">{state.error}</p> : null}
      </form>
    </Modal>
  )
}

