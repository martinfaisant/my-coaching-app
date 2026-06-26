'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { NotificationPreferenceRow } from '@/components/NotificationPreferenceRow'
import { updateAthleteEmailNotifyCoachingRequestResponse } from '@/app/[locale]/dashboard/notifications/actions'
import { createSuccess, type ApiResult } from '@/lib/errors'

type AthleteNotificationsPreferencesProps = {
  emailNotifyCoachingRequestResponse: boolean
}

export function AthleteNotificationsPreferences({
  emailNotifyCoachingRequestResponse,
}: AthleteNotificationsPreferencesProps) {
  const t = useTranslations('athleteNotifications')

  const savePreference = useCallback(
    async (enabled: boolean, locale: string): Promise<ApiResult<{ enabled: boolean }>> => {
      const result = await updateAthleteEmailNotifyCoachingRequestResponse(enabled, locale)
      if ('error' in result) return result
      return createSuccess({ enabled: result.data.emailNotifyCoachingRequestResponse })
    },
    [],
  )

  return (
    <div className="max-w-xl w-full mx-auto space-y-4">
      <h1 className="hidden md:block text-xl font-bold text-stone-900">{t('pageTitle')}</h1>
      <div className="rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t('sections.emails')}</h2>
        </div>
        <NotificationPreferenceRow
          preferenceId="coaching-request-response"
          title={t('preferences.coachingRequestResponse.title')}
          description={t('preferences.coachingRequestResponse.description')}
          initialEnabled={emailNotifyCoachingRequestResponse}
          feedbackNamespace="athleteNotifications"
          onSave={savePreference}
        />
      </div>
    </div>
  )
}
