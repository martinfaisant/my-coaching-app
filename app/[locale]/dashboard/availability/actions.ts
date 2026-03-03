'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AthleteAvailabilitySlot } from '@/types/database'
import { requireCoachOrAthleteAccess } from '@/lib/authHelpers'
import { validateAvailabilityFormData } from '@/lib/availabilityValidation'
import { getLocale } from 'next-intl/server'

export type CreateAvailabilityState = {
  error?: string
  success?: boolean
  /** Slots créés (pour mise à jour optimiste côté client). */
  slots?: AthleteAvailabilitySlot[]
}

export async function getAvailabilityForDateRange(
  athleteId: string,
  startDate: string,
  endDate: string
): Promise<AthleteAvailabilitySlot[]> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return []

  const { data, error } = await supabase
    .from('athlete_availability_slots')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('start_time', { nullsFirst: true })
    .order('created_at')

  if (error) return []
  return (data ?? []) as AthleteAvailabilitySlot[]
}

/** Si formData contient slot_id, effectue une mise à jour ; sinon création. */
export async function saveAvailability(
  athleteId: string,
  pathToRevalidate: string,
  _prevState: CreateAvailabilityState,
  formData: FormData
): Promise<CreateAvailabilityState> {
  const slotId = (formData.get('slot_id') as string)?.trim() || null
  if (slotId) {
    const updateResult = await updateAvailability(athleteId, pathToRevalidate, slotId, {}, formData)
    return updateResult.success ? { success: true } : { error: updateResult.error }
  }
  return createAvailability(athleteId, pathToRevalidate, _prevState, formData)
}

export async function createAvailability(
  athleteId: string,
  pathToRevalidate: string,
  _prevState: CreateAvailabilityState,
  formData: FormData
): Promise<CreateAvailabilityState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  const locale = await getLocale()

  if ('error' in accessResult) {
    const { getTranslations } = await import('next-intl/server')
    const tAuth = await getTranslations({ locale, namespace: 'auth.errors' })
    return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }
  }

  const { isAthlete } = accessResult
  if (!isAthlete) {
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations({ locale, namespace: 'availability.validation' })
    return { error: t('onlyAthleteCanCreate') }
  }

  const validation = validateAvailabilityFormData(formData)
  if ('error' in validation) {
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations({ locale, namespace: 'availability.validation' })
    const msg = validation.errorCode ? t(validation.errorCode) : validation.error
    return { error: msg }
  }

  const { data } = validation
  const rows = [
    {
      athlete_id: athleteId,
      date: data.date,
      type: data.type,
      start_time: data.startTime || null,
      end_time: data.endTime || null,
      note: data.note || null,
    },
  ]

  const { data: inserted, error } = await supabase
    .from('athlete_availability_slots')
    .insert(rows)
    .select()

  if (error) {
    const { getTranslations } = await import('next-intl/server')
    const tErrors = await getTranslations({ locale, namespace: 'errors' })
    return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true, slots: (inserted ?? []) as AthleteAvailabilitySlot[] }
}

export type UpdateAvailabilityState = { error?: string; success?: boolean }

/** Valide les champs pour une mise à jour (un seul créneau, pas de récurrence). */
function validateUpdateFormData(formData: FormData): { error: string; errorCode?: string } | { data: { date: string; type: 'available' | 'unavailable'; startTime: string | null; endTime: string | null; note: string | null } } {
  const date = (formData.get('date') as string)?.trim()
  const typeRaw = (formData.get('type') as string)?.trim()
  const startTime = (formData.get('start_time') as string)?.trim() || null
  const endTime = (formData.get('end_time') as string)?.trim() || null
  const note = (formData.get('note') as string)?.trim() || null

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Date invalide.', errorCode: 'invalidDate' }
  if (!typeRaw || (typeRaw !== 'available' && typeRaw !== 'unavailable')) return { error: 'Type invalide.', errorCode: 'invalidType' }
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    if (Number.isNaN(startMin) || Number.isNaN(endMin)) return { error: 'Heures invalides.', errorCode: 'invalidTime' }
    if (startMin > endMin) return { error: 'Heure de début avant fin.', errorCode: 'startAfterEnd' }
  }
  return { data: { date, type: typeRaw as 'available' | 'unavailable', startTime: startTime || null, endTime: endTime || null, note } }
}

export async function updateAvailability(
  athleteId: string,
  pathToRevalidate: string,
  slotId: string,
  _prevState: UpdateAvailabilityState,
  formData: FormData
): Promise<UpdateAvailabilityState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  const locale = await getLocale()

  if ('error' in accessResult) {
    const { getTranslations } = await import('next-intl/server')
    const tAuth = await getTranslations({ locale, namespace: 'auth.errors' })
    return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }
  }
  if (!accessResult.isAthlete) {
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations({ locale, namespace: 'availability.validation' })
    return { error: t('onlyAthleteCanCreate') }
  }

  const validation = validateUpdateFormData(formData)
  if ('error' in validation) {
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations({ locale, namespace: 'availability.validation' })
    const msg = validation.errorCode ? t(validation.errorCode) : validation.error
    return { error: msg }
  }

  const { data } = validation
  const { error } = await supabase
    .from('athlete_availability_slots')
    .update({
      date: data.date,
      type: data.type,
      start_time: data.startTime || null,
      end_time: data.endTime || null,
      note: data.note || null,
    })
    .eq('id', slotId)
    .eq('athlete_id', accessResult.user.id)

  if (error) {
    const { getTranslations } = await import('next-intl/server')
    const tErrors = await getTranslations({ locale, namespace: 'errors' })
    return { error: tErrors('supabaseGeneric') }
  }
  revalidatePath(pathToRevalidate)
  return { success: true }
}

export type DeleteAvailabilityState = { error?: string; success?: boolean }

export async function deleteAvailability(
  athleteId: string,
  pathToRevalidate: string,
  slotId: string
): Promise<DeleteAvailabilityState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  const locale = await getLocale()

  if ('error' in accessResult) {
    const { getTranslations } = await import('next-intl/server')
    const tAuth = await getTranslations({ locale, namespace: 'auth.errors' })
    return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }
  }
  if (!accessResult.isAthlete) {
    const { getTranslations } = await import('next-intl/server')
    const t = await getTranslations({ locale, namespace: 'availability.validation' })
    return { error: t('onlyAthleteCanCreate') }
  }

  const { error } = await supabase
    .from('athlete_availability_slots')
    .delete()
    .eq('id', slotId)
    .eq('athlete_id', accessResult.user.id)

  if (error) {
    const { getTranslations } = await import('next-intl/server')
    const tErrors = await getTranslations({ locale, namespace: 'errors' })
    return { error: tErrors('supabaseGeneric') }
  }
  revalidatePath(pathToRevalidate)
  return { success: true }
}
