import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('dashboardTitle'),
    description: t('dashboardDescription')
  }
}

/** Page d'entrée dashboard : redirections uniquement vers la page par défaut selon le rôle. */
export default async function DashboardPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role === 'athlete' && current.profile.coach_id) {
    redirect('/dashboard/calendar')
  }

  if (current.profile.role === 'athlete' && !current.profile.coach_id) {
    redirect('/dashboard/find-coach')
  }

  if (current.profile.role === 'coach') {
    redirect('/dashboard/athletes')
  }

  if (current.profile.role === 'admin') {
    redirect('/dashboard/admin/members')
  }

  redirect('/dashboard/calendar')
}
