'use client'

/**
 * Showcase des tuiles Coach et Athlète du design system.
 * Même structure UI : carte rounded-2xl, header (avatar + nom), badges, contenu, footer.
 */

import { CoachTile } from '@/components/CoachTile'
import { AthleteTile } from '@/components/AthleteTile'
import { Button } from '@/components/Button'

const COACH_OFFERS = [
  { id: '1', title: 'Suivi découverte', price: 0, priceType: 'free' as const, isFeatured: false },
  { id: '2', title: 'Suivi mensuel', price: 49, priceType: 'monthly' as const, isFeatured: true },
  { id: '3', title: 'Plan 12 semaines', price: 120, priceType: 'one_time' as const, isFeatured: false },
]

export function PersonTileShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-2">
          Tuile Coach (CoachTile)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Utilisée dans la page « Trouver un coach ». Avatar, nom, note/avis ou « Nouveau », sports coachés, bio courte, offres (optionnel), footer avec action.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
          <CoachTile
            fullName="Marie Dupont"
            email="marie@example.com"
            coachedSports={['course', 'trail']}
            bio="Ancienne athlète de haut niveau, je vous accompagne vers vos objectifs course et trail avec un suivi personnalisé et des plans adaptés à votre niveau."
            rating={{ averageRating: 4.8, reviewCount: 24 }}
            offers={COACH_OFFERS}
            footer={
              <Button type="button" variant="outline" className="w-full">
                Voir détails
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            }
            labels={{
              new: 'Nouveau',
              reviews: 'avis',
              availableOffers: 'Offres disponibles',
              free: 'Gratuit',
              perMonth: 'mois',
              plan: 'forfait',
            }}
          />
          <CoachTile
            fullName="Thomas Martin"
            email="thomas@example.com"
            coachedSports={['velo', 'triathlon']}
            bio="Coach diplômé, spécialisé vélo et triathlon. Préparation Ironman et objectifs longue distance."
            offers={[
              { id: 'a', title: 'Mensuel vélo', price: 39, priceType: 'monthly', isFeatured: true },
            ]}
            footer={
              <Button type="button" variant="outline" className="w-full">
                Voir détails
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            }
            labels={{
              new: 'Nouveau',
              reviews: 'avis',
              availableOffers: 'Offres disponibles',
              free: 'Gratuit',
              perMonth: 'mois',
              plan: 'forfait',
            }}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-stone-200">
        <h3 className="text-base font-semibold text-stone-800 mb-2">
          Tuile Athlète (AthleteTile)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Utilisée dans la page « Mes athlètes » (vue coach). Même style de carte : avatar, nom, sports pratiqués, prochain objectif, planifié jusqu’à + indicateur à jour/en retard, footer avec action.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
          <AthleteTile
            displayName="Lucas Bernard"
            practicedSports={['course', 'trail']}
            nextGoal={{ date: '7 avr.', raceName: 'Marathon de Paris' }}
            plannedUntil="15 mars"
            isUpToDate={true}
            footer={
              <a
                href="#"
                className="text-xs font-medium text-palette-forest-dark hover:text-palette-forest-darker flex items-center justify-end transition-transform group-hover:translate-x-1"
              >
                Voir le planning
                <svg className="w-4 h-4 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            }
            labels={{
              nextGoal: 'Prochain objectif',
              noGoal: 'Aucun objectif',
              plannedUntil: 'Planifié jusqu\'au',
              upToDate: 'À jour',
              late: 'En retard',
            }}
          />
          <AthleteTile
            displayName="Sophie Leroy"
            practicedSports={['velo', 'natation', 'course']}
            nextGoal={{ date: '23 mar.', raceName: 'Semi-marathon de Lyon' }}
            plannedUntil="28 fév."
            isUpToDate={false}
            footer={
              <a
                href="#"
                className="text-xs font-medium text-palette-forest-dark hover:text-palette-forest-darker flex items-center justify-end transition-transform group-hover:translate-x-1"
              >
                Voir le planning
                <svg className="w-4 h-4 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            }
            labels={{
              nextGoal: 'Prochain objectif',
              noGoal: 'Aucun objectif',
              plannedUntil: 'Planifié jusqu\'au',
              upToDate: 'À jour',
              late: 'En retard',
            }}
          />
          <AthleteTile
            displayName="Jean Petit"
            practicedSports={['course']}
            plannedUntil="—"
            footer={
              <a
                href="#"
                className="text-xs font-medium text-palette-forest-dark hover:text-palette-forest-darker flex items-center justify-end transition-transform group-hover:translate-x-1"
              >
                Voir le planning
                <svg className="w-4 h-4 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            }
            labels={{
              nextGoal: 'Prochain objectif',
              noGoal: 'Aucun objectif',
              plannedUntil: 'Planifié jusqu\'au',
              upToDate: 'À jour',
              late: 'En retard',
            }}
          />
        </div>
      </div>
    </div>
  )
}
