'use client'

import { useTranslations } from 'next-intl'
import { NotificationPreferenceRow } from '@/components/NotificationPreferenceRow'

type CoachNotificationsPreferencesProps = {
  emailNotifyCoachingRequest: boolean
}

export function CoachNotificationsPreferences({
  emailNotifyCoachingRequest,
}: CoachNotificationsPreferencesProps) {
  const t = useTranslations('coachNotifications')

  return (
    <div className="max-w-xl w-full mx-auto space-y-4">
      <h1 className="hidden md:block text-xl font-bold text-stone-900">{t('pageTitle')}</h1>
      <div className="rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t('sections.emails')}</h2>
        </div>
        <NotificationPreferenceRow
          preferenceId="coaching-request"
          title={t('preferences.coachingRequest.title')}
          description={t('preferences.coachingRequest.description')}
          initialEnabled={emailNotifyCoachingRequest}
        />
      </div>
    </div>
  )
}
