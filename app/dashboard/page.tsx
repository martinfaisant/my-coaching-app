import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { CalendarViewWithNavigation } from '@/components/CalendarViewWithNavigation'
import { ProfileMenu } from '@/components/ProfileMenu'
import { RequestCoachButton } from '@/app/dashboard/RequestCoachButton'
import { RespondToRequestButtons } from '@/app/dashboard/RespondToRequestButtons'
import {
  getMyCoachRequests,
  getPendingCoachRequests,
} from '@/app/dashboard/actions'
import type { Profile, Workout, Goal } from '@/types/database'

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

  // Athlète sans coach : proposer de trouver un coach
  if (current.profile.role === 'athlete' && !current.profile.coach_id) {
    const { data: coaches } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .eq('role', 'coach')
      .order('email')

    const myRequests = await getMyCoachRequests()
    const statusByCoach = new Map<string, 'pending' | 'declined'>()
    for (const r of myRequests) {
      if (!statusByCoach.has(r.coach_id)) statusByCoach.set(r.coach_id, r.status as 'pending' | 'declined')
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-stone-900text-white">
              Tableau de bord
            </h1>
            <ProfileMenu showObjectifsLink />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-xl border border-stone-100 border-stone-200 bg-white p-6 mb-8">
            <h2 className="text-xl font-semibold text-stone-900text-white mb-2">
              Trouver un coach
            </h2>
            <p className="text-sm text-stone-600 text-stone-600">
              Envoyez une demande à un coach en renseignant votre sport et votre besoin. Le coach pourra accepter ou refuser votre demande.
            </p>
          </div>

          <section>
            <h3 className="text-base font-semibold text-stone-900text-white mb-4">
              Liste des coachs
            </h3>
            {(coaches?.length ?? 0) === 0 ? (
              <p className="text-sm text-stone-600">
                Aucun coach inscrit pour le moment. Revenez plus tard.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {(coaches ?? []).map((c) => (
                  <li
                    key={c.user_id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-100 border-stone-200 bg-white p-4 hover:border-stone-300 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-stone-900text-white">
                        {c.full_name?.trim() || c.email}
                      </p>
                      {c.full_name?.trim() && (
                        <p className="text-sm text-stone-600 mt-0.5">
                          {c.email}
                        </p>
                      )}
                    </div>
                    <RequestCoachButton
                      coachId={c.user_id}
                      coachName={c.full_name?.trim() || c.email}
                      requestStatus={statusByCoach.get(c.user_id) ?? null}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    )
  }

  // Athlète avec coach : calendrier d'entraînement
  if (current.profile.role === 'athlete') {
    const today = new Date()
    const currentMonday = getWeekMonday(today)
    const startMonday = new Date(currentMonday)
    startMonday.setDate(startMonday.getDate() - 7)
    const endSunday = new Date(currentMonday)
    endSunday.setDate(endSunday.getDate() + 7 + 6)
    const startStr = startMonday.toISOString().slice(0, 10)
    const endStr = endSunday.toISOString().slice(0, 10)

    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', current.id)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date')
      .order('created_at')

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('athlete_id', current.id)
      .order('date', { ascending: true })

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-stone-900text-white">
              Mon calendrier d&apos;entraînement
            </h1>
            <ProfileMenu showObjectifsLink />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pt-4 pb-8">
          <CalendarViewWithNavigation
            athleteId={current.id}
            athleteEmail={current.email}
            initialWorkouts={(workouts ?? []) as Workout[]}
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

  if (current.profile.role === 'coach') {
    pendingRequests = await getPendingCoachRequests()
  }

  if (current.profile.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    visibleProfiles = (data ?? []) as Profile[]
  } else if (current.profile.role === 'coach') {
    const { data: athletes } = await supabase
      .from('profiles')
      .select('*')
      .eq('coach_id', current.id)
      .order('email')
    visibleProfiles = (athletes ?? []) as Profile[]
  } else {
    visibleProfiles = [current.profile as Profile]
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-stone-900text-white">
            Tableau de bord
          </h1>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-stone-100 border-stone-200 bg-white p-6 mb-8">
          <p className="text-sm text-stone-600 text-stone-600">
            Bienvenue <strong className="text-stone-900text-white font-medium">{current.email}</strong>
            {' '}({ROLE_LABELS[current.profile.role]}).
          </p>

          {current.profile.role === 'admin' && (
            <Link
              href="/admin/members"
              className="mt-4 inline-flex items-center rounded-lg bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors"
            >
              Gérer les membres et les rôles
            </Link>
          )}
        </div>

        {current.profile.role === 'coach' && pendingRequests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-stone-900text-white mb-2">
              Demandes en attente
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Acceptez ou refusez les demandes d&apos;athlètes qui souhaitent vous avoir comme coach.
            </p>
            <ul className="space-y-2.5">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="rounded-lg border border-stone-100 border-stone-200 bg-white p-4 flex flex-wrap items-start justify-between gap-4 hover:border-stone-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900text-white">
                      {req.athlete_name || req.athlete_email || '—'}
                    </p>
                    {req.athlete_email && req.athlete_name !== req.athlete_email && req.athlete_name !== '—' && (
                      <p className="text-sm text-stone-600 mt-0.5">
                        {req.athlete_email}
                      </p>
                    )}
                    <p className="text-sm text-stone-600text-stone-300 mt-2">
                      <span className="font-medium">Sport :</span> {req.sport_practiced}
                    </p>
                    <p className="text-sm text-stone-600text-stone-300 mt-1">
                      <span className="font-medium">Besoin :</span> {req.coaching_need}
                    </p>
                  </div>
                  <RespondToRequestButtons requestId={req.id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-stone-900text-white mb-4">
            {current.profile.role === 'admin'
              ? 'Tous les membres'
              : current.profile.role === 'coach'
                ? 'Mes athlètes'
                : 'Mon profil'}
          </h2>
          <ul className="space-y-2.5">
            {visibleProfiles.map((p) => {
              const isAthleteOfMine = current.profile.role === 'coach' && p.coach_id === current.id
              const displayName = (p.full_name?.trim() || p.email) as string
              const athleteHref = `/dashboard/athletes/${p.user_id}`

              if (isAthleteOfMine) {
                return (
                  <li key={p.user_id}>
                    <Link
                      href={athleteHref}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 border-stone-200 bg-white p-4 hover:bg-stone-50hover:bg-stone-900 hover:border-stone-300 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-stone-900text-white">
                          {displayName}
                        </p>
                        <p className="text-sm text-stone-600 mt-0.5">
                          {ROLE_LABELS[p.role]}
                          {p.coach_id && ' (athlète)'}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-stone-400 group-hover:text-stone-600group-hover:text-stone-300 flex-shrink-0 transition-colors"
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
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 border-stone-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-stone-900text-white">{p.email}</p>
                    <p className="text-sm text-stone-600 mt-0.5">
                      {ROLE_LABELS[p.role]}
                      {p.coach_id && ' (athlète)'}
                    </p>
                  </div>
                  {p.user_id === current.id && (
                    <span className="rounded-full bg-stone-100bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-600 text-stone-600">
                      Vous
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </div>
  )
}
