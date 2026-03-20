'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { AthleteFacilityCard } from '@/app/[locale]/dashboard/profile/installations/AthleteFacilityCard'
import { AthleteFacilityModal } from '@/app/[locale]/dashboard/profile/installations/AthleteFacilityModal'
import { deleteAthleteFacility } from '@/app/[locale]/dashboard/profile/installations/actions'
import { CalendarViewWithNavigation } from './CalendarViewWithNavigation'
import { WeekSelector } from './WeekSelector'
import { AvatarImage } from './AvatarImage'
import { TileCard } from './TileCard'
import { AthleteFacilityDetails } from '@/components/AthleteFacilityDetails'
import { CoachAthleteNotesSection } from '@/components/CoachAthleteNotesSection'
import { IconBuilding } from '@/components/icons/IconBuilding'
import type {
  AthleteFacility,
  CoachAthleteNote,
  Workout,
  Goal,
  ImportedActivityWeeklyTotal,
  WorkoutWeeklyTotal,
  AthleteAvailabilitySlot,
} from '@/types/database'
import { getDaysUntil, formatGoalDateBlock } from '@/lib/dateUtils'
import { getInitials } from '@/lib/stringUtils'
import { hasGoalResult, formatGoalResultTime, formatGoalResultPlaceOrdinal, hasTargetTime, formatTargetTime } from '@/lib/goalResultUtils'

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

/** Icône notes (calendrier coach). */
const NoteTabIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8M8 11h6" />
  </svg>
)

/** Icône cible pour l'onglet Objectifs. */
const TargetIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
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
  initialAthleteFacilities?: AthleteFacility[]
  goals?: Goal[]
  canEdit: boolean
  pathToRevalidate: string
  initialCoachNotes?: CoachAthleteNote[]
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
  initialAthleteFacilities = [],
  initialCoachNotes = [],
}: CoachAthleteCalendarPageProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const initials = getInitials(athleteName)
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')
  const tFacilities = useTranslations('facilities')
  const tNotes = useTranslations('coachAthleteNotes')
  const router = useRouter()

  const [afterCalendarTab, setAfterCalendarTab] = useState<'goals' | 'facilities' | 'notes'>('goals')
  const [facilityModalOpen, setFacilityModalOpen] = useState(false)
  const [facilityToEdit, setFacilityToEdit] = useState<AthleteFacility | null>(null)
  const [facilityDeleteErrorById, setFacilityDeleteErrorById] = useState<Record<string, string>>({})
  const [facilityDeleteLoading, setFacilityDeleteLoading] = useState(false)

  const openFacilityEdit = (facility: AthleteFacility) => {
    setFacilityToEdit(facility)
    setFacilityModalOpen(true)
  }

  const closeFacilityModal = () => {
    setFacilityModalOpen(false)
  }

  const onFacilitySaved = () => {
    setFacilityModalOpen(false)
    router.refresh()
  }

  const handleFacilityDelete = async (facilityId: string) => {
    if (facilityDeleteLoading) return

    const ok = window.confirm(tFacilities('deleteConfirmation'))
    if (!ok) return

    setFacilityDeleteLoading(true)
    setFacilityDeleteErrorById((prev) => {
      const next = { ...prev }
      delete next[facilityId]
      return next
    })

    const res = await deleteAthleteFacility(facilityId)
    if (res.error) {
      setFacilityDeleteErrorById((prev) => ({ ...prev, [facilityId]: res.error ?? 'Error' }))
      setFacilityDeleteLoading(false)
      return
    }

    setFacilityDeleteLoading(false)
    router.refresh()
  }

  return (
    <>
    <CalendarViewWithNavigation
        athleteId={athleteId}
        athleteEmail={athleteEmail}
        initialWorkouts={initialWorkouts}
        initialWeeklyTotals={initialWeeklyTotals}
        initialWorkoutTotals={initialWorkoutTotals}
        initialAvailabilities={initialAvailabilities}
        initialAthleteFacilities={initialAthleteFacilities}
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
                <AvatarImage src={athleteAvatarUrl} initials={initials} className="w-9 h-9 rounded-xl shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-stone-800 truncate">{athleteName}</h1>
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
          const facilitiesSorted = [...initialAthleteFacilities].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
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
              <div className="mb-6 w-full">
                <div className="flex w-full bg-stone-200 p-0.5 rounded-lg" role="group">
                  <button
                    type="button"
                    className={`flex flex-1 min-w-0 items-center justify-center gap-2 px-3 py-2.5 text-base font-bold rounded-md transition-all ${
                      afterCalendarTab === 'goals'
                        ? 'bg-palette-forest-dark text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    onClick={() => setAfterCalendarTab('goals')}
                  >
                    <TargetIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t('calendarTabObjectives')}</span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-1 min-w-0 items-center justify-center gap-2 px-3 py-2.5 text-base font-bold rounded-md transition-all ${
                      afterCalendarTab === 'facilities'
                        ? 'bg-palette-forest-dark text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    onClick={() => setAfterCalendarTab('facilities')}
                  >
                    <IconBuilding className="h-5 w-5 shrink-0" />
                    <span className="truncate">{tFacilities('calendarTabFacilities')}</span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-1 min-w-0 items-center justify-center gap-2 px-3 py-2.5 text-base font-bold rounded-md transition-all ${
                      afterCalendarTab === 'notes'
                        ? 'bg-palette-forest-dark text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    onClick={() => setAfterCalendarTab('notes')}
                  >
                    <NoteTabIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{tNotes('calendarTabNotes')}</span>
                  </button>
                </div>
              </div>

              {afterCalendarTab === 'goals' ? (
                <section>
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
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{t('season', { year: seasonYear })}</h3>
                            {seasonGoals.map((goal) => {
                              const isPast = goal.date < today
                              const daysUntil = getDaysUntil(goal.date)
                              const dateBlock = formatGoalDateBlock(goal.date, localeTag)
                              const isPrimary = goal.is_primary
                              const isResult = goal.date <= today

                              return (
                                <TileCard
                                  key={goal.id}
                                  leftBorderColor={isResult ? 'stone' : isPrimary ? 'amber' : 'sage'}
                                  borderLeftOnly={isResult}
                                  className=""
                                >
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex gap-4 items-center min-w-0">
                                      <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg w-14 h-12 shrink-0">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.monthYear}</span>
                                        <span className="text-sm font-bold text-stone-800">{dateBlock.day}</span>
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <h3 className={`text-sm font-bold truncate ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                            {goal.race_name}
                                          </h3>
                                          {isPrimary ? (
                                            <span className="bg-white text-palette-amber text-[10px] font-semibold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                                              {t('priority.primary')}
                                            </span>
                                          ) : (
                                            <span className="bg-white text-palette-sage text-[10px] font-semibold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                                              {t('priority.secondary')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-stone-500 flex-wrap">
                                          <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                          <span>{goal.distance} km</span>
                                          {hasTargetTime(goal) && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span className="flex items-center gap-1">
                                                <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                {isPast && hasGoalResult(goal) ? (
                                                  <span>{t('targetTimeLabel')} {formatTargetTime(goal)} · {t('achieved')} {formatGoalResultTime(goal)}</span>
                                                ) : (
                                                  <span>{t('targetTimeLabel')} : {formatTargetTime(goal)}</span>
                                                )}
                                              </span>
                                            </>
                                          )}
                                          {!hasTargetTime(goal) && isPast && hasGoalResult(goal) && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span className="flex items-center gap-1">
                                                <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                <span>{formatGoalResultTime(goal)}</span>
                                              </span>
                                            </>
                                          )}
                                          {hasGoalResult(goal) && goal.result_place != null && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span>{formatGoalResultPlaceOrdinal(goal.result_place, locale)}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

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
              ) : afterCalendarTab === 'facilities' ? (
                <section>
                  {facilitiesSorted.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
                      <p className="text-sm font-semibold text-stone-700">{tFacilities('emptyTitle')}</p>
                      <p className="mt-2 text-sm text-stone-500">{tFacilities('emptyDescription')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {facilitiesSorted.map((facility) =>
                        canEdit ? (
                          <AthleteFacilityCard
                            key={facility.id}
                            facility={facility}
                            onEdit={openFacilityEdit}
                            onDelete={(f) => void handleFacilityDelete(f.id)}
                            deleteError={facilityDeleteErrorById[facility.id] ?? null}
                          />
                        ) : (
                          <AthleteFacilityDetails key={facility.id} facility={facility} />
                        )
                      )}
                    </div>
                  )}
                </section>
              ) : (
                <section>
                  <CoachAthleteNotesSection
                    athleteId={athleteId}
                    initialNotes={initialCoachNotes}
                    onNotesChanged={() => router.refresh()}
                  />
                </section>
              )}
            </div>
          )
        }}
      />
      <AthleteFacilityModal
        key={facilityModalOpen ? facilityToEdit?.id ?? 'edit' : 'closed'}
        isOpen={facilityModalOpen}
        facility={facilityToEdit}
        onClose={closeFacilityModal}
        onSaved={onFacilitySaved}
      />
    </>
  )
}
