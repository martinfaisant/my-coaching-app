'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { AvatarImage } from '@/components/AvatarImage'
import { Modal } from '@/components/Modal'
import { TileCard } from '@/components/TileCard'
import { useOpenChat } from '@/contexts/OpenChatContext'
import { getInitials } from '@/lib/stringUtils'
import {
  getSportTranslationKey,
  getWeeklyVolumeTileElevationJsonKey,
  getWeeklyVolumeUnit,
  legacyWeeklyVolumeTileElevationValue,
  SPORT_CARD_STYLES,
  SPORT_ICONS,
  WEEKLY_VOLUME_DISPLAY_ORDER,
} from '@/lib/sportStyles'
import type { SportType, WeeklyVolumeTileKey } from '@/lib/sportStyles'
import { respondToCoachRequest } from '@/app/[locale]/dashboard/actions'
import type { PendingRequestWithAthlete } from '@/app/[locale]/dashboard/actions'
import { CoachPlatformSubscribeOffersModal } from '@/components/CoachPlatformSubscribeOffersModal'
import type { Goal } from '@/types/database'
import { RequestGoalsListModal } from '@/app/[locale]/dashboard/RequestGoalsListModal'
import {
  hasGoalResult,
  hasTargetTime,
  formatTargetTime,
  formatGoalResultTime,
  formatGoalResultPlaceOrdinal,
} from '@/lib/goalResultUtils'
import { formatGoalDateBlock } from '@/lib/dateUtils'

type PendingRequestTileProps = {
  request: PendingRequestWithAthlete
  /** Objectifs de l'athlète (triés date desc), pour les blocs Objectifs / Résultats */
  goals?: Goal[]
  /** Abonnement plateforme Stripe actif (ou tolérance) — sinon Accepter / Discuter restreints */
  coachHasPlatformAccess: boolean
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

function formatOfferPrice(
  request: PendingRequestWithAthlete,
  t: (key: string) => string
): string {
  if (request.offer_price === null || (request.offer_price_type === 'free') || request.offer_price === 0) {
    return t('pendingRequests.free')
  }
  if (request.offer_price_type === 'monthly') {
    return `${request.offer_price}€${t('pendingRequests.perMonth')}`
  }
  return `${request.offer_price}€`
}

export function PendingRequestTile({ request, goals = [], coachHasPlatformAccess }: PendingRequestTileProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmModal, setConfirmModal] = useState<'decline' | 'accept' | null>(null)
  const [subscribeOffersModalOpen, setSubscribeOffersModalOpen] = useState(false)
  const [respondError, setRespondError] = useState<string | null>(null)
  const [seeMoreModal, setSeeMoreModal] = useState<'objectifs' | 'resultats' | null>(null)
  const router = useRouter()
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('athletes')
  const tCoach = useTranslations('coachRequests')
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const tPlat = useTranslations('coachPlatform')
  const { openChatWithAthlete } = useOpenChat()

  const beginAcceptFlow = () => {
    setRespondError(null)
    if (!coachHasPlatformAccess) {
      setSubscribeOffersModalOpen(true)
      return
    }
    setConfirmModal('accept')
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcomingGoals = goals.filter((g) => g.date > today).sort((a, b) => b.date.localeCompare(a.date))
  const pastGoals = goals.filter((g) => g.date <= today).sort((a, b) => b.date.localeCompare(a.date))

  const name = request.athlete_name || request.athlete_email || '—'
  const sportValues = (request.sport_practiced || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const handleRespond = (accept: boolean) => {
    setRespondError(null)
    startTransition(async () => {
      const result = await respondToCoachRequest(request.id, accept, locale)
      if (result.error) {
        setRespondError(result.error)
        return
      }
      setRespondError(null)
      setConfirmModal(null)
      router.refresh()
    })
  }

  const offerLine = request.offer_title
    ? `${request.offer_title} — ${formatOfferPrice(request, t)}`
    : null

  const hasVolume =
    request.athlete_weekly_current_hours != null ||
    request.athlete_weekly_target_hours != null ||
    (request.athlete_weekly_volume_by_sport &&
      Object.keys(request.athlete_weekly_volume_by_sport).length > 0)
  const tProfile = useTranslations('profile')
  const tSports = useTranslations('sports')

  const vol = request.athlete_weekly_volume_by_sport
  const volumeEntries: {
    key: string
    sportLabel: string
    value: number
    suffix: string
    style: { borderLeft: string; badge: string; badgeBg: string }
    elevationValue?: number
  }[] = []
  if (vol && typeof vol === 'object') {
    for (const sport of WEEKLY_VOLUME_DISPLAY_ORDER) {
      if (sport === 'course_elevation_m') continue
      const v = vol[sport]
      if (v == null) continue
      const unit = getWeeklyVolumeUnit(sport)
      const suffix =
        unit === 'km' ? tProfile('suffixKmPerWeek') : unit === 'm' ? tProfile('suffixMPerWeek') : tProfile('suffixHoursPerWeek')
      const translationKey = getSportTranslationKey(sport)
      const sportLabel = translationKey ? tSports(translationKey as 'course') : sport
      const sportKey = sport as SportType
      const style = SPORT_CARD_STYLES[sportKey] ?? SPORT_CARD_STYLES.course
      const elevKey = getWeeklyVolumeTileElevationJsonKey(sport as WeeklyVolumeTileKey)
      const elevationValue =
        sport === 'course'
          ? (vol['course_elevation_m'] ?? undefined)
          : elevKey != null
            ? legacyWeeklyVolumeTileElevationValue(sport as WeeklyVolumeTileKey, vol, sportValues)
            : undefined
      volumeEntries.push({ key: sport, sportLabel, value: v, suffix, style, elevationValue })
    }
  }

  return (
    <li className="rounded-lg border border-l-4 border-l-palette-amber border-stone-200 bg-white p-4 shadow-sm">
      {/* En-tête : avatar, nom · offre sur une ligne, badges sport, boutons */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AvatarImage
            src={request.athlete_avatar_url}
            initials={getInitials(name)}
            className="w-12 h-12 flex-shrink-0 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <div className="min-w-0 truncate flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-stone-900 truncate">{name}</span>
              {offerLine && (
                <>
                  <span className="text-stone-400 shrink-0">·</span>
                  <span className="text-sm text-stone-500 truncate" title={offerLine}>
                    {offerLine}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {sportValues.map((sport) => (
                <Badge
                  key={sport}
                  sport={sport as Parameters<typeof Badge>[0]['sport']}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2 shrink-0 sm:ml-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={() => openChatWithAthlete(request.athlete_id)}
            className="whitespace-nowrap"
            disabled={isPending || !coachHasPlatformAccess}
            title={!coachHasPlatformAccess ? tPlat('chatDisabledHint') : undefined}
          >
            {t('pendingRequests.chat')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setRespondError(null)
              setConfirmModal('decline')
            }}
            disabled={isPending}
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={beginAcceptFlow}
            disabled={isPending}
          >
            {tCoach('accept')}
          </Button>
        </div>
      </div>

      {/* Corps : 2 colonnes — Message de l'athlète | Objectifs et volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100">
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            {t('pendingRequests.athleteMessageLabel')}
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap break-words min-h-[2.5rem] leading-relaxed">
            {request.coaching_need?.trim() || t('pendingRequests.notSpecified')}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            {t('pendingRequests.objectivesAndVolumeLabel')}
          </div>
          {!hasVolume ? (
            <p className="text-sm text-stone-500 italic">{t('pendingRequests.notSpecified')}</p>
          ) : (
            <div className="space-y-2.5">
              {request.athlete_weekly_current_hours != null && (
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-stone-100">
                  <span className="text-stone-400 shrink-0" aria-hidden>
                    <ClockIconSmall />
                  </span>
                  <span className="text-sm font-medium text-stone-800">
                    {t('pendingRequests.weeklyCurrentHoursLabel')} {request.athlete_weekly_current_hours} {tProfile('suffixHoursPerWeek')}
                  </span>
                </div>
              )}
              {request.athlete_weekly_target_hours != null && (
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-stone-100">
                  <span className="text-stone-400 shrink-0" aria-hidden>
                    <ClockIconSmall />
                  </span>
                  <span className="text-sm font-medium text-stone-800">
                    {t('pendingRequests.weeklyMaxHoursLabel')} {request.athlete_weekly_target_hours} {tProfile('suffixHoursPerWeek')}
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

      {/* Blocs Objectifs (à venir) et Résultats (passés) */}
      {(upcomingGoals.length > 0 || pastGoals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100">
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              {t('pendingRequests.goalsUpcoming')}
            </div>
            {upcomingGoals.length === 0 ? (
              <p className="text-sm text-stone-500 italic">{t('pendingRequests.noGoalsUpcoming')}</p>
            ) : (
              <div className="space-y-2">
                {upcomingGoals.slice(0, 5).map((goal) => {
                  const isPrimary = goal.is_primary
                  const dateBlock = formatGoalDateBlock(goal.date, localeTag)
                  return (
                    <TileCard key={goal.id} leftBorderColor={isPrimary ? 'amber' : 'sage'} className="py-2">
                      <div className="flex gap-2 items-start min-w-0">
                        <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg w-12 h-10 shrink-0">
                          <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.monthYear}</span>
                          <span className="text-sm font-bold text-stone-800">{dateBlock.day}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-stone-900 truncate">{goal.race_name}</span>
                            {isPrimary ? (
                              <span className="bg-white text-palette-amber text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-palette-amber shrink-0">
                                {tGoals('priority.primary')}
                              </span>
                            ) : (
                              <span className="bg-white text-palette-sage text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-palette-sage shrink-0">
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
                                <span>{formatTargetTime(goal)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TileCard>
                  )
                })}
                {upcomingGoals.length > 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => setSeeMoreModal('objectifs')}
                  >
                    {t('pendingRequests.seeMore', { count: upcomingGoals.length })}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {t('pendingRequests.goalsResults')}
            </div>
            {pastGoals.length === 0 ? (
              <p className="text-sm text-stone-500 italic">{t('pendingRequests.noGoalsResults')}</p>
            ) : (
              <div className="space-y-2">
                {pastGoals.slice(0, 5).map((goal) => {
                  const isPrimary = goal.is_primary
                  const dateBlock = formatGoalDateBlock(goal.date, localeTag)
                  return (
                    <TileCard key={goal.id} leftBorderColor="stone" borderLeftOnly className="py-2 opacity-90">
                      <div className="flex gap-2 items-start min-w-0">
                        <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg w-12 h-10 shrink-0">
                          <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.monthYear}</span>
                          <span className="text-sm font-bold text-stone-800">{dateBlock.day}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-stone-900 truncate">{goal.race_name}</span>
                            {isPrimary ? (
                              <span className="bg-white text-palette-amber text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-palette-amber shrink-0">
                                {tGoals('priority.primary')}
                              </span>
                            ) : (
                              <span className="bg-white text-palette-sage text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-palette-sage shrink-0">
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
                                <span>{formatTargetTime(goal)}</span>
                              </>
                            )}
                            {hasGoalResult(goal) && (
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
                {pastGoals.length > 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => setSeeMoreModal('resultats')}
                  >
                    {t('pendingRequests.seeMore', { count: pastGoals.length })}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4 sm:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={() => openChatWithAthlete(request.athlete_id)}
          className="w-full"
          disabled={isPending || !coachHasPlatformAccess}
          title={!coachHasPlatformAccess ? tPlat('chatDisabledHint') : undefined}
        >
          {t('pendingRequests.chat')}
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setRespondError(null)
              setConfirmModal('decline')
            }}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={beginAcceptFlow}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('accept')}
          </Button>
        </div>
      </div>

      <CoachPlatformSubscribeOffersModal
        isOpen={subscribeOffersModalOpen}
        onClose={() => setSubscribeOffersModalOpen(false)}
        introSlot={<p className="text-sm text-stone-600">{tPlat('paywallModalBody')}</p>}
      />

      <Modal
        isOpen={confirmModal === 'decline'}
        onClose={() => {
          setRespondError(null)
          setConfirmModal(null)
        }}
        size="sm"
        title={tCoach('confirmDeclineTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => {
                setRespondError(null)
                setConfirmModal(null)
              }}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              disabled={isPending}
              onClick={() => handleRespond(false)}
            >
              {tCoach('decline')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">{tCoach('confirmDeclineBody')}</p>
          {respondError ? (
            <p className="mt-2 text-sm text-palette-danger" role="alert">
              {respondError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal === 'accept'}
        onClose={() => {
          setRespondError(null)
          setConfirmModal(null)
        }}
        size="sm"
        title={tCoach('confirmAcceptTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => {
                setRespondError(null)
                setConfirmModal(null)
              }}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              disabled={isPending}
              onClick={() => handleRespond(true)}
            >
              {tCoach('accept')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">{tCoach('confirmAcceptBody')}</p>
          {respondError ? (
            <p className="mt-2 text-sm text-palette-danger" role="alert">
              {respondError}
            </p>
          ) : null}
        </div>
      </Modal>

      {seeMoreModal === 'objectifs' && (
        <RequestGoalsListModal
          isOpen={true}
          onClose={() => setSeeMoreModal(null)}
          goals={upcomingGoals}
          title={t('pendingRequests.goalsUpcoming')}
        />
      )}
      {seeMoreModal === 'resultats' && (
        <RequestGoalsListModal
          isOpen={true}
          onClose={() => setSeeMoreModal(null)}
          goals={pastGoals}
          title={t('pendingRequests.goalsResults')}
        />
      )}
    </li>
  )
}
