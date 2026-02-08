import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { ProfileMenu } from '@/components/ProfileMenu'
import { ProfileForm } from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const current = await getCurrentUserWithProfile()
  const isAthlete = current.profile.role === 'athlete'
  const isCoach = current.profile.role === 'coach'

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
          <ProfileMenu showObjectifsLink={isAthlete} showCoachLink={isAthlete} showDevicesLink={isAthlete} showOffersLink={isCoach} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {isCoach ? (
          <ProfileForm
            email={current.email}
            fullName={current.profile.full_name ?? ''}
            role={current.profile.role}
            avatarUrl={current.profile.avatar_url ? `${current.profile.avatar_url}?t=${current.profile.updated_at}` : ''}
            coachedSports={current.profile.coached_sports ?? []}
            practicedSports={[]}
            languages={current.profile.languages ?? []}
            presentation={current.profile.presentation ?? ''}
            postalCode={current.profile.postal_code ?? ''}
          />
        ) : (
          <>
            <h1 className="text-xl font-semibold text-stone-900">
              Mes informations
            </h1>
            <ProfileForm
              email={current.email}
              fullName={current.profile.full_name ?? ''}
              role={current.profile.role}
              avatarUrl={current.profile.avatar_url ? `${current.profile.avatar_url}?t=${current.profile.updated_at}` : ''}
              coachedSports={[]}
              practicedSports={current.profile.practiced_sports ?? []}
              languages={current.profile.languages ?? []}
              presentation={current.profile.presentation ?? ''}
              postalCode={current.profile.postal_code ?? ''}
            />
          </>
        )}
      </main>
    </div>
  )
}
