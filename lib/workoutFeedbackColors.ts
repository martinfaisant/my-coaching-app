/**
 * Couleurs sémantiques pour les feedbacks (Ressenti, Intensité RPE, Plaisir).
 *
 * Deux usages :
 * - TILE_CLASSES   : tuile read-only (coach) — fond léger + texte coloré + border discret.
 * - PICKER_*       : bouton picker (athlète) — sélectionné = fond plus marqué ou plein.
 *
 * Toutes les classes sont écrites en clair pour permettre la détection JIT Tailwind.
 *
 * Échelles :
 * - Feeling / Pleasure (1-5) : 1 = mauvais (rouge) → 5 = excellent (vert).
 * - Intensité RPE (1-10)     : 1 = facile (vert) → 5 = orange (modéré) → 10 = max (rouge).
 */

export const FEELING_TILE_CLASSES: Record<number, string> = {
  1: 'bg-palette-danger/10 text-palette-danger border-palette-danger/30',
  2: 'bg-palette-amber/25 text-palette-amber border-palette-amber/40',
  3: 'bg-palette-amber/15 text-palette-amber border-palette-amber/30',
  4: 'bg-palette-sage/25 text-palette-forest-dark border-palette-sage/40',
  5: 'bg-palette-forest-dark/10 text-palette-forest-dark border-palette-forest-dark/30',
}

export const INTENSITY_TILE_CLASSES: Record<number, string> = {
  1: 'bg-palette-forest-dark/10 text-palette-forest-dark border-palette-forest-dark/30',
  2: 'bg-palette-forest-dark/10 text-palette-forest-dark border-palette-forest-dark/30',
  3: 'bg-palette-sage/20 text-palette-forest-dark border-palette-sage/40',
  4: 'bg-palette-sage/20 text-palette-forest-dark border-palette-sage/40',
  5: 'bg-palette-amber/20 text-palette-amber border-palette-amber/40',
  6: 'bg-palette-amber/20 text-palette-amber border-palette-amber/40',
  7: 'bg-palette-amber/30 text-palette-amber border-palette-amber/50',
  8: 'bg-palette-danger/10 text-palette-danger border-palette-danger/30',
  9: 'bg-palette-danger/15 text-palette-danger border-palette-danger/30',
  10: 'bg-palette-danger/20 text-palette-danger border-palette-danger/40',
}

/** Picker feeling/pleasure : border + background du bouton sélectionné. */
export const FEELING_PICKER_SELECTED_BG: Record<number, string> = {
  1: 'border-palette-danger bg-palette-danger/10',
  2: 'border-palette-amber bg-palette-amber/15',
  3: 'border-palette-amber bg-palette-amber/10',
  4: 'border-palette-sage bg-palette-sage/20',
  5: 'border-palette-forest-dark bg-palette-forest-dark/10',
}

/** Picker feeling/pleasure : couleur texte/icône du bouton sélectionné. */
export const FEELING_PICKER_SELECTED_TEXT: Record<number, string> = {
  1: 'text-palette-danger',
  2: 'text-palette-amber',
  3: 'text-palette-amber',
  4: 'text-palette-forest-dark',
  5: 'text-palette-forest-dark',
}

/** Picker intensity : bouton sélectionné en fond plein (lisibilité dans une rangée de 10). */
export const INTENSITY_PICKER_SELECTED: Record<number, string> = {
  1: 'border-palette-forest-dark bg-palette-forest-dark text-white',
  2: 'border-palette-forest-dark bg-palette-forest-dark text-white',
  3: 'border-palette-sage bg-palette-sage text-white',
  4: 'border-palette-sage bg-palette-sage text-white',
  5: 'border-palette-amber bg-palette-amber text-white',
  6: 'border-palette-amber bg-palette-amber text-white',
  7: 'border-palette-amber bg-palette-amber text-white',
  8: 'border-palette-danger bg-palette-danger text-white',
  9: 'border-palette-danger bg-palette-danger text-white',
  10: 'border-palette-danger bg-palette-danger text-white',
}
