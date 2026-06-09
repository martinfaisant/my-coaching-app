'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'
import { requireUser } from '@/lib/authHelpers'
import { createError, createSuccess, type ApiResult } from '@/lib/errors'
import { logger } from '@/lib/logger'
import {
  isCoachPlatformSubscriptionManaged,
  isCoachPlatformSubscriptionUnpaid,
  resolveCoachPlatformBillingPeriod,
} from '@/lib/coachPlatformSubscriptionDisplay'
import {
  cancelCoachPlatformSubscriptionImmediately,
  fetchCoachPlatformOpenInvoicePayUrl,
  previewCoachPlatformImmediateCancelRefund,
  resumeCoachPlatformSubscriptionRenewal,
  scheduleCoachPlatformSubscriptionEndAtPeriodEnd,
  syncCoachPlatformSubscriptionAfterStripeMutation,
  type CoachPlatformRefundPreview,
} from '@/lib/stripeCoachPlatformCancellation'
import { fetchCoachPlatformSubscriptionCardDetails } from '@/lib/stripeCoachPlatformCatalog'
import { getStripeServer } from '@/lib/stripeServer'
import type { CoachPlatformSubscription } from '@/types/database'

type CancellationContext = {
  row: CoachPlatformSubscription
  billingPeriod: ReturnType<typeof resolveCoachPlatformBillingPeriod>
}

async function loadCancellationContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coachId: string,
  locale: string
): Promise<ApiResult<CancellationContext>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })

  const { data: row, error } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', coachId)
    .maybeSingle()

  if (error || !row) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const platformRow = row as CoachPlatformSubscription

  if (isCoachPlatformSubscriptionUnpaid(platformRow)) {
    return createError(t('errors.payBeforeCancel'), 'VALIDATION_ERROR')
  }

  if (!isCoachPlatformSubscriptionManaged(platformRow)) {
    return createError(t('errors.notManaged'), 'VALIDATION_ERROR')
  }

  if (!platformRow.stripe_subscription_id?.trim()) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const cardDetails = await fetchCoachPlatformSubscriptionCardDetails(platformRow.stripe_subscription_id)
  const billingPeriod = resolveCoachPlatformBillingPeriod(
    cardDetails?.interval ?? null,
    cardDetails?.intervalCount ?? null
  )

  if (billingPeriod === 'other') {
    return createError(t('errors.unsupportedBillingPeriod'), 'VALIDATION_ERROR')
  }

  return createSuccess({
    row: platformRow,
    billingPeriod,
  })
}

function revalidateCoachPlatformSubscriptionPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/coach-platform-subscription`)
}

export async function previewCoachPlatformImmediateCancelRefundAction(
  locale: string
): Promise<ApiResult<CoachPlatformRefundPreview | null>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })
  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) return createError(auth.error, 'AUTH_REQUIRED')

  const ctx = await loadCancellationContext(supabase, auth.user.id, locale)
  if ('error' in ctx) return ctx

  if (ctx.data.row.status === 'trialing') {
    return createError(t('errors.immediateNotAllowedTrialing'), 'VALIDATION_ERROR')
  }

  if (ctx.data.billingPeriod !== 'monthly') {
    return createError(t('errors.immediateMonthlyOnly'), 'VALIDATION_ERROR')
  }

  const customerId = ctx.data.row.stripe_customer_id
  const subId = ctx.data.row.stripe_subscription_id
  if (!customerId || !subId) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const preview = await previewCoachPlatformImmediateCancelRefund(subId, customerId)
  return createSuccess(preview)
}

export async function scheduleCoachPlatformSubscriptionEndAction(
  locale: string
): Promise<ApiResult<{ scheduled: true }>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })
  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) return createError(auth.error, 'AUTH_REQUIRED')

  const ctx = await loadCancellationContext(supabase, auth.user.id, locale)
  if ('error' in ctx) return ctx

  if (ctx.data.row.cancel_at_period_end) {
    return createError(t('errors.alreadyScheduled'), 'VALIDATION_ERROR')
  }

  const subId = ctx.data.row.stripe_subscription_id!
  const updated = await scheduleCoachPlatformSubscriptionEndAtPeriodEnd(subId)
  if (!updated) {
    return createError(t('errors.stripeUnavailable'), 'SERVER_ERROR')
  }

  const admin = createAdminClient()
  await syncCoachPlatformSubscriptionAfterStripeMutation(admin, updated)
  revalidateCoachPlatformSubscriptionPage(locale)
  return createSuccess({ scheduled: true })
}

export async function resumeCoachPlatformSubscriptionAction(
  locale: string
): Promise<ApiResult<{ resumed: true }>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })
  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) return createError(auth.error, 'AUTH_REQUIRED')

  const { data: row, error } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', auth.user.id)
    .maybeSingle()

  if (error || !row) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const platformRow = row as CoachPlatformSubscription

  if (!platformRow.cancel_at_period_end) {
    return createError(t('errors.notScheduled'), 'VALIDATION_ERROR')
  }

  if (!platformRow.stripe_subscription_id?.trim()) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const updated = await resumeCoachPlatformSubscriptionRenewal(platformRow.stripe_subscription_id)
  if (!updated) {
    return createError(t('errors.stripeUnavailable'), 'SERVER_ERROR')
  }

  const admin = createAdminClient()
  await syncCoachPlatformSubscriptionAfterStripeMutation(admin, updated)
  revalidateCoachPlatformSubscriptionPage(locale)
  return createSuccess({ resumed: true })
}

export async function cancelCoachPlatformSubscriptionImmediatelyAction(
  locale: string
): Promise<ApiResult<{ canceled: true }>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })
  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) return createError(auth.error, 'AUTH_REQUIRED')

  const ctx = await loadCancellationContext(supabase, auth.user.id, locale)
  if ('error' in ctx) return ctx

  if (ctx.data.row.status === 'trialing') {
    return createError(t('errors.immediateNotAllowedTrialing'), 'VALIDATION_ERROR')
  }

  if (ctx.data.billingPeriod !== 'monthly') {
    return createError(t('errors.immediateMonthlyOnly'), 'VALIDATION_ERROR')
  }

  const subId = ctx.data.row.stripe_subscription_id!
  const canceled = await cancelCoachPlatformSubscriptionImmediately(subId)
  if (!canceled) {
    return createError(t('errors.stripeUnavailable'), 'SERVER_ERROR')
  }

  const admin = createAdminClient()
  await syncCoachPlatformSubscriptionAfterStripeMutation(admin, canceled)
  revalidateCoachPlatformSubscriptionPage(locale)
  return createSuccess({ canceled: true })
}

export async function getCoachPlatformPayInvoiceUrlAction(
  locale: string
): Promise<ApiResult<{ url: string }>> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.cancellation' })
  const stripe = getStripeServer()
  if (!stripe) {
    return createError(t('errors.stripeUnavailable'), 'SERVER_ERROR')
  }

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) return createError(auth.error, 'AUTH_REQUIRED')

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', auth.user.id).single()
  if (profile?.role !== 'coach') {
    return createError(t('errors.forbidden'), 'FORBIDDEN')
  }

  const { data: row } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', auth.user.id)
    .maybeSingle()

  if (!row) {
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const platformRow = row as CoachPlatformSubscription
  if (!isCoachPlatformSubscriptionUnpaid(platformRow)) {
    return createError(t('errors.notUnpaid'), 'VALIDATION_ERROR')
  }

  const customerId = platformRow.stripe_customer_id
  if (!customerId) {
    return createError(t('errors.payUrlUnavailable'), 'NOT_FOUND')
  }

  const url = await fetchCoachPlatformOpenInvoicePayUrl(
    customerId,
    platformRow.stripe_subscription_id
  )
  if (!url) {
    return createError(t('errors.payUrlUnavailable'), 'NOT_FOUND')
  }

  return createSuccess({ url })
}
