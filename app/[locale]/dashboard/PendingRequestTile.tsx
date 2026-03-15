'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { AvatarImage } from '@/components/AvatarImage'
import { Modal } from '@/components/Modal'
import { useOpenChat } from '@/contexts/OpenChatContext'
import { getInitials } from '@/lib/stringUtils'
import { getWeeklyVolumeUnit, SPORT_ICONS, SPORT_CARD_STYLES } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'
import { respondToCoachRequest } from '@/app/[locale]/dashboard/actions'
import type { PendingRequestWithAthlete } from '@/app/[locale]/dashboard/actions'

type PendingRequestTileProps = {
  request: PendingRequestWithAthlete
}

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

export function PendingRequestTile({ request }: PendingRequestTileProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmModal, setConfirmModal] = useState<'decline' | 'accept' | null>(null)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('athletes')
  const tCoach = useTranslations('coachRequests')
  const tCommon = useTranslations('common')
  const { openChatWithAthlete } = useOpenChat()

  const name = request.athlete_name || request.athlete_email || '—'
  const sportValues = (request.sport_practiced || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const handleRespond = (accept: boolean) => {
    startTransition(async () => {
      const result = await respondToCoachRequest(request.id, accept, locale)
      if (result.error) {
        alert(result.error)
        return
      }
      setConfirmModal(null)
      router.refresh()
    })
  }

  const offerLine = request.offer_title
    ? `${request.offer_title} — ${formatOfferPrice(request, t)}`
    : null

  const hasVolume =
    request.athlete_weekly_target_hours != null ||
    (request.athlete_weekly_volume_by_sport &&
      Object.keys(request.athlete_weekly_volume_by_sport).length > 0)
  const tProfile = useTranslations('profile')
  const tSports = useTranslations('sports')
  const DISPLAY_ORDER = ['course', 'course_elevation_m', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const
  const sportLabelKey: Record<string, string> = {
    course: 'course',
    velo: 'velo',
    natation: 'natation',
    musculation: 'muscu',
    trail: 'trail',
    triathlon: 'triathlon',
  }

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
    for (const sport of DISPLAY_ORDER) {
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
              <span className="font-semibold text-stone-900 truncate">{name}</span>
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
          >
            {t('pendingRequests.chat')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmModal('decline')}
            disabled={isPending}
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setConfirmModal('accept')}
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
              {request.athlete_weekly_target_hours != null && (
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-stone-100">
                  <span className="text-stone-400 shrink-0" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-stone-800">
                    {request.athlete_weekly_target_hours} {tProfile('suffixHoursPerWeek')}
                  </span>
                </div>
              )}
              {volumeEntries.map(({ key, sportLabel, value, suffix, style, elevationValue }) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 py-1.5 pl-2.5 pr-2.5 rounded-lg border-l-4 ${style.borderLeft} ${style.badgeBg} border border-stone-100`}
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

      <div className="flex flex-col gap-2 mt-4 sm:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={() => openChatWithAthlete(request.athlete_id)}
          className="w-full"
        >
          {t('pendingRequests.chat')}
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmModal('decline')}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setConfirmModal('accept')}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('accept')}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={confirmModal === 'decline'}
        onClose={() => setConfirmModal(null)}
        size="sm"
        title={tCoach('confirmDeclineTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => setConfirmModal(null)}
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
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal === 'accept'}
        onClose={() => setConfirmModal(null)}
        size="sm"
        title={tCoach('confirmAcceptTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => setConfirmModal(null)}
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
        </div>
      </Modal>
    </li>
  )
}
