import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { CoachNotificationsPreferences } from './CoachNotificationsPreferences'
import { AthleteNotificationsPreferences } from './AthleteNotificationsPreferences'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('notificationsTitle') }
}

export const dynamic = 'force-dynamic'

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()
  const { role } = current.profile

  if (role !== 'coach' && role !== 'athlete') {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  return (
    <DashboardPageShell>
      {role === 'coach' ? (
        <CoachNotificationsPreferences
          emailNotifyCoachingRequest={current.profile.email_notify_coaching_request !== false}
        />
      ) : (
        <AthleteNotificationsPreferences
          emailNotifyCoachingRequestResponse={
            current.profile.email_notify_coaching_request_response !== false
          }
        />
      )}
    </DashboardPageShell>
  )
}
