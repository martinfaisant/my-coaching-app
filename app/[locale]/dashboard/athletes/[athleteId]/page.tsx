import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { CoachAthleteCalendarPage } from '@/components/CoachAthleteCalendarPage'
import type { Workout, Goal, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'
import { getWeekMonday } from '@/lib/dateUtils'
import { getDisplayName } from '@/lib/displayName'

type PageProps = { params: Promise<{ athleteId: string }> }

export default async function AthleteCalendarPage({ params }: PageProps) {
  const { athleteId } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('user_id, email, coach_id, first_name, last_name, avatar_url')
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

  const displayName = getDisplayName(athleteProfile, athleteProfile.email)

  return (
    <CoachAthleteCalendarPage
      athleteId={athleteId}
      athleteEmail={athleteProfile.email}
      athleteName={displayName}
      athleteAvatarUrl={athleteProfile.avatar_url}
      initialWorkouts={(workouts ?? []) as Workout[]}
      initialWeeklyTotals={(initialWeeklyTotals ?? []) as ImportedActivityWeeklyTotal[]}
      initialWorkoutTotals={(initialWorkoutTotals ?? []) as WorkoutWeeklyTotal[]}
      goals={(goals ?? []) as Goal[]}
      canEdit={true}
      pathToRevalidate={`/dashboard/athletes/${athleteId}`}
    />
  )
}
