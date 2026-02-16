'use client'

import { LanguagePrefixInput, LanguagePrefixTextarea } from '@/components/LanguagePrefixField'

export function LanguagePrefixFieldShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-2">
          Variante : champ avec préfixe langue (EN/FR)
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Bandeau vert principal (palette-forest-dark, même que les boutons) à gauche. Utilisé pour les champs bilingues : offres coach (titre, description), présentation du coach.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Titre</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <LanguagePrefixInput
                lang="EN"
                placeholder="E.g.: Monthly Coaching"
                defaultValue=""
              />
              <LanguagePrefixInput
                lang="FR"
                placeholder="Ex: Suivi Mensuel"
                defaultValue=""
              />
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-2xl">
          <label className="block text-sm font-medium text-stone-700 mb-2">Description & avantages</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <LanguagePrefixTextarea
              lang="EN"
              rows={3}
              placeholder="Describe what the athlete gets..."
              defaultValue=""
            />
            <LanguagePrefixTextarea
              lang="FR"
              rows={3}
              placeholder="Décrivez ce que l'athlète obtient..."
              defaultValue=""
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-700">
        <p className="font-medium mb-2">Usage :</p>
        <pre className="overflow-x-auto text-xs">{`import { LanguagePrefixInput, LanguagePrefixTextarea } from '@/components/LanguagePrefixField'

// Titre bilingue (EN à gauche, FR à droite)
<LanguagePrefixInput lang="EN" name="title_en" placeholder="..." />
<LanguagePrefixInput lang="FR" name="title_fr" placeholder="..." />

// Description bilingue
<LanguagePrefixTextarea lang="EN" name="description_en" rows={3} />
<LanguagePrefixTextarea lang="FR" name="description_fr" rows={3} />`}</pre>
      </div>
    </div>
  )
}
