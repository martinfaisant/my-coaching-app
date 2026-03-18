/**
 * Styles partagés pour les composants de formulaire (Input, Textarea, etc.).
 * Centralise les classes Tailwind pour garantir la cohérence du design system.
 */

/** Hauteur fixe des champs input texte/nombre (nom, prénom, nom de la course, distance, temps objectif/résultat, etc.) et du trigger date picker — !important pour neutraliser les styles navigateur sur type="number" */
export const FORM_INPUT_HEIGHT = '!h-11'

/** Taille de police des champs input (alignée sur la date du date picker, ex. « 13 mars 2026 » : text-sm) */
export const FORM_INPUT_TEXT_SIZE = 'text-sm'

/** Classes de base pour tous les champs de formulaire (inclut FORM_INPUT_TEXT_SIZE pour cohérence avec le date picker) */
export const FORM_BASE_CLASSES =
  `${FORM_INPUT_TEXT_SIZE} w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition`

/** Classes pour l'état disabled et readonly */
export const FORM_DISABLED_READONLY_CLASSES =
  'disabled:bg-stone-100 disabled:text-stone-500 disabled:border-stone-200 disabled:cursor-not-allowed disabled:opacity-100 read-only:bg-stone-100 read-only:text-stone-500 read-only:border-stone-200 read-only:cursor-not-allowed read-only:opacity-100'

/** Classes pour l'état d'erreur */
export const FORM_ERROR_CLASSES = 'border-palette-danger focus:ring-palette-danger'

/** Classes spécifiques pour les textarea (en plus des BASE_CLASSES) */
export const TEXTAREA_SPECIFIC_CLASSES = 'resize-y min-h-[100px]'

/** Classes pour les labels de formulaire */
export const FORM_LABEL_CLASSES = 'block text-sm font-medium text-stone-700 mb-2'

/** Classes pour les messages d'erreur */
export const FORM_ERROR_MESSAGE_CLASSES = 'mt-1.5 text-sm text-palette-danger'
