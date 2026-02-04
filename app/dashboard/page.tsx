import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { CalendarView } from '@/components/CalendarView'
import { ProfileMenu } from '@/components/ProfileMenu'
import { RequestCoachButton } from '@/app/dashboard/RequestCoachButton'
import { RespondToRequestButtons } from '@/app/dashboard/RespondToRequestButtons'
import {
  getMyCoachRequests,
  getPendingCoachRequests,
} from '@/app/dashboard/actions'
import type { Profile, Workout } from '@/types/database'

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tableau de bord
            </h1>
            <ProfileMenu showObjectifsLink />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Trouver un coach
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Envoyez une demande à un coach en renseignant votre sport et votre besoin. Le coach pourra accepter ou refuser votre demande.
            </p>
          </div>

          <section className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Liste des coachs
            </h3>
            {(coaches?.length ?? 0) === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                Aucun coach inscrit pour le moment. Revenez plus tard.
              </p>
            ) : (
              <ul className="space-y-3">
                {(coaches ?? []).map((c) => (
                  <li
                    key={c.user_id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {c.full_name?.trim() || c.email}
                      </p>
                      {c.full_name?.trim() && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
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

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Mon calendrier d&apos;entraînement
            </h1>
            <ProfileMenu showObjectifsLink />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Vos entraînements prévus.
          </p>

          <CalendarView
            athleteId={current.id}
            athleteEmail={current.email}
            workouts={(workouts ?? []) as Workout[]}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tableau de bord
          </h1>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Bienvenue <strong className="text-slate-900 dark:text-white">{current.email}</strong>
            {' '}({ROLE_LABELS[current.profile.role]}).
          </p>

          {current.profile.role === 'admin' && (
            <Link
              href="/admin/members"
              className="mt-4 inline-flex items-center rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Gérer les membres et les rôles
            </Link>
          )}
        </div>

        {current.profile.role === 'coach' && pendingRequests.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Demandes en attente
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Acceptez ou refusez les demandes d&apos;athlètes qui souhaitent vous avoir comme coach.
            </p>
            <ul className="mt-4 space-y-3">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {req.athlete_name || req.athlete_email || '—'}
                    </p>
                    {req.athlete_email && req.athlete_name !== req.athlete_email && req.athlete_name !== '—' && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.athlete_email}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      <span className="font-medium">Sport :</span> {req.sport_practiced}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="font-medium">Besoin :</span> {req.coaching_need}
                    </p>
                  </div>
                  <RespondToRequestButtons requestId={req.id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {current.profile.role === 'admin'
              ? 'Tous les membres'
              : current.profile.role === 'coach'
                ? 'Mes athlètes'
                : 'Mon profil'}
          </h2>
          <ul className="mt-4 space-y-3">
            {visibleProfiles.map((p) => {
              const isAthleteOfMine = current.profile.role === 'coach' && p.coach_id === current.id
              const displayName = (p.full_name?.trim() || p.email) as string
              const athleteHref = `/dashboard/athletes/${p.user_id}`

              if (isAthleteOfMine) {
                return (
                  <li key={p.user_id}>
                    <Link
                      href={athleteHref}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer group"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200">
                          {displayName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {ROLE_LABELS[p.role]}
                          {p.coach_id && ' (athlète)'}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0"
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
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{p.email}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {ROLE_LABELS[p.role]}
                      {p.coach_id && ' (athlète)'}
                    </p>
                  </div>
                  {p.user_id === current.id && (
                    <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
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
