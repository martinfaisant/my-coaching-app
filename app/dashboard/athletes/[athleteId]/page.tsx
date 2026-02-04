import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { CalendarViewWithNavigation } from '@/components/CalendarViewWithNavigation'
import type { Workout, Goal } from '@/types/database'

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
    .select('user_id, email')
    .eq('user_id', athleteId)
    .single()

  if (!athleteProfile || athleteProfile.user_id === current.id) {
    redirect('/dashboard')
  }

  const { data: coachCheck } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', athleteId)
    .single()
  if (coachCheck?.coach_id !== current.id) {
    redirect('/dashboard')
  }

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
    .eq('athlete_id', athleteId)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date')
    .order('created_at')

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('date', { ascending: true })

  return (
    <div className="min-h-screen bg-stone-50bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-palette-forest-dark bg-white/80bg-stone-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600text-stone-400 hover:text-stone-900hover:text-white"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <CalendarViewWithNavigation
          athleteId={athleteId}
          athleteEmail={athleteProfile.email}
          initialWorkouts={(workouts ?? []) as Workout[]}
          goals={(goals ?? []) as Goal[]}
          canEdit={true}
          pathToRevalidate={`/dashboard/athletes/${athleteId}`}
          title={
            <h1 className="text-xl font-semibold text-stone-900">
              Calendrier d&apos;entraînement — {athleteProfile.email}
            </h1>
          }
        />

        <section className="mt-8 rounded-xl border border-palette-forest-dark bg-white p-4">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">
            Objectifs de l&apos;athlète
          </h2>
          {(goals?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200border-stone-700 text-left text-stone-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Course</th>
                    <th className="py-2 pr-4">Distance</th>
                    <th className="py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(goals as Goal[]).map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-stone-200 last:border-0"
                    >
                      <td className="py-2 pr-4 text-stone-700text-stone-300">
                        {new Date(g.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2 pr-4 text-stone-700text-stone-300">
                        {g.race_name}
                      </td>
                      <td className="py-2 pr-4 text-stone-700text-stone-300">
                        {g.distance}
                      </td>
                      <td className="py-2 text-stone-600text-stone-400">
                        {g.is_primary ? 'Principal' : 'Secondaire'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-2">
              L&apos;athlète n&apos;a pas défini d&apos;objectif.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
