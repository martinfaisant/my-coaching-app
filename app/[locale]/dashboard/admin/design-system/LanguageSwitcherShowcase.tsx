'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function LanguageSwitcherShowcase() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Sélecteur de langue (composant Dropdown) : trigger compact (icône globe + code FR/EN + chevron), menu avec libellés « Français » / « English », option active en vert (sans coche). Présent dans le header public (page d&apos;accueil, reset-password) et sur la page profil.
      </p>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
