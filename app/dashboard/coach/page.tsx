import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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

export default async function MonCoachPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete' || !current.profile.coach_id) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: coach } = await supabase
    .from('profiles')
    .select('full_name, coached_sports, languages, presentation')
    .eq('user_id', current.profile.coach_id)
    .single()

  if (!coach) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              ← Tableau de bord
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-sm text-stone-600">Coach introuvable.</p>
        </main>
      </div>
    )
  }

  const sports = (coach.coached_sports ?? []).map(sportLabel)
  const languages = (coach.languages ?? []).map(languageLabel)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            ← Tableau de bord
          </Link>
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
          <div>
            <h2 className="text-sm font-medium text-stone-500 mb-1">Nom</h2>
            <p className="text-stone-900">
              {(coach.full_name ?? '').trim() || '—'}
            </p>
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
      </main>
    </div>
  )
}
