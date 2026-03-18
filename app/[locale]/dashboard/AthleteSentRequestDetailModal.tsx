'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { IconHourglass } from '@/components/icons/IconHourglass'
import { IconClose } from '@/components/icons/IconClose'
import { TileCard } from '@/components/TileCard'
import { getCoachRequestDetail, type CoachRequestDetail } from './actions'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import { formatDateFr } from '@/lib/dateUtils'
import { getWeeklyVolumeUnit, SPORT_ICONS, SPORT_CARD_STYLES } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'
import type { Goal } from '@/types/database'
import { RequestGoalsListModal } from '@/app/[locale]/dashboard/RequestGoalsListModal'
import {
  hasGoalResult,
  hasTargetTime,
  formatTargetTime,
  formatGoalResultTime,
  formatGoalResultPlaceOrdinal,
} from '@/lib/goalResultUtils'

type AthleteSentRequestDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  requestId: string
  coachName: string
  locale: string
  /** Appelé quand l'utilisateur clique sur « Annuler la demande » (ouvrir la confirmation d'annulation). */
  onRequestCancel: () => void
  /** Volume actuel (profil athlète, affiché en lecture seule) */
  athleteWeeklyCurrentHours?: number | null
  /** Volume maximum (profil athlète, affiché en lecture seule) */
  athleteWeeklyTargetHours?: number | null
  /** Volumes par sport (profil athlète, affichés en lecture seule) */
  athleteWeeklyVolumeBySport?: Record<string, number> | null
  /** Objectifs de l'athlète (section objectifs/résultats en lecture seule) */
  initialGoals?: Goal[]
}

const KNOWN_SPORT_TYPES: SportType[] = [
  'course',
  'course_route',
  'velo',
  'natation',
  'musculation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'trail',
  'randonnee',
  'triathlon',
]

function parseSports(sportPracticed: string): string[] {
  return sportPracticed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const DISPLAY_ORDER_VOLUME = ['course', 'course_elevation_m', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const
const sportLabelKey: Record<string, string> = {
  course: 'course',
  velo: 'velo',
  natation: 'natation',
  musculation: 'muscu',
  trail: 'trail',
  triathlon: 'triathlon',
}

function formatGoalDateBlock(dateStr: string, localeTag: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString(localeTag, { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

const MapIconSmall = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
)

const ClockIconSmall = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export function AthleteSentRequestDetailModal({
  isOpen,
  onClose,
  requestId,
  coachName,
  locale,
  onRequestCancel,
  athleteWeeklyCurrentHours,
  athleteWeeklyTargetHours,
  athleteWeeklyVolumeBySport,
  initialGoals = [],
}: AthleteSentRequestDetailModalProps) {
  const t = useTranslations('athleteSentRequest')
  const tAthletes = useTranslations('athletes')
  const tFindCoach = useTranslations('findCoach')
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const tSports = useTranslations('sports')
  const [detail, setDetail] = useState<CoachRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [seeMoreGoalsModalOpen, setSeeMoreGoalsModalOpen] = useState(false)
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!isOpen || !requestId) return
    setLoading(true)
    setNotFound(false)
    setDetail(null)
    getCoachRequestDetail(requestId).then((result) => {
      setLoading(false)
      if ('notFound' in result && result.notFound) {
        setNotFound(true)
        return
      }
      if ('error' in result && result.error) {
        setNotFound(true)
        return
      }
      setDetail(result as CoachRequestDetail)
    })
  }, [isOpen, requestId])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const localeForDate = locale === 'fr' ? 'fr-FR' : 'en-US'
  const dateLabel =
    detail?.created_at != null
      ? formatDateFr(detail.created_at, false, localeForDate)
      : ''

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
      >
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200 flex flex-col">
          {/* Header : titre, envoyée à + date, statut En attente (sablier) */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-stone-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="request-detail-title" className="text-xl font-bold text-stone-900">
                  {t('title')}
                </h2>
                {!loading && !notFound && detail && (
                  <p className="text-sm text-stone-600 mt-0.5">
                    {t('sentTo', { name: coachName })} · {dateLabel}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!loading && !notFound && detail && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-palette-amber/15 text-palette-amber border border-palette-amber/30">
                    <IconHourglass className="w-3.5 h-3.5 shrink-0" />
                    {t('pending')}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-lg min-h-9 min-w-9 p-0 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  aria-label={tCommon('close')}
                >
                  <IconClose className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Corps scrollable */}
          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
            {loading && (
              <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('loading')}>
                <div className="h-4 w-48 bg-stone-200 rounded" />
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="h-3 w-24 bg-stone-200 rounded" />
                  <div className="h-4 w-full bg-stone-200 rounded" />
                  <div className="h-3 w-full bg-stone-200 rounded" />
                  <div className="h-3 w-3/4 bg-stone-200 rounded" />
                  <div className="flex justify-end">
                    <div className="h-6 w-14 bg-stone-200 rounded" />
                  </div>
                </div>
                <div>
                  <div className="h-3 w-28 bg-stone-200 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-16 bg-stone-200 rounded-full" />
                    <div className="h-6 w-14 bg-stone-200 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="h-3 w-24 bg-stone-200 rounded mb-2" />
                  <div className="h-20 w-full bg-stone-200 rounded-lg" />
                </div>
              </div>
            )}
            {notFound && !loading && (
              <p className="text-sm text-stone-600" role="alert">{t('requestNotFound')}</p>
            )}
            {detail && !loading && (
              <>
                {/* Offre choisie – carte mise en avant */}
                <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white overflow-hidden shadow-sm">
                  <div className="border-l-4 border-palette-forest-dark p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-palette-forest-dark/80 mb-1">
                          {t('offerChosen')}
                        </p>
                        <p className="font-semibold text-stone-900 text-base">
                          {getFrozenTitleForLocale(detail, locale) || '—'}
                        </p>
                        <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                          {getFrozenDescriptionForLocale(detail, locale) || ''}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-palette-forest-dark/10 px-3 py-1.5 text-center">
                        {detail.frozen_price_type === 'free' || (detail.frozen_price != null && detail.frozen_price === 0) ? (
                          <span className="text-sm font-bold text-palette-forest-dark">{t('free')}</span>
                        ) : (
                          <span className="text-sm font-bold text-palette-forest-dark whitespace-nowrap">
                            {detail.frozen_price ?? 0}€
                            <span className="text-stone-500 font-normal"> / {detail.frozen_price_type === 'monthly' ? t('perMonth') : t('plan')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sports pratiqués */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    {t('sportsPracticed')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parseSports(detail.sport_practiced).map((sportValue) => {
                      const normalized = sportValue as SportType
                      if (KNOWN_SPORT_TYPES.includes(normalized)) {
                        return <Badge key={sportValue} sport={normalized} />
                      }
                      return (
                        <Badge key={sportValue} variant="default">
                          {sportValue}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Votre message – champ texte classique */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    {t('yourMessage')}
                  </p>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 leading-relaxed">
                    {detail.coaching_need || '—'}
                  </div>
                </div>

                {/* Objectifs et volume (même design que vue coach – données du profil) */}
                {(() => {
                  const hasVolume =
                    athleteWeeklyCurrentHours != null ||
                    athleteWeeklyTargetHours != null ||
                    (athleteWeeklyVolumeBySport &&
                      Object.keys(athleteWeeklyVolumeBySport).length > 0)
                  const vol = athleteWeeklyVolumeBySport
                  const volumeEntries: {
                    key: string
                    sportLabel: string
                    value: number
                    suffix: string
                    style: { borderLeft: string; badge: string; badgeBg: string }
                    elevationValue?: number
                  }[] = []
                  if (vol && typeof vol === 'object') {
                    for (const sport of DISPLAY_ORDER_VOLUME) {
                      if (sport === 'course_elevation_m') continue
                      const v = vol[sport]
                      if (v == null) continue
                      const unit = getWeeklyVolumeUnit(sport)
                      const suffix =
                        unit === 'km' ? tProfile('suffixKmPerWeek') : unit === 'm' ? tProfile('suffixMPerWeek') : tProfile('suffixHoursPerWeek')
                      const sportLabel = sportLabelKey[sport] ? tSports(sportLabelKey[sport] as 'course') : sport
                      const sportKey = sport as SportType
                      const style = SPORT_CARD_STYLES[sportKey] ?? SPORT_CARD_STYLES.course
                      const elevationValue = sport === 'course' ? vol['course_elevation_m'] ?? undefined : undefined
                      volumeEntries.push({ key: sport, sportLabel, value: v, suffix, style, elevationValue })
                    }
                  }
                  return (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        {tAthletes('pendingRequests.objectivesAndVolumeLabel')}
                      </p>
                      <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                      {!hasVolume ? (
                        <p className="text-sm text-stone-500 italic">{tAthletes('pendingRequests.notSpecified')}</p>
                      ) : (
                        <div className="space-y-2.5">
                          {athleteWeeklyCurrentHours != null && (
                            <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-stone-100">
                              <span className="text-stone-400 shrink-0" aria-hidden>
                                <ClockIconSmall />
                              </span>
                              <span className="text-sm font-medium text-stone-800">
                                {tAthletes('pendingRequests.weeklyCurrentHoursLabel')} {athleteWeeklyCurrentHours} {tProfile('suffixHoursPerWeek')}
                              </span>
                            </div>
                          )}
                          {athleteWeeklyTargetHours != null && (
                            <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-stone-100">
                              <span className="text-stone-400 shrink-0" aria-hidden>
                                <ClockIconSmall />
                              </span>
                              <span className="text-sm font-medium text-stone-800">
                                {tAthletes('pendingRequests.weeklyMaxHoursLabel')} {athleteWeeklyTargetHours} {tProfile('suffixHoursPerWeek')}
                              </span>
                            </div>
                          )}
                          {volumeEntries.map(({ key, sportLabel, value, suffix, style, elevationValue }) => (
                            <div
                              key={key}
                              className={`flex items-center gap-2 py-1.5 pl-2.5 pr-2.5 rounded-lg border-l-4 ${style.borderLeft} bg-white border border-stone-100`}
                            >
                              <span className={`shrink-0 ${style.badge}`} aria-hidden>
                                {(() => {
                                  const Icon = SPORT_ICONS[key as SportType] ?? SPORT_ICONS.course
                                  return <Icon className="w-4 h-4" />
                                })()}
                              </span>
                              <span className="text-sm font-medium text-stone-800">
                                {sportLabel} : {value} {suffix}
                                {elevationValue != null && (
                                  <>
                                    <span className="text-stone-400 mx-1">·</span>
                                    <span>{elevationValue} {tProfile('suffixDPlusPerWeek')}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      </div>
                    </div>
                  )
                })()}

                {/* Section Objectifs de course / résultats passés (lecture seule) */}
                {initialGoals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      {tFindCoach('requestGoals.sectionTitle')}
                    </p>
                    <div className="space-y-2">
                      {initialGoals.slice(0, 5).map((goal) => {
                        const isPast = goal.date <= today
                        const isPrimary = goal.is_primary
                        const isResult = isPast
                        const dateBlock = formatGoalDateBlock(goal.date, localeTag)
                        return (
                          <TileCard
                            key={goal.id}
                            leftBorderColor={isResult ? 'stone' : isPrimary ? 'amber' : 'sage'}
                            borderLeftOnly={isResult}
                            className={isPast ? 'opacity-75 py-2' : 'py-2'}
                          >
                            <div className="flex gap-2 items-start min-w-0">
                              <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg w-10 h-10 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                                <span className="text-[9px] font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                                <span className="text-sm font-bold text-stone-800">{dateBlock.day}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm font-bold truncate ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                                    {goal.race_name}
                                  </span>
                                  {isPrimary ? (
                                    <span className="bg-white text-palette-amber text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-palette-amber shrink-0">
                                      {tGoals('priority.primary')}
                                    </span>
                                  ) : (
                                    <span className="bg-white text-palette-sage text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-palette-sage shrink-0">
                                      {tGoals('priority.secondary')}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-stone-500 flex-wrap mt-0.5">
                                  <MapIconSmall className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span>{goal.distance} km</span>
                                  {hasTargetTime(goal) && (
                                    <>
                                      <span className="text-stone-400">·</span>
                                      <ClockIconSmall className="w-3 h-3 text-stone-400 shrink-0" />
                                      {isPast && hasGoalResult(goal) ? (
                                        <span>{tGoals('targetTimeLabel')} {formatTargetTime(goal)} · {tGoals('achieved')} {formatGoalResultTime(goal)}</span>
                                      ) : (
                                        <span>{tGoals('targetTimeLabel')} : {formatTargetTime(goal)}</span>
                                      )}
                                    </>
                                  )}
                                  {!hasTargetTime(goal) && isPast && hasGoalResult(goal) && (
                                    <>
                                      <span className="text-stone-400">·</span>
                                      <span>{formatGoalResultTime(goal)}</span>
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
                          </TileCard>
                        )
                      })}
                      {initialGoals.length > 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full text-sm"
                          onClick={() => setSeeMoreGoalsModalOpen(true)}
                        >
                          {tFindCoach('requestGoals.seeMore', { count: initialGoals.length })}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer : Annuler (gauche), Fermer (droite), même taille */}
          <div className="shrink-0 p-4 border-t border-stone-200 bg-stone-50/80 flex gap-3">
            {loading || notFound ? (
              <Button variant="muted" onClick={onClose} className="flex-1">
                {t('close')}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="danger"
                  onClick={onRequestCancel}
                  className="flex-1"
                >
                  {t('cancelRequest')}
                </Button>
                <Button variant="muted" onClick={onClose} className="flex-1">
                  {t('close')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {seeMoreGoalsModalOpen && (
        <RequestGoalsListModal
          isOpen={true}
          onClose={() => setSeeMoreGoalsModalOpen(false)}
          goals={initialGoals}
          title={tFindCoach('requestGoals.seeMoreModalTitle')}
        />
      )}
    </>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
