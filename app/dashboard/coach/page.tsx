import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileMenu } from '@/components/ProfileMenu'
import { AvatarImage } from '@/components/AvatarImage'
import { getMyCoachRating } from './actions'
import { CoachRatingForm } from './CoachRatingForm'

const COACHED_SPORTS_LABELS: Record<string, string> = {
  course_route: 'Course à pied sur route',
  trail: 'Trail',
  triathlon: 'Triathlon',
  velo: 'Vélo',
}

const LANGUAGES_LABELS: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  zh: '中文',
}

function sportLabel(value: string): string {
  return COACHED_SPORTS_LABELS[value] ?? value
}

function languageLabel(value: string): string {
  return LANGUAGES_LABELS[value] ?? value
}

function getInitials(fullName: string | null, email: string): string {
  const name = (fullName ?? '').trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email.length >= 2) return email.slice(0, 2).toUpperCase()
  return '?'
}

export default async function MonCoachPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete' || !current.profile.coach_id) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: coach } = await supabase
    .from('profiles')
    .select('full_name, email, coached_sports, languages, presentation, avatar_url')
    .eq('user_id', current.profile.coach_id)
    .single()

  if (!coach) {
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
            Mon coach
          </h1>
          <p className="mt-1 text-sm text-stone-600">Coach introuvable.</p>
        </main>
      </div>
    )
  }

  const sports = (coach.coached_sports ?? []).map(sportLabel)
  const languages = (coach.languages ?? []).map(languageLabel)
  const myRating = await getMyCoachRating(current.profile.coach_id!)

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
          Mon coach
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Les informations de votre coach.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-stone-500 mb-1">Nom</h2>
              <p className="text-stone-900">
                {(coach.full_name ?? '').trim() || '—'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <AvatarImage
                src={coach.avatar_url}
                initials={getInitials(coach.full_name, coach.email)}
                alt="Photo du coach"
                className="w-16 h-16"
              />
            </div>
          </div>

          {sports.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 mb-1">Sports coachés</h2>
              <p className="text-stone-900">
                {sports.join(', ')}
              </p>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 mb-1">Langues</h2>
              <p className="text-stone-900">
                {languages.join(', ')}
              </p>
            </div>
          )}

          {(coach.presentation ?? '').trim() && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 mb-1">Présentation</h2>
              <p className="text-stone-700 whitespace-pre-wrap">
                {coach.presentation!.trim()}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
          <h2 className="text-base font-semibold text-stone-900 mb-6">Donner votre avis</h2>
          <CoachRatingForm
            coachId={current.profile.coach_id!}
            initialRating={myRating?.rating ?? null}
            initialComment={myRating?.comment ?? ''}
          />
        </div>
      </main>
    </div>
  )
}
