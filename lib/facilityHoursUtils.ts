export type FacilityDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export const DAYS_ORDER: FacilityDayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export type FacilityOpeningSlot = {
  start: string // HH:MM (start)
  end: string // HH:MM or "24:00" (fin de journée)
}

export type FacilityDayOpening = {
  open: boolean
  slots: FacilityOpeningSlot[]
}

export type FacilityWeekOpening = Record<FacilityDayKey, FacilityDayOpening>

export type FacilityOpeningValidationErrorCode =
  | 'invalidOpeningHours'
  | 'missingDay'
  | 'dayOpenSlotsRequired'
  | 'dayClosedSlotsMustBeEmpty'
  | 'invalidSlotTimeFormat'
  | 'invalidSlotStartEnd'
  | 'slotOverlaps'

export function getDefaultFacilityWeekOpening(): FacilityWeekOpening {
  const closedDay: FacilityDayOpening = { open: false, slots: [] }
  return DAYS_ORDER.reduce((acc, day) => {
    acc[day] = closedDay
    return acc
  }, {} as FacilityWeekOpening)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseHHMM(value: unknown): { hour: number; minute: number } | null {
  if (typeof value !== 'string') return null
  if (!/^\d{2}:\d{2}$/.test(value)) return null

  const [hhRaw, mmRaw] = value.split(':')
  const hh = Number(hhRaw)
  const mm = Number(mmRaw)
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null

  // Support "24:00" pour fin de journée.
  if (hh === 24) {
    if (mm !== 0) return null
    return { hour: 24, minute: 0 }
  }

  if (hh < 0 || hh > 23) return null
  if (mm < 0 || mm > 59) return null

  return { hour: hh, minute: mm }
}

function toMinutes(t: { hour: number; minute: number }): number {
  return t.hour * 60 + t.minute
}

function fmtSlotTimeLabel(t: string): string {
  return t === '24:00' ? '00:00' : t
}

function hasOverlaps(slots: { startMin: number; endMin: number }[]): boolean {
  const sorted = [...slots].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    // Back-to-back autorisé (ex: 07:00-08:00 + 08:00-09:00), donc overlap strict.
    if (next.startMin < current.endMin) return true
  }
  return false
}

export function validateFacilityOpeningHours(
  openingHoursRaw: unknown
):
  | { ok: true; value: FacilityWeekOpening }
  | { ok: false; errorCode: FacilityOpeningValidationErrorCode } {
  if (!isRecord(openingHoursRaw)) {
    return { ok: false, errorCode: 'invalidOpeningHours' }
  }

  const week: Partial<FacilityWeekOpening> = {}

  for (const day of DAYS_ORDER) {
    const dayRaw = openingHoursRaw[day]
    if (!dayRaw || !isRecord(dayRaw)) return { ok: false, errorCode: 'missingDay' }

    const open = dayRaw.open
    const slotsRaw = dayRaw.slots

    if (typeof open !== 'boolean' || !Array.isArray(slotsRaw)) return { ok: false, errorCode: 'invalidOpeningHours' }

    const slots: FacilityOpeningSlot[] = []
    const converted: { startMin: number; endMin: number }[] = []

    for (const s of slotsRaw) {
      if (!isRecord(s)) return { ok: false, errorCode: 'invalidOpeningHours' }
      const startParsed = parseHHMM(s.start)
      const endParsed = parseHHMM(s.end)
      if (!startParsed || !endParsed) return { ok: false, errorCode: 'invalidSlotTimeFormat' }

      const startMin = toMinutes(startParsed)
      const endMin = toMinutes(endParsed)

      // start strict < end
      if (startMin >= endMin) return { ok: false, errorCode: 'invalidSlotStartEnd' }

      const start = s.start as string
      const end = s.end as string

      slots.push({ start, end })
      converted.push({ startMin, endMin })
    }

    // Règles ouvert/fermé
    if (!open) {
      if (slots.length !== 0) return { ok: false, errorCode: 'dayClosedSlotsMustBeEmpty' }
    } else {
      if (slots.length === 0) return { ok: false, errorCode: 'dayOpenSlotsRequired' }
    }

    // Pas de chevauchements
    if (hasOverlaps(converted)) return { ok: false, errorCode: 'slotOverlaps' }

    week[day] = { open, slots }
  }

  // Contrôle strict : toutes les clés existent
  for (const day of DAYS_ORDER) {
    if (!week[day]) return { ok: false, errorCode: 'missingDay' }
  }

  return { ok: true, value: week as FacilityWeekOpening }
}

export function formatFacilitySlotTime(t: string): string {
  return fmtSlotTimeLabel(t)
}

