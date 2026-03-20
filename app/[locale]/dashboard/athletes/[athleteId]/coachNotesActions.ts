'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import {
  AUTH_ERROR_CODES,
  requireCoachAthleteCalendarAccess,
  type ErrorResult,
} from '@/lib/authHelpers'
import { createError, createSuccess, type ApiErrorCode, type ApiResult } from '@/lib/errors'
import { logger } from '@/lib/logger'

function trimRequired (value: unknown): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t.length > 0 ? t : null
}

function apiCodeFromCalendarAccess (access: ErrorResult): ApiErrorCode {
  const code = access.errorCode
  if (code === AUTH_ERROR_CODES.NOT_AUTHENTICATED) return 'AUTH_REQUIRED'
  if (code === AUTH_ERROR_CODES.PROFILE_NOT_FOUND) return 'NOT_FOUND'
  return 'FORBIDDEN'
}

export async function createCoachAthleteNote (params: {
  athleteId: string
  title: string
  body: string
}): Promise<ApiResult<{ id: string }>> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'coachAthleteNotes.validation' })

  const title = trimRequired(params.title)
  const body = trimRequired(params.body)
  if (!title) return createError(t('titleRequired'), 'VALIDATION_ERROR')
  if (!body) return createError(t('bodyRequired'), 'VALIDATION_ERROR')

  const supabase = await createClient()
  const access = await requireCoachAthleteCalendarAccess(supabase, params.athleteId)
  if ('error' in access) {
    return createError(t('serverError'), apiCodeFromCalendarAccess(access))
  }

  const { data, error } = await supabase
    .from('coach_athlete_notes')
    .insert({
      athlete_id: params.athleteId,
      coach_id: access.user.id,
      title,
      body,
    })
    .select('id')
    .single()

  if (error || !data) {
    logger.error('createCoachAthleteNote failed', error, { athleteId: params.athleteId })
    return createError(t('serverError'), 'SERVER_ERROR')
  }

  revalidatePath(`/dashboard/athletes/${params.athleteId}`)
  return createSuccess({ id: data.id })
}

export async function updateCoachAthleteNote (params: {
  athleteId: string
  noteId: string
  title: string
  body: string
}): Promise<ApiResult<true>> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'coachAthleteNotes.validation' })

  const title = trimRequired(params.title)
  const body = trimRequired(params.body)
  if (!title) return createError(t('titleRequired'), 'VALIDATION_ERROR')
  if (!body) return createError(t('bodyRequired'), 'VALIDATION_ERROR')

  const supabase = await createClient()
  const access = await requireCoachAthleteCalendarAccess(supabase, params.athleteId)
  if ('error' in access) {
    return createError(t('serverError'), apiCodeFromCalendarAccess(access))
  }

  const { data: existing, error: fetchError } = await supabase
    .from('coach_athlete_notes')
    .select('id, coach_id, athlete_id')
    .eq('id', params.noteId)
    .maybeSingle()

  if (fetchError) {
    logger.error('updateCoachAthleteNote: fetch note failed', fetchError, { noteId: params.noteId })
    return createError(t('serverError'), 'SERVER_ERROR')
  }
  if (!existing) {
    return createError(t('noteNotFound'), 'NOT_FOUND')
  }
  if (existing.coach_id !== access.user.id || existing.athlete_id !== params.athleteId) {
    return createError(t('serverError'), 'FORBIDDEN')
  }

  const { error } = await supabase
    .from('coach_athlete_notes')
    .update({ title, body })
    .eq('id', params.noteId)
    .eq('athlete_id', params.athleteId)
    .eq('coach_id', access.user.id)

  if (error) {
    logger.error('updateCoachAthleteNote failed', error, { noteId: params.noteId })
    return createError(t('serverError'), 'SERVER_ERROR')
  }

  revalidatePath(`/dashboard/athletes/${params.athleteId}`)
  return createSuccess(true)
}

export async function deleteCoachAthleteNote (params: {
  athleteId: string
  noteId: string
}): Promise<ApiResult<true>> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'coachAthleteNotes.validation' })

  const supabase = await createClient()
  const access = await requireCoachAthleteCalendarAccess(supabase, params.athleteId)
  if ('error' in access) {
    return createError(t('serverError'), apiCodeFromCalendarAccess(access))
  }

  const { data: existing, error: fetchError } = await supabase
    .from('coach_athlete_notes')
    .select('id, coach_id, athlete_id')
    .eq('id', params.noteId)
    .maybeSingle()

  if (fetchError) {
    logger.error('deleteCoachAthleteNote: fetch note failed', fetchError, { noteId: params.noteId })
    return createError(t('serverError'), 'SERVER_ERROR')
  }
  if (!existing) {
    return createError(t('noteNotFound'), 'NOT_FOUND')
  }
  if (existing.coach_id !== access.user.id || existing.athlete_id !== params.athleteId) {
    return createError(t('serverError'), 'FORBIDDEN')
  }

  const { error } = await supabase
    .from('coach_athlete_notes')
    .delete()
    .eq('id', params.noteId)
    .eq('athlete_id', params.athleteId)
    .eq('coach_id', access.user.id)

  if (error) {
    logger.error('deleteCoachAthleteNote failed', error, { noteId: params.noteId })
    return createError(t('serverError'), 'SERVER_ERROR')
  }

  revalidatePath(`/dashboard/athletes/${params.athleteId}`)
  return createSuccess(true)
}
