import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { StravaDevicesSection } from './StravaDevicesSection'
import { getStravaConnection } from './actions'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('devicesTitle')
  }
}

export default async function DevicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'devices' })
  const current = await getCurrentUserWithProfile()
  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const result = await getStravaConnection(current.id)
  const connected = result.connected && !!result.connection
  const connection = result.connection ?? null

  return (
    <DashboardPageShell>
      <StravaDevicesSection
        userId={current.id}
        connected={connected}
        connection={connection}
      />
    </DashboardPageShell>
  )
}
