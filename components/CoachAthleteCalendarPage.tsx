'use client'

'use client'

import Link from 'next/link'
import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import { AvatarImage } from './AvatarImage'
import type { Workout, Goal, ImportedActivityWeeklyTotal, WorkoutWeeklyTotal } from '@/types/database'

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
        renderAfterCalendar={() => (
          <div className="pb-6 border-t border-stone-100">
            <section className="mt-6 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="px-6 lg:px-8 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
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
                        <th className="px-6 lg:px-8 py-4 bg-stone-50">Date</th>
                        <th className="px-6 lg:px-8 py-4 bg-stone-50 w-1/2">Course</th>
                        <th className="px-6 lg:px-8 py-4 bg-stone-50">Distance</th>
                        <th className="px-6 lg:px-8 py-4 bg-stone-50">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(goals as Goal[]).map((g) => (
                        <tr key={g.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 lg:px-8 py-4 text-sm font-medium text-stone-900">
                            {new Date(g.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 lg:px-8 py-4 text-sm text-[#627e59] font-semibold">
                            {g.race_name}
                          </td>
                          <td className="px-6 lg:px-8 py-4 text-sm text-stone-600">
                            {g.distance}
                          </td>
                          <td className="px-6 lg:px-8 py-4">
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
                  <div className="px-6 lg:px-8 py-8">
                    <p className="text-sm text-stone-500">
                      L&apos;athlète n&apos;a pas défini d&apos;objectif.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      />
    </main>
  )
}
