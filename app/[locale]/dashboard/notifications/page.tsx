import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { CoachNotificationsPreferences } from './CoachNotificationsPreferences'

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

export default async function CoachNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  const emailNotifyCoachingRequest = current.profile.email_notify_coaching_request !== false

  return (
    <DashboardPageShell>
      <CoachNotificationsPreferences emailNotifyCoachingRequest={emailNotifyCoachingRequest} />
    </DashboardPageShell>
  )
}
