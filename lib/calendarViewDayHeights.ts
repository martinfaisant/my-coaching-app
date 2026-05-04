/**
 * Hauteurs minimales (classes Tailwind) des cellules « jour » dans CalendarView.
 * Centralisées pour tests de non-régression (contrat : moitié des hauteurs historiques min-h-20 / min-h-24 / 202px / 126px).
 */
export const CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS = {
  /** Corps jour, vue mobile condensée (semaine du milieu) — ex. min-h-20 */
  mobileCondensedDayBody: 'min-h-10',
  /** Cellule jour, grille condensée desktop — ex. min-h-24 */
  desktopCondensedDayCell: 'min-h-12',
  /** Corps jour, grille détaillée desktop — ex. min-h-[202px] */
  desktopDetailedDayBody: 'min-h-[101px]',
  /** Zone vide + ajout, grille détaillée — ex. min-h-[126px] */
  desktopDetailedEmptyAddZone: 'min-h-[63px]',
} as const
