'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { requireRole } from '@/lib/authHelpers'
import { createError, createSuccess, type ApiResult } from '@/lib/errors'
import { logger } from '@/lib/logger'

export type CoachNotificationPreference = {
  emailNotifyCoachingRequest: boolean
}

export async function updateCoachEmailNotifyCoachingRequest(
  enabled: boolean,
  locale: string,
): Promise<ApiResult<CoachNotificationPreference>> {
  const t = await getTranslations({ locale, namespace: 'coachNotifications' })
  const supabase = await createClient()
  const result = await requireRole(supabase, 'coach')
  if ('error' in result) {
    return createError(t('errors.notAuthenticated'), 'AUTH_REQUIRED')
  }

  const { user } = result

  const { error } = await supabase
    .from('profiles')
    .update({ email_notify_coaching_request: enabled })
    .eq('user_id', user.id)

  if (error) {
    logger.error('updateCoachEmailNotifyCoachingRequest failed', error, { userId: user.id })
    return createError(t('errors.saveFailed'), 'SERVER_ERROR')
  }

  revalidatePath('/dashboard/notifications')
  return createSuccess({ emailNotifyCoachingRequest: enabled })
}
