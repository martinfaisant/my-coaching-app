import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { CalendarViewWithNavigation } from '@/components/CalendarViewWithNavigation'
import type { Workout, Goal, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'

type PageProps = { params: Promise<{ athleteId: string }> }

function getWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default async function AthleteCalendarPage({ params }: PageProps) {
  const { athleteId } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('user_id, email, coach_id')
    .eq('user_id', athleteId)
    .single()

  if (!athleteProfile || athleteProfile.user_id === current.id || athleteProfile.coach_id !== current.id) {
    redirect('/dashboard')
  }

  const today = new Date()
  const currentMonday = getWeekMonday(today)
  // Charger 5 semaines : S-2, S-1, S, S+1, S+2
  const startMonday = new Date(currentMonday)
  startMonday.setDate(startMonday.getDate() - 14) // S-2
  const endSunday = new Date(currentMonday)
  endSunday.setDate(endSunday.getDate() + 14 + 6) // S+2

  const startStr = startMonday.toISOString().slice(0, 10)
  const endStr = endSunday.toISOString().slice(0, 10)
  // Calculer les lundis des 5 semaines pour les totaux
  const weekMondays: string[] = []
  for (let offset = -2; offset <= 2; offset++) {
    const weekMonday = new Date(currentMonday)
    weekMonday.setDate(weekMonday.getDate() + offset * 7)
    weekMondays.push(weekMonday.toISOString().slice(0, 10))
  }

  const [workoutsResult, goalsResult, weeklyTotalsResult, workoutTotalsResult] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', athleteId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date')
      .order('created_at'),
    supabase
      .from('goals')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: true }),
    supabase
      .from('imported_activity_weekly_totals')
      .select('*')
      .eq('athlete_id', athleteId)
      .in('week_start', weekMondays)
      .order('week_start')
      .order('sport_type'),
    supabase
      .from('workout_weekly_totals')
      .select('*')
      .eq('athlete_id', athleteId)
      .in('week_start', weekMondays)
      .order('week_start')
      .order('sport_type'),
  ])
  const workouts = workoutsResult.data
  const goals = goalsResult.data
  const initialWeeklyTotals = weeklyTotalsResult.data ?? []
  const initialWorkoutTotals = workoutTotalsResult.data ?? []

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-28">
        <CalendarViewWithNavigation
          athleteId={athleteId}
          athleteEmail={athleteProfile.email}
          initialWorkouts={(workouts ?? []) as Workout[]}
          initialWeeklyTotals={(initialWeeklyTotals ?? []) as ImportedActivityWeeklyTotal[]}
          initialWorkoutTotals={(initialWorkoutTotals ?? []) as WorkoutWeeklyTotal[]}
          goals={(goals ?? []) as Goal[]}
          canEdit={true}
          pathToRevalidate={`/dashboard/athletes/${athleteId}`}
          title={
            <h1 className="text-xl font-semibold text-stone-900">
              Calendrier d&apos;entraînement — {athleteProfile.email}
            </h1>
          }
        />

        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
            <div className="p-2 bg-[#627e59]/10 rounded-full text-[#627e59]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Objectifs de l&apos;athlète</h2>
          </div>
          <div className="overflow-x-auto">
            {(goals?.length ?? 0) > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-stone-500 uppercase border-b border-stone-100">
                    <th className="px-6 py-4 bg-stone-50">Date</th>
                    <th className="px-6 py-4 bg-stone-50 w-1/2">Course</th>
                    <th className="px-6 py-4 bg-stone-50">Distance</th>
                    <th className="px-6 py-4 bg-stone-50">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(goals as Goal[]).map((g) => (
                    <tr key={g.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-stone-900">
                        {new Date(g.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#627e59] font-semibold">
                        {g.race_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {g.distance}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-bold rounded-full border ${
                            g.is_primary
                              ? 'text-[#627e59] bg-[#627e59]/10 border-[#627e59]/20'
                              : 'text-[#8e9856] bg-[#8e9856]/10 border-[#8e9856]/20'
                          }`}
                        >
                          {g.is_primary ? 'Principal' : 'Secondaire'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8">
                <p className="text-sm text-stone-500">
                  L&apos;athlète n&apos;a pas défini d&apos;objectif.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
