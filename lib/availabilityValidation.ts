/**
 * Validation des créneaux disponibilité / indisponibilité athlète.
 * Référence : docs/design-athlete-availability/SPEC_ARCHITECTURE.md
 */

const VALID_TYPES = ['available', 'unavailable'] as const

export type AvailabilityFormData = {
  date: string
  type: 'available' | 'unavailable'
  startTime: string | null
  endTime: string | null
  note: string | null
}

function parseTime(s: string | null): number | null {
  if (!s || typeof s !== 'string') return null
  const [h, m] = s.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/**
 * Valide les données du formulaire disponibilité / indisponibilité.
 * Retourne soit les données validées, soit une erreur (message + code pour i18n).
 */
export function validateAvailabilityFormData(formData: FormData):
  | { error: string; errorCode?: string }
  | { data: AvailabilityFormData } {
  const date = (formData.get('date') as string)?.trim()
  const typeRaw = (formData.get('type') as string)?.trim()
  const startTime = (formData.get('start_time') as string)?.trim() || null
  const endTime = (formData.get('end_time') as string)?.trim() || null
  const note = (formData.get('note') as string)?.trim() || null

  if (!date) return { error: 'Date requise.', errorCode: 'dateRequired' }
  const dateMatch = /^\d{4}-\d{2}-\d{2}$/.exec(date)
  if (!dateMatch) return { error: 'Date invalide.', errorCode: 'invalidDate' }

  if (!typeRaw || !VALID_TYPES.includes(typeRaw as 'available' | 'unavailable')) {
    return { error: 'Type invalide.', errorCode: 'invalidType' }
  }
  const type = typeRaw as 'available' | 'unavailable'

  if (startTime && endTime) {
    const startMin = parseTime(startTime)
    const endMin = parseTime(endTime)
    if (startMin == null || endMin == null) return { error: 'Heures invalides.', errorCode: 'invalidTime' }
    if (startMin > endMin) return { error: 'L\'heure de début doit être avant l\'heure de fin.', errorCode: 'startAfterEnd' }
  }

  return {
    data: {
      date,
      type,
      startTime: startTime || null,
      endTime: endTime || null,
      note: note || null,
    },
  }
}
