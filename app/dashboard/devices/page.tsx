import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { PageHeader } from '@/components/PageHeader'
import { StravaDevicesSection } from './StravaDevicesSection'
import { getStravaConnection } from './actions'

export default async function DevicesPage() {
  const current = await getCurrentUserWithProfile()
  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const result = await getStravaConnection(current.id)
  const connected = result.connected && !!result.connection
  const connection = result.connection ?? null

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader title="Mes appareils connectés" />

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        <StravaDevicesSection
          userId={current.id}
          connected={connected}
          connection={connection}
        />
      </div>
    </main>
  )
}
