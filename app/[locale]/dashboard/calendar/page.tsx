import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AthleteCalendarPage } from '@/components/AthleteCalendarPage'
import type { Workout, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'
import { getWeekMonday } from '@/lib/dateUtils'
import { getEffectiveWeeklyTotalsFait } from '@/app/[locale]/dashboard/workouts/actions'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('calendarTitle')
  }
}

export default async function CalendarPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
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

  const [workoutsResult, importedActivitiesResult, goalsResult, workoutTotalsResult, effectiveFaitResult] = await Promise.all([
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
    supabase
      .from('workout_weekly_totals')
      .select('*')
      .eq('athlete_id', current.id)
      .in('week_start', weekMondays)
      .order('week_start')
      .order('sport_type'),
    getEffectiveWeeklyTotalsFait(current.id, weekMondays[0], weekMondays[weekMondays.length - 1]),
  ])
  const workouts = workoutsResult.data
  const importedActivities = importedActivitiesResult.data
  const goals = goalsResult.data
  const initialWorkoutTotals = workoutTotalsResult.data ?? []
  const initialWeeklyTotals = effectiveFaitResult.weeklyTotals ?? []

  return (
    <AthleteCalendarPage
      athleteId={current.id}
      athleteEmail={current.email}
      initialWorkouts={(workouts ?? []) as Workout[]}
      initialImportedActivities={(importedActivities ?? []) as ImportedActivity[]}
      initialWeeklyTotals={initialWeeklyTotals as ImportedActivityWeeklyTotal[]}
      initialWorkoutTotals={(initialWorkoutTotals ?? []) as WorkoutWeeklyTotal[]}
      goals={(goals ?? []) as Goal[]}
      canEdit={false}
      pathToRevalidate="/dashboard/calendar"
    />
  )
}
