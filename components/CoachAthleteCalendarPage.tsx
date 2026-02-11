'use client'

import Link from 'next/link'
import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import { AvatarImage } from './AvatarImage'
import type { Workout, Goal, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'

// Fonction pour calculer les jours restants
function getDaysUntil(dateStr: string): number | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(dateStr + 'T12:00:00')
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 ? diffDays : null
}

// Fonction pour formater la date en mois/jour
function formatDateBlock(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString('fr-FR', { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

const MapIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
}

function getInitials(nameOrEmail: string): string {
  const s = (nameOrEmail || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1]![0]).toUpperCase()
  return s.slice(0, 2).toUpperCase()
}

export function CoachAthleteCalendarPage({
  athleteId,
  athleteEmail,
  athleteName,
  athleteAvatarUrl,
  initialWorkouts,
  initialWeeklyTotals = [],
  initialWorkoutTotals = [],
  goals = [],
  canEdit,
  pathToRevalidate,
}: CoachAthleteCalendarPageProps) {
  const initials = getInitials(athleteName)

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <CalendarViewWithNavigation
        athleteId={athleteId}
        athleteEmail={athleteEmail}
        initialWorkouts={initialWorkouts}
        initialWeeklyTotals={initialWeeklyTotals}
        initialWorkoutTotals={initialWorkoutTotals}
        goals={goals}
        canEdit={canEdit}
        pathToRevalidate={pathToRevalidate}
        hideBuiltInSelector={true}
        disableContentScroll={true}
        renderWeekSelector={({ dateRangeLabel, onNavigate, isAnimating }) => (
          <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all text-stone-400 hover:text-stone-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex items-center gap-3">
                <AvatarImage src={athleteAvatarUrl} initials={initials} className="w-10 h-10 rounded-xl" />
                <div>
                  <h1 className="text-lg font-bold text-stone-800">{athleteName}</h1>
                </div>
              </div>
            </div>
            <WeekSelector dateRangeLabel={dateRangeLabel} onNavigate={onNavigate} isAnimating={isAnimating} />
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
              <section className="mt-6 px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#627e59]/10 rounded-full text-[#627e59]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">Objectifs de l&apos;athlète</h2>
                </div>
                {seasons.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
                    <p className="text-sm text-stone-500">
                      L&apos;athlète n&apos;a pas défini d&apos;objectif.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {seasons.map((seasonYear) => {
                      const seasonGoals = goalsBySeason.get(seasonYear)!
                      return (
                        <div key={seasonYear} className="space-y-6">
                          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide">Saison {seasonYear}</h3>
                          {seasonGoals.map((goal) => {
                            const isPast = goal.date < today
                            const daysUntil = getDaysUntil(goal.date)
                            const dateBlock = formatDateBlock(goal.date)
                            const isPrimary = goal.is_primary

                            return (
                              <div
                                key={goal.id}
                                className={`bg-white rounded-2xl p-5 border-l-4 ${
                                  isPrimary ? 'border-[#c9a544]' : 'border-[#aaaa51]'
                                } border-y border-r border-stone-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${
                                  isPast ? 'opacity-75' : ''
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                  <div className="flex gap-5 items-center">
                                    {/* Date Block */}
                                    <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-16 h-16 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                                      <span className="text-xs font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                                      <span className="text-2xl font-bold text-stone-800">{dateBlock.day}</span>
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-bold ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                          {goal.race_name}
                                        </h3>
                                        {isPrimary ? (
                                          <span className="bg-[#c9a544]/10 text-[#c9a544] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c9a544]">
                                            Principal
                                          </span>
                                        ) : (
                                          <span className="bg-[#aaaa51]/10 text-[#aaaa51] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#aaaa51]">
                                            Secondaire
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                                        <span className="flex items-center gap-1">
                                          <MapIcon className="w-3.5 h-3.5 text-stone-400" />
                                          {goal.distance} km
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                    {daysUntil !== null && !isPast && (
                                      <span className="text-sm font-bold text-[#627e59] bg-[#627e59]/10 px-3 py-1 rounded-lg">
                                        J-{daysUntil}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
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
    </main>
  )
}
