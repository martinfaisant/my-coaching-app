'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import { AvatarImage } from './AvatarImage'
import { TileCard } from './TileCard'
import type { Workout, Goal, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal, AthleteAvailabilitySlot } from '@/types/database'
import { getDaysUntil } from '@/lib/dateUtils'
import { getInitials } from '@/lib/stringUtils'
import { hasGoalResult, formatGoalResultTime, formatGoalResultPlaceOrdinal } from '@/lib/goalResultUtils'

// Fonction pour formater la date en mois/jour
function formatDateBlock(dateStr: string, localeTag: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString(localeTag, { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

const MapIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
)

const ClockIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

type CoachAthleteCalendarPageProps = {
  athleteId: string
  athleteEmail: string
  athleteName: string
  athleteAvatarUrl: string | null
  initialWorkouts: Workout[]
  initialWeeklyTotals?: ImportedActivityWeeklyTotal[]
  initialWorkoutTotals?: WorkoutWeeklyTotal[]
  initialAvailabilities?: AthleteAvailabilitySlot[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
}

export function CoachAthleteCalendarPage({
  athleteId,
  athleteEmail,
  athleteName,
  athleteAvatarUrl,
  initialWorkouts,
  initialWeeklyTotals = [],
  initialWorkoutTotals = [],
  initialAvailabilities = [],
  goals = [],
  canEdit,
  pathToRevalidate,
}: CoachAthleteCalendarPageProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const initials = getInitials(athleteName)
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  return (
    <CalendarViewWithNavigation
        athleteId={athleteId}
        athleteEmail={athleteEmail}
        initialWorkouts={initialWorkouts}
        initialWeeklyTotals={initialWeeklyTotals}
        initialWorkoutTotals={initialWorkoutTotals}
        initialAvailabilities={initialAvailabilities}
        goals={goals}
        canEdit={canEdit}
        pathToRevalidate={pathToRevalidate}
        hideBuiltInSelector={true}
        disableContentScroll={true}
        renderWeekSelector={({ dateRangeLabel, onNavigate, isAnimating, prevWeekLastDayLabel, nextWeekFirstDayLabel }) => (
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:h-20 px-4 md:px-6 lg:px-8 py-4 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
            <div className="flex items-center gap-4 min-w-0 shrink-0">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all text-stone-400 hover:text-stone-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex items-center gap-3 min-w-0">
                <AvatarImage src={athleteAvatarUrl} initials={initials} className="w-10 h-10 rounded-xl shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-stone-800 truncate">{athleteName}</h1>
                </div>
              </div>
            </div>
            <div className="flex justify-center w-full md:w-auto md:flex-none">
              <WeekSelector
                dateRangeLabel={dateRangeLabel}
                onNavigate={onNavigate}
                isAnimating={isAnimating}
                prevWeekLastDayLabel={prevWeekLastDayLabel}
                nextWeekFirstDayLabel={nextWeekFirstDayLabel}
                prevWeekAriaLabel={tCommon('weekPrevious')}
                nextWeekAriaLabel={tCommon('weekNext')}
              />
            </div>
          </header>
        )}
        renderAfterCalendar={() => {
          const goalsList = (goals ?? []) as Goal[]
          const today = new Date().toISOString().slice(0, 10)
          const futureGoals = goalsList.filter(g => g.date >= today).sort((a, b) => a.date.localeCompare(b.date))
          const pastGoals = goalsList.filter(g => g.date < today).sort((a, b) => b.date.localeCompare(a.date))
          
          // Grouper les objectifs par saison (année)
          const goalsBySeason = new Map<number, Goal[]>()
          const allGoals = [...futureGoals, ...pastGoals]
          allGoals.forEach(goal => {
            const year = new Date(goal.date + 'T12:00:00').getFullYear()
            if (!goalsBySeason.has(year)) {
              goalsBySeason.set(year, [])
            }
            goalsBySeason.get(year)!.push(goal)
          })
          
          // Trier les saisons par ordre chronologique
          const seasons = Array.from(goalsBySeason.keys()).sort((a, b) => a - b)

          return (
            <div className="pb-6 border-t border-stone-100">
              <section className="mt-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 bg-palette-forest-dark/10 rounded-full text-palette-forest-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">{t('athleteGoalsTitle')}</h2>
                </div>
                {seasons.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
                    <p className="text-sm text-stone-500">
                      {t('noAthleteGoals')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {seasons.map((seasonYear) => {
                      const seasonGoals = goalsBySeason.get(seasonYear)!
                      return (
                        <div key={seasonYear} className="space-y-6">
                          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide">{t('season', { year: seasonYear })}</h3>
                          {seasonGoals.map((goal) => {
                            const isPast = goal.date < today
                            const daysUntil = getDaysUntil(goal.date)
                            const dateBlock = formatDateBlock(goal.date, localeTag)
                            const isPrimary = goal.is_primary

                            return (
                              <TileCard
                                key={goal.id}
                                leftBorderColor={isPrimary ? 'amber' : 'sage'}
                                className={isPast ? 'opacity-75' : ''}
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="flex gap-4 items-center min-w-0">
                                    {/* Date Block */}
                                    <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-14 h-14 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                                      <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                                      <span className="text-xl font-bold text-stone-800">{dateBlock.day}</span>
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className={`text-base font-bold truncate ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                          {goal.race_name}
                                        </h3>
                                        {isPrimary ? (
                                          <span className="bg-palette-amber/10 text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                                            {t('priority.primary')}
                                          </span>
                                        ) : (
                                          <span className="bg-palette-sage/10 text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                                            {t('priority.secondary')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 text-sm text-stone-500 font-medium flex-wrap">
                                        <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        <span>{goal.distance} km</span>
                                        {isPast && hasGoalResult(goal) && (
                                          <>
                                            <span className="text-stone-400">·</span>
                                            <span className="flex items-center gap-1">
                                              <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                              <span>{formatGoalResultTime(goal)}</span>
                                            </span>
                                            {goal.result_place != null && (
                                              <>
                                                <span className="text-stone-400">·</span>
                                                <span>{formatGoalResultPlaceOrdinal(goal.result_place, locale)}</span>
                                              </>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  {daysUntil !== null && !isPast && (
                                    <span className="text-sm font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-3 py-1 rounded-lg shrink-0">
                                      {t('daysUntil', { days: daysUntil })}
                                    </span>
                                  )}
                                </div>
                              </TileCard>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )
        }}
      />
  )
}
