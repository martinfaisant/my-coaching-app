import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CoachAthleteCalendarPage } from '@/components/CoachAthleteCalendarPage'
import type {
  AthleteFacility,
  CoachAthleteNote,
  Workout,
  Goal,
  ImportedActivityWeeklyTotal,
  WorkoutWeeklyTotal,
  AthleteAvailabilitySlot,
} from '@/types/database'
import { getWeekMonday } from '@/lib/dateUtils'
import { getDisplayName } from '@/lib/displayName'
import { getEffectiveWeeklyTotalsFait } from '@/app/[locale]/dashboard/workouts/actions'
import { getAvailabilityForDateRange } from '@/app/[locale]/dashboard/availability/actions'
import { logger } from '@/lib/logger'
import { requireCoachAthleteCalendarAccess } from '@/lib/authHelpers'

type PageProps = { params: Promise<{ athleteId: string }> }

export default async function AthleteCalendarPage({ params }: PageProps) {
  const { athleteId } = await params

  const supabase = await createClient()
  const access = await requireCoachAthleteCalendarAccess(supabase, athleteId)
  if ('error' in access) {
    redirect('/dashboard/athletes')
  }

  const { user, athleteProfile } = access

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

  const [workoutsResult, goalsResult, workoutTotalsResult, effectiveFaitResult, initialAvailabilities, facilitiesResult, coachNotesResult] =
    await Promise.all([
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
        .from('workout_weekly_totals')
        .select('*')
        .eq('athlete_id', athleteId)
        .in('week_start', weekMondays)
        .order('week_start')
        .order('sport_type'),
      getEffectiveWeeklyTotalsFait(athleteId, weekMondays[0], weekMondays[weekMondays.length - 1]),
      getAvailabilityForDateRange(athleteId, startStr, endStr),
      supabase.from('athlete_facilities').select('*').eq('athlete_id', athleteId),
      supabase
        .from('coach_athlete_notes')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('coach_id', user.id)
        .order('updated_at', { ascending: false }),
    ])
  const workouts = workoutsResult.data
  const goals = goalsResult.data
  const initialWorkoutTotals = workoutTotalsResult.data ?? []
  const initialWeeklyTotals = effectiveFaitResult.weeklyTotals ?? []

  const displayName = getDisplayName(athleteProfile, athleteProfile.email ?? '')
  if (facilitiesResult.error) {
    logger.warn('athlete_facilities: erreur chargement (calendrier coach)', {
      athleteId,
      message: facilitiesResult.error.message,
    })
  }
  const initialAthleteFacilities = (facilitiesResult.data ?? []) as AthleteFacility[]

  if (coachNotesResult.error) {
    logger.warn('coach_athlete_notes: erreur chargement (calendrier coach)', {
      athleteId,
      message: coachNotesResult.error.message,
    })
  }
  const initialCoachNotes = (coachNotesResult.data ?? []) as CoachAthleteNote[]

  return (
    <CoachAthleteCalendarPage
      athleteId={athleteId}
      athleteEmail={athleteProfile.email ?? ''}
      athleteName={displayName}
      athleteAvatarUrl={athleteProfile.avatar_url ?? null}
      initialWorkouts={(workouts ?? []) as Workout[]}
      initialWeeklyTotals={(initialWeeklyTotals ?? []) as ImportedActivityWeeklyTotal[]}
      initialWorkoutTotals={(initialWorkoutTotals ?? []) as WorkoutWeeklyTotal[]}
      initialAvailabilities={(initialAvailabilities ?? []) as AthleteAvailabilitySlot[]}
      initialAthleteFacilities={initialAthleteFacilities}
      initialCoachNotes={initialCoachNotes}
      goals={(goals ?? []) as Goal[]}
      canEdit={true}
      pathToRevalidate={`/dashboard/athletes/${athleteId}`}
    />
  )
}
