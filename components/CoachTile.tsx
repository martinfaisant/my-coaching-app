'use client'

/**
 * CoachTile — Tuile coach du design system.
 * Même structure visuelle que AthleteTile : carte rounded-2xl, header (avatar + nom),
 * badges sports, zone contenu (bio + offres), footer d’action.
 * Utilisé dans la page « Trouver un coach ».
 */

import { Badge } from '@/components/Badge'
import { getInitials } from '@/lib/stringUtils'

export type CoachTileOffer = {
  id: string
  title: string
  price: number
  priceType: 'free' | 'monthly' | 'one_time'
  isFeatured?: boolean
}

export type CoachTileProps = {
  /** URL de l’avatar ou null pour initiales */
  avatarUrl?: string | null
  /** Nom affiché (fallback: email) */
  fullName: string | null
  email: string
  /** Sports coachés (valeurs pour Badge) */
  coachedSports: string[]
  /** Bio courte (3 lignes max en line-clamp) */
  bio: string
  /** Note moyenne et nombre d’avis ; si absent, affiche un badge « Nouveau » */
  rating?: { averageRating: number; reviewCount: number } | null
  /** Offres à afficher (max 3 en liste) */
  offers?: CoachTileOffer[]
  /** Contenu du footer (bouton « Voir détails », etc.) */
  footer: React.ReactNode
  /** Labels optionnels (pour i18n côté appelant) */
  labels?: {
    new?: string
    reviews?: string
    availableOffers?: string
    free?: string
    perMonth?: string
    plan?: string
  }
}

const cardClasses =
  'bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-palette-forest-dark/30 transition-all flex flex-col overflow-hidden group h-full'

export function CoachTile({
  avatarUrl,
  fullName,
  email,
  coachedSports,
  bio,
  rating,
  offers = [],
  footer,
  labels = {},
}: CoachTileProps) {
  const displayName = (fullName ?? '').trim() || email
  const initials = getInitials(displayName)
  const hasReviews = rating && rating.reviewCount > 0
  const {
    new: newLabel = 'Nouveau',
    reviews: reviewsLabel = 'avis',
    availableOffers: availableOffersLabel = 'Offres disponibles',
    free: freeLabel = 'Gratuit',
    perMonth: perMonthLabel = 'mois',
    plan: planLabel = 'forfait',
  } = labels

  return (
    <article className={cardClasses}>
      <div className="p-6 flex flex-col flex-grow">
        {/* Header: avatar + nom + note / nouveau */}
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
                  {initials}
                </div>
              )}
              {hasReviews && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-stone-900 group-hover:text-palette-forest-dark transition-colors">
                {displayName}
              </h3>
              {hasReviews ? (
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                  <span className="text-amber-500 font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-current mr-0.5" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating!.averageRating}
                  </span>
                  <span>({rating!.reviewCount} {reviewsLabel})</span>
                </div>
              ) : (
                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{newLabel}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tags sports */}
        <div className="flex flex-wrap gap-2 mb-4">
          {coachedSports.map((sportValue) => (
            <Badge key={sportValue} sport={sportValue as Parameters<typeof Badge>[0]['sport']} />
          ))}
        </div>

        {/* Bio (3 lignes) */}
        <p className="text-sm text-stone-500 leading-relaxed line-clamp-3 mb-5 flex-1 pb-0.5">
          {bio}
        </p>

        {/* Bloc offres */}
        {offers.length > 0 && (
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-2">
            <div className="mb-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{availableOffersLabel}</p>
            </div>
            <div className="space-y-2.5">
              {offers.slice(0, 3).map((offer) => {
                const isFree = offer.priceType === 'free'
                const isMonthly = offer.priceType === 'monthly'
                const isFeatured = offer.isFeatured
                const dotColor = isFeatured ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : isMonthly ? 'bg-blue-500' : 'bg-stone-400'
                return (
                  <div key={offer.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className={`text-xs ${isFeatured ? 'font-semibold text-stone-700' : 'font-medium text-stone-600'}`}>{offer.title}</span>
                    </div>
                    <div className="text-right">
                      {isFree ? (
                        <span className="text-xs font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-1.5 py-0.5 rounded">{freeLabel}</span>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-stone-900">{offer.price}€</span>
                          <span className="text-[10px] text-stone-400">/{isMonthly ? perMonthLabel : planLabel}</span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer (bouton pleine largeur) */}
      <div className="p-4 border-t border-stone-100 bg-stone-50 mt-auto w-full [&_button]:w-full">
        {footer}
      </div>
    </article>
  )
}
