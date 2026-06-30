import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { parseWorkoutPrimaryMetricBySport } from '@/lib/workoutPrimaryMetric'
import { CoachCoachingSettingsForm } from './CoachCoachingSettingsForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('coachingSettingsTitle') }
}

export const dynamic = 'force-dynamic'

export default async function CoachingSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  const initialMetrics = parseWorkoutPrimaryMetricBySport(
    current.profile.workout_primary_metric_by_sport
  )

  return (
    <DashboardPageShell>
      <CoachCoachingSettingsForm initialMetrics={initialMetrics} />
    </DashboardPageShell>
  )
}
