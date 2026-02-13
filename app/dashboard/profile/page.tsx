import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { PageHeader } from '@/components/PageHeader'
import { LogoutButton } from '@/components/LogoutButton'
import { ProfileForm } from './ProfileForm'

export const metadata: Metadata = {
  title: "Mon profil"
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const current = await getCurrentUserWithProfile()
  const isAthlete = current.profile.role === 'athlete'
  const isCoach = current.profile.role === 'coach'

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader title="Mon profil" rightContent={<LogoutButton />} />

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
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
        )}
      </div>
    </main>
  )
}
