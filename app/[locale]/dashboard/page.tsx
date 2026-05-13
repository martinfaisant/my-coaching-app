import type { Metadata } from 'next'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
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
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()
  redirect(pathWithLocale(locale, getDashboardEntryPath(current.profile)))
}
