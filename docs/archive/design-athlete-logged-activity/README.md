# Activités saisies par l'athlète — maquettes Designer

**Statut :** livré (juin 2026). Détail produit / technique à jour : **`Project_context.md`** §4.5, **`docs/DESIGN_SYSTEM.md`** (calendrier), **`docs/CALENDAR_MONTH_VIEW.md`**.

## Fichiers

| Fichier | Périmètre | Note post-livraison |
|---------|-----------|---------------------|
| `MOCKUP_US_ATH_LOG_01_PLUS_MENU.html` | Menu « + » (Dispo \| Activité) | **Obsolète** — remplacé par routage direct : jour passé/aujourd'hui → activité ; jour futur → disponibilité |
| `MOCKUP_US_ATH_LOG_02_ACTIVITY_MODAL.html` | Modale création/édition athlète | Référence historique ; implémentation : `AthleteLoggedActivityModal` |
| `MOCKUP_US_ATH_LOG_03_CALENDAR_TILES_COACH_VIEW.html` | Tuiles + vue coach | Badge tuile **« Ajouté »** (ambre) ; modale coach alignée sur `CoachReadOnlyWorkoutModalView` |

## Implémentation (pointeurs)

- Migration **`078_athlete_logged_workouts.sql`** (`planned_by`, RLS, totaux « prévu »)
- `components/athlete-logged-activity/AthleteLoggedActivityModal.tsx`, `AthleteLoggedCoachReadOnlyView.tsx`
- `app/[locale]/dashboard/athlete-logged-activity/actions.ts`
- `lib/athleteLoggedWorkout.ts`, `lib/athleteLoggedActivityValidation.ts`
- i18n : namespace **`athleteLoggedActivity`**
