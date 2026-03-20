export type GoalFormState = {
  error?: string
  success?: string
}

export const RESULT_NOTE_MAX_LENGTH = 500

type TranslationFn = (key: string, values?: Record<string, string | number | Date>) => string

export type ParsedTargetTime = { hours: number; minutes: number; seconds: number }

export function parseTargetTime(
  formData: FormData,
  t: TranslationFn
): ParsedTargetTime | null | { error: string } {
  const hStr = (formData.get('target_time_hours') as string)?.trim() ?? ''
  const mStr = (formData.get('target_time_minutes') as string)?.trim() ?? ''
  const sStr = (formData.get('target_time_seconds') as string)?.trim() ?? ''
  if (hStr === '' && mStr === '' && sStr === '') return null
  const hours = hStr === '' ? 0 : parseInt(hStr, 10)
  const minutes = mStr === '' ? 0 : parseInt(mStr, 10)
  const seconds = sStr === '' ? 0 : parseInt(sStr, 10)
  if (Number.isNaN(hours) || hours < 0 || hours > 99) return { error: t('invalidTimeRange') }
  if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) return { error: t('invalidTimeRange') }
  if (Number.isNaN(seconds) || seconds < 0 || seconds > 59) return { error: t('invalidTimeRange') }
  return { hours, minutes, seconds }
}

export type ParsedGoalFields = {
  date: string
  raceName: string
  distance: string
  isPrimary: boolean
}

export function validateGoalFields(
  formData: FormData,
  t: TranslationFn
): { error: string } | { data: ParsedGoalFields } {
  const date = (formData.get('date') as string)?.trim() ?? ''
  const raceName = (formData.get('race_name') as string)?.trim() ?? ''
  const distance = (formData.get('distance') as string)?.trim() ?? ''
  const isPrimary = formData.get('is_primary') === 'primary'
  if (!date || !raceName || !distance) {
    return { error: t('allFieldsRequired') }
  }
  return { data: { date, raceName, distance, isPrimary } }
}

export type ParsedResultFields = {
  resultTimeHours: number
  resultTimeMinutes: number
  resultTimeSeconds: number
  resultPlace: number | null
  resultNote: string | null
}

export type ResultFieldsParseResult =
  | { kind: 'none' }
  | { kind: 'error'; error: string }
  | { kind: 'parsed'; data: ParsedResultFields }

export function parseResultFields(
  formData: FormData,
  t: TranslationFn
): ResultFieldsParseResult {
  const hoursStr = (formData.get('result_time_hours') as string)?.trim() ?? ''
  const minutesStr = (formData.get('result_time_minutes') as string)?.trim() ?? ''
  const secondsStr = (formData.get('result_time_seconds') as string)?.trim() ?? ''
  const placeStr = (formData.get('result_place') as string)?.trim() ?? ''
  const note = (formData.get('result_note') as string)?.trim() ?? ''

  if (hoursStr === '' && minutesStr === '' && secondsStr === '') return { kind: 'none' }

  const hours = hoursStr === '' ? 0 : parseInt(hoursStr, 10)
  const minutes = minutesStr === '' ? 0 : parseInt(minutesStr, 10)
  const seconds = secondsStr === '' ? 0 : parseInt(secondsStr, 10)

  if (
    Number.isNaN(hours) || hours < 0 || hours > 99 ||
    Number.isNaN(minutes) || minutes < 0 || minutes > 59 ||
    Number.isNaN(seconds) || seconds < 0 || seconds > 59
  ) {
    return { kind: 'error', error: t('invalidTimeRange') }
  }

  if (note.length > RESULT_NOTE_MAX_LENGTH) {
    return { kind: 'error', error: t('noteMaxLength', { max: RESULT_NOTE_MAX_LENGTH }) }
  }

  const resultPlace = placeStr === '' ? null : Math.max(1, parseInt(placeStr, 10))

  return {
    kind: 'parsed',
    data: {
      resultTimeHours: hours,
      resultTimeMinutes: minutes,
      resultTimeSeconds: seconds,
      resultPlace,
      resultNote: note || null,
    },
  }
}
