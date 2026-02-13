import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { StravaDevicesSection } from './StravaDevicesSection'
import { getStravaConnection } from './actions'

export const metadata: Metadata = {
  title: "Appareils connectés"
}

export default async function DevicesPage() {
  const current = await getCurrentUserWithProfile()
  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const result = await getStravaConnection(current.id)
  const connected = result.connected && !!result.connection
  const connection = result.connection ?? null

  return (
    <DashboardPageShell title="Mes appareils connectés">
      <StravaDevicesSection
        userId={current.id}
        connected={connected}
        connection={connection}
      />
    </DashboardPageShell>
  )
}
