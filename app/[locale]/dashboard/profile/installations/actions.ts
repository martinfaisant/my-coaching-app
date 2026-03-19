'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import { requireRole } from '@/lib/authHelpers'
import { validateFacilityOpeningHours } from '@/lib/facilityHoursUtils'
import type { FacilityType } from '@/types/database'

export type AthleteFacilityFormState = { error?: string; success?: boolean }

const FACILITY_TYPES: FacilityType[] = ['piscine', 'salle', 'stade', 'autre']

function getRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function getOptionalString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizePostalCode(value: string): string {
  // Pas de contrainte côté UI : on normalise au moment de la sauvegarde.
  // - majuscules
  // - suppression des espaces (ex: "H2L 3R6" -> "H2L3R6")
  return value.toUpperCase().replace(/\s+/g, '')
}

function parseFacilityType(value: unknown): FacilityType | null {
  if (typeof value !== 'string') return null
  if (!FACILITY_TYPES.includes(value as FacilityType)) return null
  return value as FacilityType
}

function parseOpeningHoursFromFormData(openingHoursRaw: unknown): unknown {
  if (typeof openingHoursRaw !== 'string') return null
  if (!openingHoursRaw.trim()) return null
  try {
    return JSON.parse(openingHoursRaw) as unknown
  } catch {
    return null
  }
}

export async function createAthleteFacility(_prevState: AthleteFacilityFormState, formData: FormData): Promise<AthleteFacilityFormState> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'facilities.validation' })

  const facilityType = parseFacilityType(formData.get('facility_type'))
  if (!facilityType) return { error: t('invalidFacilityType') }

  const facilityName = getRequiredString(formData.get('facility_name'))
  if (!facilityName) return { error: t('facilityNameRequired') }

  const address = getRequiredString(formData.get('address'))
  const addressPostalCode = getRequiredString(formData.get('address_postal_code'))
  const addressCity = getRequiredString(formData.get('address_city'))
  const addressCountry = getRequiredString(formData.get('address_country'))
  if (!address || !addressPostalCode || !addressCity || !addressCountry) return { error: t('addressRequired') }

  const normalizedPostalCode = normalizePostalCode(addressPostalCode)
  if (!normalizedPostalCode) return { error: t('addressRequired') }

  const openingHoursJson = parseOpeningHoursFromFormData(formData.get('opening_hours'))
  if (!openingHoursJson) return { error: t('openingHoursRequired') }

  const openingHoursValidation = validateFacilityOpeningHours(openingHoursJson)
  if (!openingHoursValidation.ok) return { error: t(openingHoursValidation.errorCode) }

  const addressComplement = getOptionalString(formData.get('address_complement'))

  const supabase = await createClient()
  const accessResult = await requireRole(supabase, 'athlete')
  if ('error' in accessResult) return { error: t('serverError') }

  const { user } = accessResult

  const { error } = await supabase.from('athlete_facilities').insert({
    athlete_id: user.id,
    facility_type: facilityType,
    facility_name: facilityName,
    address,
    address_postal_code: normalizedPostalCode,
    address_city: addressCity,
    address_country: addressCountry,
    address_complement: addressComplement,
    opening_hours: openingHoursValidation.value,
  })

  if (error) return { error: t('serverError') }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updateAthleteFacility(_prevState: AthleteFacilityFormState, formData: FormData): Promise<AthleteFacilityFormState> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'facilities.validation' })

  const facilityType = parseFacilityType(formData.get('facility_type'))
  if (!facilityType) return { error: t('invalidFacilityType') }

  const facilityName = getRequiredString(formData.get('facility_name'))
  if (!facilityName) return { error: t('facilityNameRequired') }

  const address = getRequiredString(formData.get('address'))
  const addressPostalCode = getRequiredString(formData.get('address_postal_code'))
  const addressCity = getRequiredString(formData.get('address_city'))
  const addressCountry = getRequiredString(formData.get('address_country'))
  if (!address || !addressPostalCode || !addressCity || !addressCountry) return { error: t('addressRequired') }

  const normalizedPostalCode = normalizePostalCode(addressPostalCode)
  if (!normalizedPostalCode) return { error: t('addressRequired') }

  const openingHoursJson = parseOpeningHoursFromFormData(formData.get('opening_hours'))
  if (!openingHoursJson) return { error: t('openingHoursRequired') }

  const openingHoursValidation = validateFacilityOpeningHours(openingHoursJson)
  if (!openingHoursValidation.ok) return { error: t(openingHoursValidation.errorCode) }

  const addressComplement = getOptionalString(formData.get('address_complement'))

  const facilityId = getRequiredString(formData.get('facility_id'))
  if (!facilityId) return { error: t('missingFacilityId') }

  const supabase = await createClient()
  const accessResult = await requireRole(supabase, 'athlete')
  if ('error' in accessResult) return { error: t('serverError') }

  const { user } = accessResult

  const { error: fetchError, data } = await supabase
    .from('athlete_facilities')
    .select('id')
    .eq('id', facilityId)
    .eq('athlete_id', user.id)
    .maybeSingle()

  if (fetchError) return { error: t('serverError') }
  if (!data) return { error: t('facilityNotFound') }

  const { error } = await supabase
    .from('athlete_facilities')
    .update({
      facility_type: facilityType,
      facility_name: facilityName,
      address,
      address_postal_code: normalizedPostalCode,
      address_city: addressCity,
      address_country: addressCountry,
      address_complement: addressComplement,
      opening_hours: openingHoursValidation.value,
    })
    .eq('id', facilityId)
    .eq('athlete_id', user.id)

  if (error) return { error: t('serverError') }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function deleteAthleteFacility(facilityId: string): Promise<AthleteFacilityFormState> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'facilities.validation' })

  const supabase = await createClient()
  const accessResult = await requireRole(supabase, 'athlete')
  if ('error' in accessResult) return { error: t('serverError') }

  const { user } = accessResult
  const facilityIdTrimmed = facilityId.trim()
  if (!facilityIdTrimmed) return { error: t('missingFacilityId') }

  const { error: fetchError, data } = await supabase
    .from('athlete_facilities')
    .select('id')
    .eq('id', facilityIdTrimmed)
    .eq('athlete_id', user.id)
    .maybeSingle()

  if (fetchError) return { error: t('serverError') }
  if (!data) return { error: t('facilityNotFound') }

  const { error } = await supabase
    .from('athlete_facilities')
    .delete()
    .eq('id', facilityIdTrimmed)
    .eq('athlete_id', user.id)

  if (error) return { error: t('serverError') }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

