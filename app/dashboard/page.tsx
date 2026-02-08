import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { CalendarViewWithNavigation } from '@/components/CalendarViewWithNavigation'
import { ProfileMenu } from '@/components/ProfileMenu'
import { AvatarImage } from '@/components/AvatarImage'
import { FindCoachSection } from '@/app/dashboard/FindCoachSection'
import { RespondToRequestButtons } from '@/app/dashboard/RespondToRequestButtons'
import { PRACTICED_SPORTS_OPTIONS } from '@/app/dashboard/sportsOptions'
import {
  getMyCoachRequests,
  getPendingCoachRequests,
} from '@/app/dashboard/actions'
import type { Profile, Workout, Goal, ImportedActivity } from '@/types/database'

/** Formate une date YYYY-MM-DD en court français (ex. "30 Mars"). */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDate()
  const month = d.toLocaleDateString('fr-FR', { month: 'long' })
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

function getInitials(nameOrEmail: string): string {
  const s = (nameOrEmail || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1]![0]).toUpperCase()
  return s.slice(0, 2).toUpperCase()
}

const ROLE_LABELS: Record<Profile['role'], string> = {
  athlete: 'Athlète',
  coach: 'Coach',
  admin: 'Administrateur',
}

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default async function DashboardPage() {
  const current = await getCurrentUserWithProfile()
  const supabase = await createClient()

  // Athlète sans coach : proposer de trouver un coach (requêtes en parallèle)
  if (current.profile.role === 'athlete' && !current.profile.coach_id) {
    const [coachesResult, myRequests, ratingStats] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, email, full_name, coached_sports, languages, presentation, avatar_url')
        .eq('role', 'coach')
        .order('email'),
      getMyCoachRequests(),
      supabase.rpc('get_coach_rating_stats'),
    ])
    const coaches = coachesResult.data

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

    const coachesForList = (coaches ?? [])
      .filter((c) => {
        const hasName = (c.full_name ?? '').trim() !== ''
        const hasSports = (c.coached_sports ?? []).length > 0
        const hasLanguages = (c.languages ?? []).length > 0
        const hasPresentation = (c.presentation ?? '').trim() !== ''
        return hasName && hasSports && hasLanguages && hasPresentation
      })
      .map((c) => ({
        user_id: c.user_id,
        email: c.email,
        full_name: c.full_name,
        coached_sports: c.coached_sports ?? null,
        languages: c.languages ?? null,
        presentation: c.presentation ?? null,
        avatar_url: c.avatar_url ?? null,
      }))

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-stone-900">
              Tableau de bord
            </h1>
            <ProfileMenu showObjectifsLink showDevicesLink />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">
          {(coachesForList.length === 0) ? (
            <p className="text-sm text-stone-600">
              Aucun coach inscrit pour le moment. Revenez plus tard.
            </p>
          ) : (
            <FindCoachSection coaches={coachesForList} statusByCoach={statusByCoach} requestIdByCoach={requestIdByCoach} initialPracticedSports={current.profile.practiced_sports ?? []} ratingsByCoach={ratingsByCoach} />
          )}
        </main>
      </div>
    )
  }

  // Athlète avec coach : calendrier d'entraînement (workouts, activités, goals en parallèle)
  if (current.profile.role === 'athlete') {
    const today = new Date()
    const currentMonday = getWeekMonday(today)
    const startMonday = new Date(currentMonday)
    startMonday.setDate(startMonday.getDate() - 7)
    const endSunday = new Date(currentMonday)
    endSunday.setDate(endSunday.getDate() + 7 + 6)
    const startStr = startMonday.toISOString().slice(0, 10)
    const endStr = endSunday.toISOString().slice(0, 10)

    const [workoutsResult, importedActivitiesResult, goalsResult] = await Promise.all([
      supabase
        .from('workouts')
        .select('*')
        .eq('athlete_id', current.id)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date')
        .order('created_at'),
      supabase
        .from('imported_activities')
        .select('*')
        .eq('athlete_id', current.id)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date')
        .order('created_at'),
      supabase
        .from('goals')
        .select('*')
        .eq('athlete_id', current.id)
        .order('date', { ascending: true }),
    ])
    const workouts = workoutsResult.data
    const importedActivities = importedActivitiesResult.data
    const goals = goalsResult.data

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-stone-900text-white">
              Mon calendrier d&apos;entraînement
            </h1>
            <ProfileMenu showObjectifsLink showCoachLink showDevicesLink />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pt-4 pb-8">
          <CalendarViewWithNavigation
            athleteId={current.id}
            athleteEmail={current.email}
            initialWorkouts={(workouts ?? []) as Workout[]}
            initialImportedActivities={(importedActivities ?? []) as ImportedActivity[]}
            goals={(goals ?? []) as Goal[]}
            canEdit={false}
            pathToRevalidate="/dashboard"
          />
        </main>
      </div>
    )
  }

  // Coach / Admin : tableau de bord avec liste des membres
  let visibleProfiles: Profile[] = []
  let pendingRequests: Awaited<ReturnType<typeof getPendingCoachRequests>> = []
  let coachAthleteIds: string[] = []

  const isCoachProfileComplete =
    current.profile.role === 'coach' &&
    (current.profile.full_name ?? '').trim() !== '' &&
    (current.profile.coached_sports ?? []).length > 0 &&
    (current.profile.languages ?? []).length > 0 &&
    ((current.profile.presentation ?? '').trim() !== '')

  if (current.profile.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    visibleProfiles = (data ?? []) as Profile[]
  } else if (current.profile.role === 'coach') {
    const [pendingResult, athletesResult] = await Promise.all([
      getPendingCoachRequests(),
      supabase
        .from('profiles')
        .select('user_id, email, full_name, role, coach_id, created_at, updated_at, practiced_sports, avatar_url')
        .eq('coach_id', current.id)
        .order('email'),
    ])
    pendingRequests = pendingResult
    visibleProfiles = (athletesResult.data ?? []) as Profile[]
    coachAthleteIds = visibleProfiles.map((p) => p.user_id)
  } else {
    visibleProfiles = [current.profile as Profile]
  }

  // Coach : chargement workouts + goals en parallèle pour "Planifié jusqu'au" et "Prochain objectif"
  type CoachAthleteData = {
    plannedUntil: string | null
    nextGoal: { date: string; race_name: string } | null
    isUpToDate: boolean
  }
  let coachAthleteData: Record<string, CoachAthleteData> = {}
  if (current.profile.role === 'coach' && coachAthleteIds.length > 0) {
    const [workoutsResult, goalsResult] = await Promise.all([
      supabase
        .from('workouts')
        .select('athlete_id, date')
        .in('athlete_id', coachAthleteIds),
      supabase
        .from('goals')
        .select('athlete_id, date, race_name, is_primary')
        .in('athlete_id', coachAthleteIds)
        .order('date', { ascending: true }),
    ])
    const workoutsRows = workoutsResult.data
    const goalsRows = goalsResult.data

    const now = new Date()
    const todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0')
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const tomorrowStr =
      tomorrow.getFullYear() +
      '-' +
      String(tomorrow.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(tomorrow.getDate()).padStart(2, '0')

    const plannedUntilByAthlete: Record<string, string> = {}
    for (const w of workoutsRows ?? []) {
      const cur = plannedUntilByAthlete[w.athlete_id]
      if (!cur || w.date > cur) plannedUntilByAthlete[w.athlete_id] = w.date
    }
    const nextGoalByAthlete: Record<string, { date: string; race_name: string }> = {}
    for (const g of goalsRows ?? []) {
      if (g.date < todayStr) continue
      if (!nextGoalByAthlete[g.athlete_id]) {
        nextGoalByAthlete[g.athlete_id] = { date: g.date, race_name: g.race_name }
      }
    }

    for (const id of coachAthleteIds) {
      const plannedUntil = plannedUntilByAthlete[id] ?? null
      coachAthleteData[id] = {
        plannedUntil,
        nextGoal: nextGoalByAthlete[id] ?? null,
        isUpToDate: plannedUntil ? plannedUntil > tomorrowStr : false,
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-stone-900text-white">
            Tableau de bord
          </h1>
          <ProfileMenu showOffersLink={current.profile.role === 'coach'} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {current.profile.role === 'admin' && (
          <div className="mb-8">
            <Link
              href="/admin/members"
              className="inline-flex items-center rounded-lg bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors"
            >
              Gérer les membres et les rôles
            </Link>
          </div>
        )}

        {current.profile.role === 'coach' && !isCoachProfileComplete && (
          <div className="rounded-xl border border-palette-olive/40 bg-section p-6 mb-8">
            <p className="text-stone-800 font-medium mb-1">
              Faites-vous connaître auprès des athlètes
            </p>
            <p className="text-sm text-stone-600 mb-4">
              Complétez votre profil pour apparaître dans leurs recherches et recevoir vos premières demandes de coaching.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center rounded-lg bg-palette-forest-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2"
            >
              Compléter mon profil
            </Link>
          </div>
        )}

        {current.profile.role === 'coach' && pendingRequests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-stone-900 mb-2">
              Demandes en attente
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Acceptez ou refusez les demandes d&apos;athlètes qui souhaitent vous avoir comme coach.
            </p>
            <ul className="space-y-3">
              {pendingRequests.map((req) => {
                const name = req.athlete_name || req.athlete_email || '—'
                const sportValues = (req.sport_practiced || '')
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
                return (
                  <li
                    key={req.id}
                    className="rounded-xl border border-stone-200 border-l-4 border-l-amber-400 bg-section overflow-hidden flex flex-wrap items-center justify-between gap-4 p-4"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      <AvatarImage
                        src={req.athlete_avatar_url}
                        initials={getInitials(name)}
                        className="w-12 h-12 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{name}</p>
                        {req.athlete_email && name !== req.athlete_email && (
                          <p className="text-sm text-stone-600 mt-0.5">{req.athlete_email}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sportValues.map((v) => {
                            const opt = PRACTICED_SPORTS_OPTIONS.find((o) => o.value === v)
                            return (
                              <span
                                key={v}
                                className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
                              >
                                {opt ? `${opt.emoji} ${opt.label}` : v}
                              </span>
                            )
                          })}
                        </div>
                        <p className="text-sm text-stone-600 mt-2 italic">&quot;{req.coaching_need}&quot;</p>
                      </div>
                    </div>
                    <RespondToRequestButtons requestId={req.id} />
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-4">
            {current.profile.role === 'admin'
              ? 'Tous les membres'
              : current.profile.role === 'coach'
                ? `Mes athlètes (${visibleProfiles.length})`
                : 'Mon profil'}
          </h2>

          {current.profile.role === 'coach' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleProfiles.map((p) => {
                const displayName = (p.full_name?.trim() || p.email) as string
                const athleteHref = `/dashboard/athletes/${p.user_id}`
                const data = coachAthleteData[p.user_id]
                const plannedUntil = data?.plannedUntil ?? null
                const nextGoal = data?.nextGoal ?? null
                const isUpToDate = data?.isUpToDate ?? false
                const practicedSports = p.practiced_sports ?? []

                return (
                  <article
                    key={p.user_id}
                    className="group rounded-xl border border-stone-200 bg-section overflow-hidden flex flex-col"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <AvatarImage
                          src={p.avatar_url ? `${p.avatar_url}?t=${p.updated_at}` : null}
                          initials={getInitials(displayName)}
                          className="w-12 h-12 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">{displayName}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {practicedSports.map((v) => {
                              const opt = PRACTICED_SPORTS_OPTIONS.find((o) => o.value === v)
                              return (
                                <span
                                  key={v}
                                  className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700"
                                >
                                  {opt ? `${opt.emoji} ${opt.label}` : v}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-stone-500 font-medium">Prochain objectif</p>
                          <p className="text-stone-900 mt-0.5">
                            {nextGoal
                              ? `${formatShortDate(nextGoal.date)} · ${nextGoal.race_name}`
                              : 'Aucun'}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-500 font-medium">Planifié jusqu&apos;au</p>
                          <p className="text-stone-900 font-semibold mt-0.5 text-sm">
                            {plannedUntil ? formatShortDate(plannedUntil) : '—'}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isUpToDate ? 'bg-emerald-500' : 'bg-red-400'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-medium ${
                                isUpToDate ? 'text-stone-500' : 'text-red-400'
                              }`}
                            >
                              {isUpToDate ? 'À jour' : 'En retard'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto border-t border-stone-100 p-3 bg-stone-50 flex justify-end">
                      <Link
                        href={athleteHref}
                        className="text-xs font-medium text-[#627e59] hover:text-[#506648] flex items-center transition-transform group-hover:translate-x-1"
                      >
                        Voir le planning
                        <svg className="w-4 h-4 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {visibleProfiles.map((p) => {
                const displayName = (p.full_name?.trim() || p.email) as string
                const isAthleteOfMine = current.profile.role === 'coach' && p.coach_id === current.id
                const athleteHref = `/dashboard/athletes/${p.user_id}`

                if (isAthleteOfMine) {
                  return (
                    <li key={p.user_id}>
                      <Link
                        href={athleteHref}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-section p-4 hover:bg-stone-50 hover:border-stone-300 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-stone-900">{displayName}</p>
                          <p className="text-sm text-stone-600 mt-0.5">
                            {ROLE_LABELS[p.role]}
                            {p.coach_id && ' (athlète)'}
                          </p>
                        </div>
                        <svg
                          className="h-5 w-5 text-stone-400 group-hover:text-stone-600 flex-shrink-0 transition-colors"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  )
                }

                return (
                  <li
                    key={p.user_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-section p-4"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{p.email}</p>
                      <p className="text-sm text-stone-600 mt-0.5">
                        {ROLE_LABELS[p.role]}
                        {p.coach_id && ' (athlète)'}
                      </p>
                    </div>
                    {p.user_id === current.id && (
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                        Vous
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
