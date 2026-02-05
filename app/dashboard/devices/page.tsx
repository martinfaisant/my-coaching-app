import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { ProfileMenu } from '@/components/ProfileMenu'
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            ← Tableau de bord
          </Link>
          <ProfileMenu showObjectifsLink showCoachLink showDevicesLink />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900">
          Mes appareils connectés
        </h1>
        <p className="mt-1 text-sm text-stone-500 mb-8">
          Connectez vos applications et montres pour importer vos activités sportives dans votre calendrier.
        </p>
        <StravaDevicesSection
          userId={current.id}
          connected={connected}
          connection={connection}
        />
      </main>
    </div>
  )
}
