import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { AvatarImage } from '@/components/AvatarImage'
import { getMyCoachRating } from './actions'
import { CoachRatingForm } from './CoachRatingForm'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'
import { getInitials } from '@/lib/stringUtils'

export const metadata: Metadata = {
  title: "Mon coach"
}

function languageLabel(value: string): string {
  return LANGUAGES_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function getInitialsForCoach(fullName: string | null, email: string): string {
  const name = (fullName ?? '').trim()
  if (name) return getInitials(name)
  return getInitials(email)
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
      <DashboardPageShell title="Mon Coach">
        <p className="mt-1 text-sm text-stone-600">Coach introuvable.</p>
      </DashboardPageShell>
    )
  }

  const myRating = await getMyCoachRating(current.profile.coach_id!)

  return (
    <DashboardPageShell title="Mon Coach">
        {/* Carte principale avec bannière et avatar */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          {/* BANNIÈRE BRANDÉE : Dégradé Forest Dark -> Olive */}
          <div className="h-[136px] bg-gradient-palette relative">
            {/* Avatar positionné sur la bannière */}
            <div className="absolute -bottom-10 left-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-stone-100 border-4 border-white shadow-md flex items-center justify-center text-stone-300 overflow-hidden">
                  <AvatarImage
                    src={coach.avatar_url}
                    initials={getInitialsForCoach(coach.full_name, coach.email)}
                    alt="Photo du coach"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="pt-16 pb-4 px-8">
            {/* Header section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-stone-900">
                {(coach.full_name ?? '').trim() || coach.email}
              </h1>
            </div>

            {/* Section Sports coachés et Langues sur la même ligne */}
            {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Section Sports coachés */}
                  {(coach.coached_sports ?? []).length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Sports coachés</h2>
                      <div className="flex flex-wrap gap-3">
                        {(coach.coached_sports ?? []).map((sportValue: string) => {
                          const sportKey = sportValue in SPORT_ICONS ? (sportValue as SportType) : 'course'
                          const Icon = SPORT_ICONS[sportKey]
                          const label = SPORT_LABELS[sportKey] ?? sportValue
                          return (
                            <div
                              key={sportValue}
                              className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium select-none flex items-center gap-2"
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              <span>{label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section Langues */}
                  {(coach.languages ?? []).length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Langues parlées</h2>
                      <div className="flex flex-wrap gap-2">
                        {(coach.languages ?? []).map((langCode: string) => {
                          const opt = LANGUAGES_OPTIONS.find(o => o.value === langCode)
                          return (
                            <div
                              key={langCode}
                              className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium select-none"
                            >
                              {opt?.label ?? languageLabel(langCode)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
              <hr className="border-stone-100 my-4" />
            )}

            {/* Présentation */}
            {(coach.presentation ?? '').trim() && (
              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">Présentation</h2>
                </div>
                <div className="relative">
                  <p className="w-full border border-stone-200 rounded-xl p-4 text-stone-700 leading-relaxed text-sm bg-stone-50 whitespace-pre-wrap">
                    {coach.presentation!.trim()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Avis */}
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          <div className="px-8 py-6">
            <CoachRatingForm
              coachId={current.profile.coach_id!}
              initialRating={myRating?.rating ?? null}
              initialComment={myRating?.comment ?? ''}
            />
          </div>
        </div>
      </DashboardPageShell>
  )
}
