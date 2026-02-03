import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/CalendarView'
import type { Workout } from '@/types/database'

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Calendrier d&apos;entraînement — {athleteProfile.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Semaine précédente, actuelle et suivante. Cliquez sur un jour pour ajouter un entraînement, sur un entraînement pour le modifier.
        </p>

        <CalendarView
          athleteId={athleteId}
          athleteEmail={athleteProfile.email}
          workouts={(workouts ?? []) as Workout[]}
          canEdit={true}
          pathToRevalidate={`/dashboard/athletes/${athleteId}`}
        />
      </main>
    </div>
  )
}
