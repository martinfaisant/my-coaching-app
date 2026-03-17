'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { TileCard } from '@/components/TileCard'
import type { Goal } from '@/types/database'
import {
  hasGoalResult,
  hasTargetTime,
  formatTargetTime,
  formatGoalResultTime,
  formatGoalResultPlaceOrdinal,
} from '@/lib/goalResultUtils'

const MapIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
)

const ClockIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

function formatDateBlock(dateStr: string, localeTag: string): { month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const month = date.toLocaleDateString(localeTag, { month: 'short' })
  const day = date.getDate().toString()
  return { month: month.charAt(0).toUpperCase() + month.slice(1), day }
}

type RequestGoalsListModalProps = {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  /** Override modal title (e.g. findCoach.requestGoals.seeMoreModalTitle). */
  title?: string
  /** Niveau d'empilement (layer=1 quand ouverte au-dessus d'une autre modale, ex. détail coach). */
  layer?: number
}

export function RequestGoalsListModal({ isOpen, onClose, goals, title: titleOverride, layer = 0 }: RequestGoalsListModalProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const tGoals = useTranslations('goals')

  const today = new Date().toISOString().slice(0, 10)

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layer={layer}
      size="lg"
      title={titleOverride ?? tGoals('title')}
      titleWrap
    >
      <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-3">
        {goals.length === 0 ? (
          <p className="text-sm text-stone-500">{tGoals('noGoals')}</p>
        ) : (
          goals.map((goal) => {
            const isPast = goal.date <= today
            const isPrimary = goal.is_primary
            const isResult = isPast
            const dateBlock = formatDateBlock(goal.date, localeTag)

            return (
              <TileCard
                key={goal.id}
                leftBorderColor={isResult ? 'stone' : isPrimary ? 'amber' : 'sage'}
                borderLeftOnly={isResult}
                className={isPast ? 'opacity-75' : ''}
              >
                <div className="flex gap-4 items-start min-w-0">
                  <div className={`flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-14 h-14 shrink-0 ${isPast ? 'opacity-75' : ''}`}>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.month}</span>
                    <span className="text-xl font-bold text-stone-800">{dateBlock.day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-base font-bold truncate ${isPast ? 'text-stone-700' : 'text-stone-900'}`}>
                        {goal.race_name}
                      </h3>
                      {isPrimary ? (
                        <span className="bg-white text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                          {tGoals('priority.primary')}
                        </span>
                      ) : (
                        <span className="bg-white text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                          {tGoals('priority.secondary')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-stone-500 font-medium flex-wrap">
                      <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{goal.distance} km</span>
                      {hasTargetTime(goal) && (
                        <>
                          <span className="text-stone-400">·</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            {isPast && hasGoalResult(goal) ? (
                              <span>{tGoals('targetTimeLabel')} {formatTargetTime(goal)} · {tGoals('achieved')} {formatGoalResultTime(goal)}</span>
                            ) : (
                              <span>{tGoals('targetTimeLabel')} : {formatTargetTime(goal)}</span>
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
                    {isPast && !hasGoalResult(goal) && (
                      <p className="text-xs text-stone-400 mt-1">{tGoals('result.noResult')}</p>
                    )}
                  </div>
                </div>
              </TileCard>
            )
          })
        )}
      </div>
    </Modal>
  )
}
