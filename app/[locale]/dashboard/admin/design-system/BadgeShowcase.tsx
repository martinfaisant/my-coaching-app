'use client'

import { useState } from 'react'
import { Badge } from '@/components/Badge'
import type { SportType } from '@/lib/sportStyles'
import { SPORT_ICONS } from '@/lib/sportStyles'
import { useSportLabel } from '@/lib/hooks/useSportLabel'

/** Sports du calendrier + profil — icônes et couleurs alignés (lib/sportStyles). */
const SPORTS: SportType[] = [
  'course',
  'velo',
  'natation',
  'musculation',
  'trail',
  'randonnee',
  'triathlon',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
]

const DEMO_SPORTS: SportType[] = ['course', 'velo', 'natation', 'trail', 'triathlon']

function TileDemo() {
  const getSportLabel = useSportLabel()
  const [selected, setSelected] = useState<Set<SportType>>(new Set(['course', 'velo']))
  const toggle = (sport: SportType) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(sport)) next.delete(sport)
      else next.add(sport)
      return next
    })
  return (
    <div className="flex flex-wrap gap-2">
      {DEMO_SPORTS.map((sport) => {
        const Icon = SPORT_ICONS[sport]
        const label = getSportLabel(sport)
        const isSelected = selected.has(sport)
        return (
          <button
            key={sport}
            type="button"
            onClick={() => toggle(sport)}
            className={`px-4 py-2 rounded-full border text-sm font-medium select-none flex items-center gap-2 transition-all ${
              isSelected
                ? 'border-palette-forest-dark bg-palette-forest-dark text-white shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]'
                : 'border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function BadgeShowcase() {
  const getSportLabel = useSportLabel()
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Variantes de base
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col gap-1">
            <code className="text-xs font-mono text-stone-500">default</code>
            <Badge variant="default">Langue</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <code className="text-xs font-mono text-stone-500">primary</code>
            <Badge variant="primary">Recommandé</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <code className="text-xs font-mono text-stone-500">success</code>
            <Badge variant="success">Complété</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <code className="text-xs font-mono text-stone-500">warning</code>
            <Badge variant="warning">En attente</Badge>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Variantes sport
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Icônes et couleurs : course (forest), vélo (olive), natation (sky), musculation (stone), trail (gold, montagne), randonnée (sage, randonneur), triathlon (amber), ski (sage/gold), patin (cyan).
        </p>
        <div className="flex flex-wrap gap-3">
          {SPORTS.map((sport) => (
            <div key={sport} className="flex flex-col gap-1">
              <code className="text-xs font-mono text-stone-500">sport=&quot;{sport}&quot;</code>
              <Badge sport={sport} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Exemples en contexte
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-stone-500 mb-2">Sports coachés (profil, cartes)</p>
            <div className="flex flex-wrap gap-2">
              <Badge sport="course" />
              <Badge sport="velo" />
              <Badge sport="triathlon" />
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-2">Langues (profil)</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Français</Badge>
              <Badge variant="default">English</Badge>
              <Badge variant="primary">Español</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-2">Objectifs (Principal / Secondaire)</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">Principal</Badge>
              <Badge variant="sport-natation">Secondaire</Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-4">
          Tuiles sport cliquables (profil coach)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          États pour tuiles sélectionnables : statique (affichage seul), cliquable non sélectionné, sélectionné.
        </p>
        <div className="space-y-8">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">État statique (non cliquable)</p>
            <p className="text-xs text-stone-500 mb-2">Badge simple, affichage uniquement (cartes coach, listes).</p>
            <div className="flex flex-wrap gap-2">
              <Badge sport="course" />
              <Badge sport="velo" />
              <Badge sport="natation" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Cliquable non sélectionné</p>
            <p className="text-xs text-stone-500 mb-2">Hover : bordure forest. Classes : border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark</p>
            <div className="flex flex-wrap gap-2">
              {(['course', 'velo', 'natation'] as SportType[]).map((sport) => {
                const Icon = SPORT_ICONS[sport]
                const label = getSportLabel(sport)
                return (
                  <div
                    key={sport}
                    className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark transition-all text-sm font-medium select-none flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Sélectionné</p>
            <p className="text-xs text-stone-500 mb-2">Fond forest, texte blanc. Classes : bg-palette-forest-dark text-white border-palette-forest-dark shadow-sm</p>
            <div className="flex flex-wrap gap-2">
              {(['course', 'velo'] as SportType[]).map((sport) => {
                const Icon = SPORT_ICONS[sport]
                const label = getSportLabel(sport)
                return (
                  <div
                    key={sport}
                    className="px-4 py-2 rounded-full border border-palette-forest-dark bg-palette-forest-dark text-white shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)] text-sm font-medium select-none flex items-center gap-2"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </div>
                )
              })}
              {/* Non sélectionné à côté pour contraste */}
              <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium select-none flex items-center gap-2">
                <SPORT_ICONS.natation className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>{getSportLabel('natation')}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Démo interactive</p>
            <p className="text-xs text-stone-500 mb-2">Cliquez pour sélectionner/désélectionner (profil coach, FindCoachSection).</p>
            <TileDemo />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-700 space-y-4">
        <div>
          <p className="font-medium mb-2">Badge :</p>
          <pre className="overflow-x-auto text-xs">{`<Badge variant="default">Langue</Badge>
<Badge sport="course" />`}</pre>
        </div>
        <div>
          <p className="font-medium mb-2">Tuile cliquable (profil coach) :</p>
          <pre className="overflow-x-auto text-xs">{`<SportTileSelectable
  value="course"
  name="coached_sports"
  defaultChecked={coachedSports.includes('course')}
/>
// Ou mode contrôlé (filtres) :
<SportTileSelectable
  value="course"
  selected={selectedSports.includes('course')}
  onChange={() => toggleSport('course')}
/>`}</pre>
        </div>
      </div>
    </div>
  )
}
