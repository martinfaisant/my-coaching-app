import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AthleteCalendarPage } from '@/components/AthleteCalendarPage'
import type { Workout, Goal, ImportedActivity, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal, AthleteAvailabilitySlot } from '@/types/database'
import { getExtendedCalendarMonthGridBounds } from '@/lib/dateUtils'
import { getEffectiveWeeklyTotalsFait } from '@/app/[locale]/dashboard/workouts/actions'
import { getAvailabilityForDateRange } from '@/app/[locale]/dashboard/availability/actions'
import { parseWorkoutPrimaryMetricBySport } from '@/lib/workoutPrimaryMetric'

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
  const { rangeStart: startStr, rangeEnd: endStr, weekStartDates: weekMondays } = getExtendedCalendarMonthGridBounds(
    today.getFullYear(),
    today.getMonth()
  )

  const [workoutsResult, importedActivitiesResult, goalsResult, workoutTotalsResult, effectiveFaitResult, initialAvailabilities] = await Promise.all([
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
    getAvailabilityForDateRange(current.id, startStr, endStr),
  ])
  const workouts = workoutsResult.data
  const importedActivities = importedActivitiesResult.data
  const goals = goalsResult.data
  const initialWorkoutTotals = workoutTotalsResult.data ?? []
  const initialWeeklyTotals = effectiveFaitResult.weeklyTotals ?? []

  let coachWorkoutPrimaryMetrics = null
  if (current.profile.coach_id) {
    const { data: coachProfile } = await supabase
      .from('profiles')
      .select('workout_primary_metric_by_sport')
      .eq('user_id', current.profile.coach_id)
      .single()
    coachWorkoutPrimaryMetrics = parseWorkoutPrimaryMetricBySport(coachProfile?.workout_primary_metric_by_sport)
  }

  return (
    <AthleteCalendarPage
      athleteId={current.id}
      athleteEmail={current.email}
      initialWorkouts={(workouts ?? []) as Workout[]}
      initialImportedActivities={(importedActivities ?? []) as ImportedActivity[]}
      initialWeeklyTotals={initialWeeklyTotals as ImportedActivityWeeklyTotal[]}
      initialWorkoutTotals={(initialWorkoutTotals ?? []) as WorkoutWeeklyTotal[]}
      initialAvailabilities={(initialAvailabilities ?? []) as AthleteAvailabilitySlot[]}
      goals={(goals ?? []) as Goal[]}
      canEdit={false}
      pathToRevalidate="/dashboard/calendar"
      coachWorkoutPrimaryMetrics={coachWorkoutPrimaryMetrics}
    />
  )
}
