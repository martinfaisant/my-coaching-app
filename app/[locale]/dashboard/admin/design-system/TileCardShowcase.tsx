'use client'

import { useState } from 'react'
import { TileCard, type TileCardBorderColor } from '@/components/TileCard'
import { Button } from '@/components/Button'

const BORDER_COLORS: { value: TileCardBorderColor; label: string; usage: string }[] = [
  { value: 'amber', label: 'amber', usage: 'Objectif principal' },
  { value: 'sage', label: 'sage', usage: 'Objectif secondaire' },
  { value: 'forest', label: 'forest', usage: 'Entraînement / action principale' },
  { value: 'strava', label: 'strava', usage: 'Activité Strava' },
  { value: 'gold', label: 'gold', usage: 'Trail, ski de randonnée' },
  { value: 'olive', label: 'olive', usage: 'Vélo, secondaire' },
  { value: 'stone', label: 'stone', usage: 'Archivé / terminé (offres archivées, historique souscriptions)' },
]

export function TileCardShowcase() {
  const [clickedId, setClickedId] = useState<string | null>(null)

  const handleClick = (id: string) => {
    setClickedId(id)
    setTimeout(() => setClickedId(null), 1200)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Variantes de bordure gauche
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Même style de tour que les tuiles de la modale « Activités du jour ». Chaque couleur correspond à un usage (objectif, sport, Strava, etc.).
        </p>
        <div className="space-y-3 max-w-md">
          {BORDER_COLORS.map(({ value, label, usage }) => (
            <TileCard key={value} leftBorderColor={value}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg w-12 h-12 shrink-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Jan</span>
                  <span className="text-lg font-bold text-stone-800">15</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-stone-900">
                    Exemple {label}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{usage}</div>
                </div>
              </div>
            </TileCard>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-stone-200">
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Carte cliquable (interactive)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Avec <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">interactive</code> et <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">as=&quot;button&quot;</code> : même hover que ActivityTile (léger lift + ombre).
        </p>
        <div className="space-y-3 max-w-md">
          <TileCard
            leftBorderColor="amber"
            interactive
            as="button"
            onClick={() => handleClick('goal-primary')}
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 inline-flex items-center justify-center text-palette-amber bg-palette-amber/10 px-2 py-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-stone-900">Marathon de Paris</div>
                <div className="text-xs text-stone-500 mt-0.5">42 km · Dim. 7 avr.</div>
              </div>
            </div>
          </TileCard>
          {clickedId === 'goal-primary' && (
            <p className="text-xs text-amber-600 font-medium">✓ Cliqué sur la carte objectif</p>
          )}

          <TileCard
            leftBorderColor="sage"
            interactive
            as="button"
            onClick={() => handleClick('goal-secondary')}
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 inline-flex items-center justify-center text-palette-sage bg-palette-sage/10 px-2 py-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-stone-900">Semi-marathon de Lyon</div>
                <div className="text-xs text-stone-500 mt-0.5">21,1 km · Sam. 23 mar.</div>
              </div>
            </div>
          </TileCard>
          {clickedId === 'goal-secondary' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur la carte objectif secondaire</p>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-stone-200">
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Avec bouton à droite (vue objectifs / athlète)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Contenu à gauche (date, titre, badge priorité, distance) et à droite un indicateur (ex. J-45) + bouton Supprimer. <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">as=&quot;div&quot;</code> pour que le bouton soit cliquable indépendamment.
        </p>
        <div className="space-y-3 max-w-xl">
          <TileCard leftBorderColor="amber">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4 items-center min-w-0">
                <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-14 h-14 shrink-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Avr.</span>
                  <span className="text-xl font-bold text-stone-800">7</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-stone-900 truncate">Marathon de Paris</h3>
                    <span className="bg-palette-amber/10 text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                      Principal
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone-500 font-medium">
                    <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>42 km</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-3 py-1 rounded-lg">
                  J-45
                </span>
                <Button
                  type="button"
                  variant="danger"
                  className="p-2"
                  title="Supprimer l'objectif"
                  onClick={() => handleClick('delete-1')}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TileCard>
          {clickedId === 'delete-1' && (
            <p className="text-xs text-amber-600 font-medium">✓ Clic sur Supprimer</p>
          )}

          <TileCard leftBorderColor="sage">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4 items-center min-w-0">
                <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-14 h-14 shrink-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Mar.</span>
                  <span className="text-xl font-bold text-stone-800">23</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-stone-900 truncate">Semi-marathon de Lyon</h3>
                    <span className="bg-palette-sage/10 text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                      Secondaire
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-stone-500 font-medium">
                    <MapIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>21,1 km</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-palette-forest-dark bg-palette-forest-dark/10 px-3 py-1 rounded-lg">
                  J-62
                </span>
                <Button
                  type="button"
                  variant="danger"
                  className="p-2"
                  title="Supprimer l'objectif"
                  onClick={() => handleClick('delete-2')}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TileCard>
          {clickedId === 'delete-2' && (
            <p className="text-xs text-green-600 font-medium">✓ Clic sur Supprimer</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MapIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
