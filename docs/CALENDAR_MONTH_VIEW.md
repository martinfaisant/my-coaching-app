# Calendrier — vue mois (desktop) et vue semaine (mobile)

**Dernière mise à jour :** 4 mai 2026 — aligné sur l’implémentation (`CalendarView`, `CalendarViewWithNavigation`, pages calendrier).

## Besoin produit (rappel)

- Passer d’une navigation **centrée semaine** à une **lecture mois civil** sur **grand écran** (`md` et plus, breakpoint 768px), tout en **laissant le mobile inchangé** (sélecteur de semaine + une semaine affichée).
- Grille = **semaines ISO complètes** (lundi → dimanche) : le mois affiché inclut les jours du **mois précédent / suivant** nécessaires pour compléter la première et la dernière semaine.
- **Objectifs** dans le contexte calendrier : liste **non filtrée** par la plage de dates du mois affiché (comportement inchangé côté données).

## Comportement actuel

| Contexte | Navigation | Grille / contenu |
|----------|------------|------------------|
| **&lt; 768px** | `WeekSelector` (flèches + plage de la semaine) | Bloc totaux hebdo + **une semaine** en stack vertical (cf. archives `calendar-mobile-44`, `calendar-mobile-weekly-total`). |
| **≥ 768px** | `MonthSelector` (mois précédent \| libellé mois + année \| mois suivant) | **Mois civil étendu** : N semaines (souvent 4 à 6), 7 colonnes ; jours hors mois sélectionné en **atténuation** (`CalendarView`). Une **carte totaux** par semaine ISO visible. |

- **i18n :** `calendar.prevMonth`, `calendar.nextMonth` (aria des chevrons), `calendar.weekRangeSeparator` (mobile).
- **Hauteurs min. des cellules jour (desktop / mobile condensé) :** constantes Tailwind centralisées dans `lib/calendarViewDayHeights.ts` (tests dans `lib/calendarViewDayHeights.test.ts`).

## Données et chargement

- **Plage affichée / requêtes :** `getExtendedCalendarMonthGridBounds(year, monthIndex)` dans `lib/dateUtils.ts` → `rangeStart`, `rangeEnd`, `weekStartDates[]` (lundis de chaque semaine de la grille).
- **Bundle côté serveur / client :** `fetchCalendarDataBundle(athleteId, rangeStart, rangeEnd)` dans `app/[locale]/dashboard/workouts/actions.ts` (+ disponibilités via les actions existantes).
- **SSR :** `app/[locale]/dashboard/calendar/page.tsx` et `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` utilisent la même plage étendue pour l’état initial.

## Fichiers clés (implémentation)

| Rôle | Fichier |
|------|---------|
| Grille + modes condensé / détaillé | `components/CalendarView.tsx` |
| Navigation, `matchMedia` md, refetch mois | `components/CalendarViewWithNavigation.tsx` |
| Sélecteur mois | `components/MonthSelector.tsx` |
| Pages shell athlète / coach | `components/AthleteCalendarPage.tsx`, `components/CoachAthleteCalendarPage.tsx` |
| Bornes mois étendu | `lib/dateUtils.ts` (`getExtendedCalendarMonthGridBounds`) |
| Classes `min-h` jour | `lib/calendarViewDayHeights.ts` |

## Tests unitaires

- `lib/dateUtils.test.ts` — invariants et cas fixes sur `getExtendedCalendarMonthGridBounds`.
- `lib/calendarViewDayHeights.test.ts` — contrat demi-hauteur sur les classes extraites.

## Maquettes designer (référence visuelle)

Archivées sous **`docs/archive/design-calendar-month-view/`** :

- `MOCKUP_US1_MONTH_SELECTOR.html`
- `MOCKUP_US2_DESKTOP_MONTH_WEEKS.html`
- `MOCKUP_US3_MOBILE_SCOPE.html` (périmètre mobile inchangé)

Documentation produit / design system : **`Project_context.md` §4.5**, **`docs/DESIGN_SYSTEM.md`** §7 (breakpoint calendrier) et section **MonthSelector**.
