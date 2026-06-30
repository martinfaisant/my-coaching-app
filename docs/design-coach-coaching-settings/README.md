# Design — Paramètres de coaching (unités des séances)

**Statut :** Livré (juin 2026)  
**Route :** `/dashboard/coaching-settings` (coach uniquement)

## User stories & mockups

| ID | Fichier | Périmètre |
|----|---------|-----------|
| CCS-US1 | `MOCKUP_US1_COACHING_SETTINGS_PAGE.html` | Page hub, 10 sports, états save |
| CCS-US2 | `MOCKUP_US2_PROFILE_WITHOUT_UNITS.html` | Profil coach sans section unités |
| CCS-US3 | `MOCKUP_US3_NAV_ACCOUNT_MENU.html` | Menu compte desktop + drawer |
| CCS-US4 | `MOCKUP_US4_MODAL_FIRST_WORKOUT_UNITS.html` | Modale onboarding première séance |

## Implémentation (référence)

- `app/[locale]/dashboard/coaching-settings/`
- `components/coach/CoachSessionUnitsGrid.tsx`
- `lib/workoutPrimaryMetric.ts`, `lib/dashboardNavConfig.ts` (`getCoachCoachingSettingsNavItem`)
- i18n : `coachCoachingSettings`, `navigation.coachingSettings`, `metadata.coachingSettingsTitle`

## Documentation normative à jour

- **`Project_context.md`** §4.2.0, §4.5 (objectifs séance)
- **`docs/DESIGN_SYSTEM.md`** § CoachSessionUnitsGrid
- **`docs/I18N.md`** namespace `coachCoachingSettings`

## Historique

Les maquettes **unités sur le profil coach** sont archivées dans **`docs/archive/design-coach-workout-units/`**.
