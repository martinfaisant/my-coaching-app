'use client'

/**
 * AthleteTile — Tuile athlète du design system.
 * Même structure visuelle que CoachTile : carte rounded-2xl, header (avatar + nom),
 * badges sports, zone contenu (objectif + planifié jusqu’à), footer d’action.
 * Utilisé dans la page « Mes athlètes » (vue coach).
 */

import { Badge } from '@/components/Badge'
import { getInitials } from '@/lib/stringUtils'

export type AthleteTileNextGoal = {
  date: string
  raceName: string
}

export type AthleteTileProps = {
  /** URL de l’avatar ou null pour initiales */
  avatarUrl?: string | null
  /** Nom affiché (fallback: email) */
  displayName: string
  /** Sports pratiqués (valeurs pour Badge) */
  practicedSports: string[]
  /** Prochain objectif (date + nom course) */
  nextGoal?: AthleteTileNextGoal | null
  /** Date jusqu’à laquelle le planning est planifié */
  plannedUntil?: string | null
  /** Indicateur à jour / en retard */
  isUpToDate?: boolean
  /** Contenu du footer (lien « Voir le planning », etc.) */
  footer: React.ReactNode
  /** Titre de la souscription active (affiché sous le nom avec flèche, clic → détail) */
  subscriptionTitle?: string | null
  /** Appelé au clic sur la ligne souscription (ouvrir détail en modale) */
  onSubscriptionClick?: () => void
  /** Labels optionnels (pour i18n côté appelant) */
  labels?: {
    nextGoal?: string
    noGoal?: string
    plannedUntil?: string
    upToDate?: string
    late?: string
  }
}

const cardClasses =
  'bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-palette-forest-dark/30 transition-all flex flex-col overflow-hidden group h-full'

export function AthleteTile({
  avatarUrl,
  displayName,
  practicedSports,
  nextGoal,
  plannedUntil,
  isUpToDate = true,
  footer,
  subscriptionTitle,
  onSubscriptionClick,
  labels = {},
}: AthleteTileProps) {
  const {
    nextGoal: nextGoalLabel = 'Prochain objectif',
    noGoal: noGoalLabel = 'Aucun objectif',
    plannedUntil: plannedUntilLabel = 'Planifié jusqu\'au',
    upToDate: upToDateLabel = 'À jour',
    late: lateLabel = 'En retard',
  } = labels

  return (
    <article className={cardClasses}>
      <div className="p-6 flex flex-col flex-grow">
        {/* Header: avatar + nom (même disposition que CoachTile) */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {avatarUrl?.trim() ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-100 group-hover:ring-palette-forest-dark/20 transition-all"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-palette-olive text-white flex items-center justify-center text-base font-bold ring-2 ring-stone-100 group-hover:ring-palette-forest-dark/20 transition-all">
                  {getInitials(displayName)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg leading-tight text-stone-900 group-hover:text-palette-forest-dark transition-colors">
                {displayName}
              </h3>
              {subscriptionTitle && (
                onSubscriptionClick ? (
                  <button
                    type="button"
                    onClick={onSubscriptionClick}
                    className="mt-1.5 flex items-center gap-1 text-sm font-medium text-palette-forest-dark hover:text-palette-forest-darker transition-colors text-left w-full min-w-0"
                  >
                    <span className="truncate">{subscriptionTitle}</span>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <p className="mt-1.5 text-sm font-medium text-palette-forest-dark truncate">
                    {subscriptionTitle}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Tags sports (même ligne que CoachTile) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {practicedSports.map((sportValue) => (
            <Badge key={sportValue} sport={sportValue as Parameters<typeof Badge>[0]['sport']} />
          ))}
        </div>

        {/* Contenu: objectif + planifié (grille 2 colonnes, comme la tuile actuelle mais dans le même style carte) */}
        <div className="grid grid-cols-2 gap-4 text-sm flex-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{nextGoalLabel}</p>
            <p className="text-stone-900 mt-0.5">
              {nextGoal ? `${nextGoal.date} · ${nextGoal.raceName}` : noGoalLabel}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{plannedUntilLabel}</p>
            <p className="text-stone-900 font-semibold mt-0.5 text-sm">
              {plannedUntil ?? '—'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isUpToDate ? 'bg-emerald-500' : 'bg-red-400'
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isUpToDate ? 'text-stone-500' : 'text-red-400'
                }`}
              >
                {isUpToDate ? upToDateLabel : lateLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (même zone que CoachTile) */}
      <div className="p-4 border-t border-stone-100 bg-stone-50 mt-auto w-full">
        {footer}
      </div>
    </article>
  )
}
