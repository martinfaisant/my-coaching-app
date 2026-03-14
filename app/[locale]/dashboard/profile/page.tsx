import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { ProfileForm } from './ProfileForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('profileTitle')
  }
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const current = await getCurrentUserWithProfile()
  const isAthlete = current.profile.role === 'athlete'
  const isCoach = current.profile.role === 'coach'

  return (
    <DashboardPageShell>
      {isCoach ? (
        <ProfileForm
          email={current.email}
          firstName={current.profile.first_name ?? ''}
          lastName={current.profile.last_name ?? ''}
          role={current.profile.role}
          avatarUrl={current.profile.avatar_url ? `${current.profile.avatar_url}?t=${current.profile.updated_at}` : ''}
          coachedSports={current.profile.coached_sports ?? []}
          practicedSports={[]}
          languages={current.profile.languages ?? []}
          preferredLocale={current.profile.preferred_locale ?? undefined}
          presentation={current.profile.presentation ?? ''}
          presentationFr={current.profile.presentation_fr ?? ''}
          presentationEn={current.profile.presentation_en ?? ''}
          postalCode={current.profile.postal_code ?? ''}
        />
      ) : (
        <ProfileForm
          email={current.email}
          firstName={current.profile.first_name ?? ''}
          lastName={current.profile.last_name ?? ''}
          role={current.profile.role}
          avatarUrl={current.profile.avatar_url ? `${current.profile.avatar_url}?t=${current.profile.updated_at}` : ''}
          coachedSports={[]}
          practicedSports={current.profile.practiced_sports ?? []}
          languages={current.profile.languages ?? []}
          preferredLocale={current.profile.preferred_locale ?? undefined}
          presentation={current.profile.presentation ?? ''}
          postalCode={current.profile.postal_code ?? ''}
          weeklyTargetHours={current.profile.weekly_target_hours ?? undefined}
          weeklyVolumeBySport={current.profile.weekly_volume_by_sport ?? undefined}
        />
      )}
    </DashboardPageShell>
  )
}
