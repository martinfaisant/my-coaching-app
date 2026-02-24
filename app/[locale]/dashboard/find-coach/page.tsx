import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { FindCoachSection } from '@/app/[locale]/dashboard/FindCoachSection'
import { getMyCoachRequests } from '@/app/[locale]/dashboard/actions'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'findCoach' })
  return {
    title: t('pageTitle')
  }
}

export default async function FindCoachPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete' || current.profile.coach_id) {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  const supabase = await createClient()

  const [coachesResult, myRequests, ratingStats, offersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, coached_sports, languages, presentation_fr, presentation_en, avatar_url')
      .eq('role', 'coach')
      .order('email'),
    getMyCoachRequests(),
    supabase.rpc('get_coach_rating_stats'),
    supabase
      .from('coach_offers')
      .select('id, coach_id, title, description, title_fr, title_en, description_fr, description_en, price, price_type, is_featured, display_order')
      .eq('status', 'published')
      .order('display_order')
      .range(0, 999),
  ])
  const coaches = coachesResult.data
  const allOffers = offersResult.data ?? []

  const statusByCoach: Record<string, 'pending' | 'declined'> = {}
  const requestIdByCoach: Record<string, string> = {}
  for (const r of myRequests) {
    if (statusByCoach[r.coach_id] === undefined) statusByCoach[r.coach_id] = r.status as 'pending' | 'declined'
    if (r.status === 'pending') requestIdByCoach[r.coach_id] = r.id
  }

  const ratingsByCoach: Record<string, { averageRating: number; reviewCount: number }> = {}
  for (const row of ratingStats.data ?? []) {
    ratingsByCoach[row.coach_id] = {
      averageRating: Number(row.avg_rating),
      reviewCount: Number(row.review_count ?? 0),
    }
  }

  const offersByCoach: Record<string, Array<{ id: string; title: string; description: string | null; title_fr?: string | null; title_en?: string | null; description_fr?: string | null; description_en?: string | null; price: number; price_type: string; is_featured: boolean; display_order: number }>> = {}
  for (const offer of allOffers) {
    if (!offersByCoach[offer.coach_id]) {
      offersByCoach[offer.coach_id] = []
    }
    offersByCoach[offer.coach_id].push({
      id: offer.id,
      title: offer.title,
      description: offer.description ?? null,
      title_fr: offer.title_fr ?? null,
      title_en: offer.title_en ?? null,
      description_fr: offer.description_fr ?? null,
      description_en: offer.description_en ?? null,
      price: offer.price,
      price_type: offer.price_type,
      is_featured: offer.is_featured,
      display_order: offer.display_order,
    })
  }

  const coachesForList = (coaches ?? [])
    .filter((c) => {
      const first = (c.first_name ?? '').trim()
      const last = (c.last_name ?? '').trim()
      const hasName = [first, last].filter(Boolean).join(' ').trim() !== ''
      const hasSports = (c.coached_sports ?? []).length > 0
      const hasLanguages = (c.languages ?? []).length > 0
      const hasPresentation =
        ((c.presentation_fr ?? '').trim() !== '' || (c.presentation_en ?? '').trim() !== '')
      return hasName && hasSports && hasLanguages && hasPresentation
    })
    .map((c) => ({
      user_id: c.user_id,
      email: c.email,
      first_name: c.first_name ?? null,
      last_name: c.last_name ?? null,
      coached_sports: c.coached_sports ?? null,
      languages: c.languages ?? null,
      presentation_fr: c.presentation_fr ?? null,
      presentation_en: c.presentation_en ?? null,
      avatar_url: c.avatar_url ?? null,
    }))

  const tFindCoach = await getTranslations({ locale, namespace: 'findCoach' })

  return (
    <DashboardPageShell title={tFindCoach('pageTitle')}>
      {(coachesForList.length === 0) ? (
        <p className="text-sm text-stone-600">
          {tFindCoach('noCoaches')}
        </p>
      ) : (
        <FindCoachSection
          coaches={coachesForList}
          statusByCoach={statusByCoach}
          requestIdByCoach={requestIdByCoach}
          initialPracticedSports={current.profile.practiced_sports ?? []}
          ratingsByCoach={ratingsByCoach}
          offersByCoach={offersByCoach}
          athleteFirstName={current.profile.first_name ?? ''}
          athleteLastName={current.profile.last_name ?? ''}
        />
      )}
    </DashboardPageShell>
  )
}
