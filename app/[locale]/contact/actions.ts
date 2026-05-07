'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import {
  CONTACT_EMAIL_RE,
  CONTACT_MAX_EMAIL,
  CONTACT_MAX_MESSAGE,
  CONTACT_MAX_NAME,
  CONTACT_MAX_PHONE,
} from '@/lib/contactFormConstraints'
import { isContactReasonKey } from '@/lib/contactReasons'
import { RESEND_KEY_MISSING_ERROR, sendContactSupportEmail } from '@/lib/contactSupportEmail'
import { logger } from '@/lib/logger'

export type ContactFormState = {
  success?: boolean
  reference?: string
  error?: string
}

function normalizeLocale(raw: string | null): 'fr' | 'en' {
  return raw === 'en' ? 'en' : 'fr'
}

/** PostgREST renvoie souvent `id` (uuid) en string JSON ; on accepte toute valeur non vide convertible. */
function parseContactSubmissionRpcRow(row: unknown): { id: string; reference: string } | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const reference = o.reference
  if (typeof reference !== 'string' || reference.length === 0) return null
  const idRaw = o.id
  if (idRaw == null) return null
  const id = typeof idRaw === 'string' ? idRaw : String(idRaw)
  if (!id || id === '[object Object]') return null
  return { id, reference }
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const locale = normalizeLocale(formData.get('_locale') as string | null)
  const t = await getTranslations({ locale, namespace: 'contact.errors' })

  const honeypot = (formData.get('website') as string | null) ?? ''
  if (honeypot.trim() !== '') {
    return { error: t('submitFailed') }
  }

  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phoneRaw = String(formData.get('phone') ?? '').trim()
  const phone = phoneRaw === '' ? null : phoneRaw.slice(0, CONTACT_MAX_PHONE)
  const reasonKey = String(formData.get('reasonKey') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!firstName) {
    return { error: t('firstNameInvalid') }
  }
  if (firstName.length > CONTACT_MAX_NAME) {
    return { error: t('firstNameTooLong', { max: CONTACT_MAX_NAME }) }
  }
  if (!lastName) {
    return { error: t('lastNameInvalid') }
  }
  if (lastName.length > CONTACT_MAX_NAME) {
    return { error: t('lastNameTooLong', { max: CONTACT_MAX_NAME }) }
  }
  if (!email || email.length > CONTACT_MAX_EMAIL || !CONTACT_EMAIL_RE.test(email)) {
    return { error: t('emailInvalid') }
  }
  if (!isContactReasonKey(reasonKey)) {
    return { error: t('reasonInvalid') }
  }
  if (!message) {
    return { error: t('messageInvalid') }
  }
  if (message.length > CONTACT_MAX_MESSAGE) {
    return { error: t('messageTooLong', { max: CONTACT_MAX_MESSAGE }) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  const tReasons = await getTranslations({ locale, namespace: 'contact.reasons' })
  const reasonLabel = tReasons(reasonKey)

  let submissionId: string
  let reference: string

  try {
    const admin = createAdminClient()
    // Tous les paramètres en types sérialisables JSON (pas d'undefined) pour PostgREST.
    const { data: rows, error: rpcError } = await admin.rpc('insert_contact_submission', {
      p_user_id: userId,
      p_locale: locale,
      p_first_name: firstName.slice(0, CONTACT_MAX_NAME),
      p_last_name: lastName.slice(0, CONTACT_MAX_NAME),
      p_email: email.slice(0, CONTACT_MAX_EMAIL),
      p_phone: phone ?? '',
      p_reason_key: reasonKey,
      p_message: message.slice(0, CONTACT_MAX_MESSAGE),
    })

    if (rpcError) {
      logger.error('insert_contact_submission RPC failed', rpcError)
      return { error: t('submitFailed') }
    }

    const row = Array.isArray(rows) ? rows[0] : rows
    const parsed = parseContactSubmissionRpcRow(row)

    if (!parsed) {
      logger.error('insert_contact_submission returned unexpected shape')
      return { error: t('submitFailed') }
    }

    submissionId = parsed.id
    reference = parsed.reference
  } catch (e) {
    logger.error('Contact submission failed before email', e)
    return { error: t('submitFailed') }
  }

  try {
    await sendContactSupportEmail({
      reference,
      locale,
      firstName,
      lastName,
      email,
      phone,
      reasonLabel,
      reasonKey,
      message,
      userId,
    })
  } catch (e) {
    logger.error('Contact support email failed after DB insert', e)
    if (e instanceof Error && e.message === RESEND_KEY_MISSING_ERROR) {
      return { error: t('emailNotifyUnavailable') }
    }
    return { error: t('emailSendFailed') }
  }

  try {
    const admin = createAdminClient()
    const { error: updError } = await admin
      .from('contact_submissions')
      .update({ email_delivered_at: new Date().toISOString() })
      .eq('id', submissionId)

    if (updError) {
      logger.error('contact_submissions email_delivered_at update failed', updError)
    }
  } catch (e) {
    logger.error('contact_submissions email_delivered_at update threw', e)
  }

  return { success: true, reference }
}
