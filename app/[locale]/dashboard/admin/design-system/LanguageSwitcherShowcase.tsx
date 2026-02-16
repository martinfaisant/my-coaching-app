'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function LanguageSwitcherShowcase() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Sélecteur de langue en dropdown : icône globe, code langue courante (FR/EN), chevron. Menu avec libellés « Français » / « English » et indicateur de sélection (coche). Utilise les tokens palette-forest-dark, stone-*. Présent dans le header de la page d&apos;accueil et dans la sidebar du dashboard.
      </p>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
