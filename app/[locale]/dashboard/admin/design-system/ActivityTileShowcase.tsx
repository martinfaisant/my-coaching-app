'use client'

import { useState } from 'react'
import { ActivityTile } from '@/components/ActivityTile'

export function ActivityTileShowcase() {
  const [clickedTile, setClickedTile] = useState<string | null>(null)

  const handleClick = (tileId: string) => {
    setClickedTile(tileId)
    setTimeout(() => setClickedTile(null), 1000)
  }

  return (
    <div className="space-y-8">
      {/* Section Entraînements */}
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Entraînements planifiés
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Tuiles pour entraînements créés par le coach. La couleur de la bordure et de l&apos;icône s&apos;adapte au type de sport.
        </p>
        <div className="space-y-3">
          <ActivityTile
            type="workout"
            sportType="course"
            title="Sortie longue en endurance"
            metadata={["1h30", "15 km", "200m D+"]}
            date="Lun. 12 fév."
            onClick={() => handleClick('workout-1')}
          />
          {clickedTile === 'workout-1' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur l&apos;entraînement course</p>
          )}

          <ActivityTile
            type="workout"
            sportType="velo"
            title="Intervalles VMA"
            metadata={["45'", "8 × 400m"]}
            date="Mar. 13 fév."
            onClick={() => handleClick('workout-2')}
          />
          {clickedTile === 'workout-2' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur l&apos;entraînement vélo</p>
          )}

          <ActivityTile
            type="workout"
            sportType="natation"
            title="Technique crawl"
            metadata={["2000 m", "Éducatifs"]}
            date="Mer. 14 fév."
            onClick={() => handleClick('workout-3')}
          />
          {clickedTile === 'workout-3' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur l&apos;entraînement natation</p>
          )}

          <ActivityTile
            type="workout"
            sportType="musculation"
            title="Renforcement core"
            metadata={["30'", "Gainage + exercices"]}
            date="Jeu. 15 fév."
            onClick={() => handleClick('workout-4')}
          />
          {clickedTile === 'workout-4' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur l&apos;entraînement musculation</p>
          )}
        </div>
      </div>

      {/* Section Strava */}
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Activités Strava importées
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Tuiles pour activités synchronisées depuis Strava. Bordure orange Strava avec badge du type d&apos;activité.
        </p>
        <div className="space-y-3">
          <ActivityTile
            type="strava"
            activityLabel="Run"
            title="Morning run"
            metadata={["10.5 km", "150m D+", "50:24"]}
            date="Sam. 10 fév."
            onClick={() => handleClick('strava-1')}
          />
          {clickedTile === 'strava-1' && (
            <p className="text-xs text-orange-600 font-medium">✓ Cliqué sur l&apos;activité Strava Run</p>
          )}

          <ActivityTile
            type="strava"
            activityLabel="Ride"
            title="Col de la Colombière"
            metadata={["45 km", "1200m D+", "2h15:42"]}
            date="Dim. 11 fév."
            onClick={() => handleClick('strava-2')}
          />
          {clickedTile === 'strava-2' && (
            <p className="text-xs text-orange-600 font-medium">✓ Cliqué sur l&apos;activité Strava Ride</p>
          )}

          <ActivityTile
            type="strava"
            activityLabel="Swim"
            title="Séance piscine"
            metadata={["2500 m", "55:12"]}
            date="Ven. 9 fév."
            onClick={() => handleClick('strava-3')}
          />
          {clickedTile === 'strava-3' && (
            <p className="text-xs text-orange-600 font-medium">✓ Cliqué sur l&apos;activité Strava Swim</p>
          )}
        </div>
      </div>

      {/* Section Objectifs */}
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Objectifs de course
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Tuiles pour objectifs de compétition. Couleur amber pour objectif principal, sage pour objectif secondaire.
        </p>
        <div className="space-y-3">
          <ActivityTile
            type="goal"
            isPrimary={true}
            isResult={false}
            title="Marathon de Paris"
            distance={42.2}
            date="Dim. 7 avr."
            onClick={() => handleClick('goal-1')}
          />
          {clickedTile === 'goal-1' && (
            <p className="text-xs text-amber-600 font-medium">✓ Cliqué sur l&apos;objectif principal</p>
          )}

          <ActivityTile
            type="goal"
            isPrimary={false}
            isResult={false}
            title="Semi-marathon de Lyon"
            distance={21.1}
            date="Sam. 23 mar."
            onClick={() => handleClick('goal-2')}
          />
          {clickedTile === 'goal-2' && (
            <p className="text-xs text-green-600 font-medium">✓ Cliqué sur l&apos;objectif secondaire</p>
          )}

          <ActivityTile
            type="goal"
            isPrimary={true}
            isResult={false}
            title="Ironman Nice"
            distance={180}
            date="Dim. 23 juin"
            onClick={() => handleClick('goal-3')}
          />
          {clickedTile === 'goal-3' && (
            <p className="text-xs text-amber-600 font-medium">✓ Cliqué sur l&apos;objectif principal Ironman</p>
          )}
        </div>
      </div>

      {/* Section Mixed (exemple journée) */}
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Exemple : Activités d&apos;une journée
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Vue unifiée des 3 types d&apos;activités côte à côte (comme dans la modale du calendrier).
        </p>
        <div className="space-y-3">
          <ActivityTile
            type="goal"
            isPrimary={true}
            isResult={false}
            title="Marathon de Paris"
            distance={42.2}
            date="Dim. 7 avr."
            onClick={() => handleClick('mixed-1')}
          />
          
          <ActivityTile
            type="workout"
            sportType="course"
            title="Sortie longue préparation marathon"
            metadata={["2h00", "25 km"]}
            date="Dim. 7 avr."
            onClick={() => handleClick('mixed-2')}
          />
          
          <ActivityTile
            type="strava"
            activityLabel="Run"
            title="Long run - Marathon pace"
            metadata={["25.3 km", "280m D+", "1h58:34"]}
            date="Dim. 7 avr."
            onClick={() => handleClick('mixed-3')}
          />
        </div>
        {(clickedTile === 'mixed-1' || clickedTile === 'mixed-2' || clickedTile === 'mixed-3') && (
          <p className="text-xs text-green-600 font-medium mt-2">✓ Cliqué sur une activité de la journée</p>
        )}
      </div>

      {/* Section Sans date ni métadonnées */}
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-3">
          Variantes minimales
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Tuiles sans date ni métadonnées (pour contextes simplifiés).
        </p>
        <div className="space-y-3">
          <ActivityTile
            type="workout"
            sportType="velo"
            title="Sortie vélo"
            onClick={() => handleClick('minimal-1')}
          />

          <ActivityTile
            type="strava"
            activityLabel="Workout"
            title="Strength training"
            onClick={() => handleClick('minimal-2')}
          />

          <ActivityTile
            type="goal"
            isPrimary={false}
            isResult={false}
            title="10 km de Genève"
            distance={10}
            onClick={() => handleClick('minimal-3')}
          />
        </div>
      </div>
    </div>
  )
}
