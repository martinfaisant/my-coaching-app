# Spec technique : Objectif de temps facultatif + édition d’objectif (Solution A)

**Mode :** Architecte  
**Date :** 16 mars 2026  
**Référence design :** `DESIGN_GOAL_TARGET_TIME.md` (Solution A), mockups `MOCKUP_GOAL_TARGET_TIME_FORM_A.html`, `MOCKUP_GOAL_TARGET_TIME_TILES.html`.

---

## 1. Vue d’ensemble

- **Données :** Ajout de 3 colonnes optionnelles sur `goals` : `target_time_hours`, `target_time_minutes`, `target_time_seconds` (même logique que `result_time_*`).
- **Création :** `addGoal` accepte les champs optionnels objectif de temps ; validation : si au moins un des trois est renseigné, les trois sont requis (bornes h 0–99, min/s 0–59).
- **Édition :** Nouvelle action `updateGoal` + modale d’édition (nom, date, distance, priorité, objectif de temps). Le résultat (temps réalisé, place, note) reste géré uniquement par `GoalResultModal` / `saveGoalResult`.
- **Affichage :** Tuiles objectif (page Objectifs, calendrier, vue coach) et modale détail objectif affichent l’objectif de temps quand présent ; pour les passés avec résultat, afficher « Objectif X · Réalisé Y » sur la tuile.
- **RLS :** Aucun changement (UPDATE déjà autorisé pour l’athlète sur ses lignes).

---

## 2. Modèle de données

### 2.1 Migration

**Fichier à créer :** `supabase/migrations/056_goals_target_time.sql`

```sql
-- Objectif de temps (temps cible) facultatif pour un objectif
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS target_time_hours INTEGER NULL,
  ADD COLUMN IF NOT EXISTS target_time_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS target_time_seconds INTEGER NULL;

COMMENT ON COLUMN public.goals.target_time_hours IS 'Heures de l''objectif de temps (0-99), NULL = pas d''objectif';
COMMENT ON COLUMN public.goals.target_time_minutes IS 'Minutes de l''objectif de temps (0-59)';
COMMENT ON COLUMN public.goals.target_time_seconds IS 'Secondes de l''objectif de temps (0-59)';
```

- Aucune contrainte CHECK en base (validation côté app comme pour `result_time_*`).
- RLS : pas de modification (politique `goals_update_athlete` existe déjà).

### 2.2 Type TypeScript

**Fichier à modifier :** `types/database.ts`

- Dans le type `Goal`, ajouter (après `result_note`) :

```ts
  /** Objectif de temps (temps cible). Les trois requis pour « avoir un objectif de temps ». */
  target_time_hours?: number | null
  target_time_minutes?: number | null
  target_time_seconds?: number | null
```

---

## 3. Architecture des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `supabase/migrations/056_goals_target_time.sql` | Colonnes target_time_* sur goals | **Créer** |
| `types/database.ts` | Type Goal + champs target_time_* | **Modifier** |
| `lib/goalResultUtils.ts` | `hasTargetTime(goal)`, `formatTargetTime(goal)` | **Modifier** |
| `app/[locale]/dashboard/objectifs/actions.ts` | `addGoal` (target_time_*), `updateGoal` (nouvelle action) | **Modifier** |
| `app/[locale]/dashboard/objectifs/ObjectifsTable.tsx` | Formulaire ajout (3 champs objectif de temps), bouton Modifier, tuiles (affichage objectif + réalisé), ouverture modale édition | **Modifier** |
| `app/[locale]/dashboard/objectifs/GoalEditModal.tsx` | Modale d’édition (nom, date, distance, priorité, objectif de temps) | **Créer** |
| `components/CalendarView.tsx` | Modale détail objectif : ligne « Objectif de temps » ; tuiles jour : afficher objectif de temps si présent | **Modifier** |
| `components/CoachAthleteCalendarPage.tsx` | Tuiles objectifs : même affichage objectif de temps / objectif · réalisé que ObjectifsTable | **Modifier** |
| `components/ActivityTile.tsx` | (Optionnel) Si goal avec target time passé en props, afficher « Objectif : X » sous la distance | **Modifier** (optionnel) |
| `messages/fr.json`, `messages/en.json` | Clés goals.targetTime, goals.targetTimeLabel, goals.achieved, goals.editGoal, validation pour objectif de temps partiel | **Modifier** |

---

## 4. RLS

- **Aucun changement.** La table `goals` a déjà :
  - `goals_select_athlete`, `goals_insert_athlete`, `goals_update_athlete`, `goals_delete_athlete` pour l’athlète ;
  - `goals_select_coach` pour le coach (lecture seule).
- L’édition (UPDATE) est donc déjà couverte par `goals_update_athlete`.

---

## 5. Logique métier

### 5.1 addGoal

- Lire en plus depuis FormData : `target_time_hours`, `target_time_minutes`, `target_time_seconds` (chaînes vides ou valeur).
- **Validation objectif de temps :** si au moins un des trois est non vide, alors les trois sont obligatoires et doivent être dans les bornes (h 0–99, min/s 0–59). Sinon retourner une erreur i18n (ex. `goals.validation.targetTimeAllRequired` ou réutiliser `invalidTimeRange`).
- Si les trois sont vides → pas d’objectif de temps : insert sans les colonnes target_time_* (ou avec NULL).
- Si les trois sont renseignés et valides → insert avec `target_time_hours`, `target_time_minutes`, `target_time_seconds` (entiers).
- `revalidatePath` : `/dashboard/objectifs` (et éventuellement `/dashboard/calendar` pour cohérence si la page calendrier est ouverte).

### 5.2 updateGoal (nouvelle action)

- **Signature :** `updateGoal(_prevState: GoalFormState, formData: FormData): Promise<GoalFormState>`.
- FormData attendu : `goal_id`, `locale`, `race_name`, `date`, `distance`, `is_primary`, `target_time_hours`, `target_time_minutes`, `target_time_seconds` (ces trois peuvent être vides pour « effacer » l’objectif de temps).
- Vérifier que l’objectif existe et appartient à l’utilisateur (requireRole athlete, puis select goal par id + athlete_id).
- **Validation :** même règle que addGoal pour l’objectif de temps (si un des trois renseigné, les trois requis et valides). Si les trois vides → mettre NULL pour target_time_*.
- Ne **pas** modifier les colonnes `result_*` (résultat géré uniquement par `saveGoalResult`).
- Update des champs : `race_name`, `date`, `distance`, `is_primary`, `target_time_hours`, `target_time_minutes`, `target_time_seconds`.
- `revalidatePath('/dashboard/objectifs')` et `revalidatePath('/dashboard/calendar')`.

### 5.3 goalResultUtils

- **hasTargetTime(goal: Goal): boolean** — vrai ssi `target_time_hours`, `target_time_minutes`, `target_time_seconds` sont tous non null/undefined.
- **formatTargetTime(goal: Goal): string** — même format que `formatGoalResultTime` (ex. "3h30", "1h05min30s"), en s’appuyant sur les champs `target_time_*`. Retourner `''` si pas d’objectif de temps.

---

## 6. UI et flux

### 6.1 Formulaire d’ajout (ObjectifsTable)

- Après le sélecteur Priorité, ajouter le bloc (sans encadré, sans texte d’aide) :
  - Label : « Objectif de temps (facultatif) » (i18n `goals.targetTimeOptional` ou équivalent).
  - 3 champs `Input` type number : Heures (0–99), Minutes (0–59), Secondes (0–59), noms `target_time_hours`, `target_time_minutes`, `target_time_seconds`.
- Le bouton « Ajouter un objectif » reste soumis au pattern existant (hasUnsavedChanges, etc.) ; inclure les 3 champs dans la détection des changements et dans l’état initial du formulaire.

### 6.2 Tuiles objectif (ObjectifsTable, CoachAthleteCalendarPage, CalendarView)

- **Ligne sous la distance :**
  - Si objectif de temps présent : afficher « Objectif : 3h30 » (ou `formatTargetTime(goal)`).
  - Si objectif **passé** et **résultat** présent : afficher « Objectif 3h30 · Réalisé 3h45 » (et place si présente). Utiliser clés i18n du type `goals.targetTimeLabel` et `goals.achieved`.
- Ordre suggéré sur la tuile : distance · (objectif de temps si présent) · (pour passé : réalisé + place). Aligner sur le mockup `MOCKUP_GOAL_TARGET_TIME_TILES.html`.

### 6.3 Modale d’édition (GoalEditModal)

- **Ouverture :** Bouton « Modifier » sur chaque tuile objectif (page Objectifs), à côté de « Saisir le résultat » / « Modifier le résultat » et du bouton Supprimer.
- **Contenu :** Formulaire avec race_name, date, distance, priorité (Principal/Secondaire), objectif de temps (3 champs h/min/s, sans encadré ni texte d’aide). Pas de champs résultat (rester dans GoalResultModal).
- **Soumission :** action `updateGoal` avec goal_id + champs du formulaire. Après succès : fermer la modale, revalidate (déjà fait dans l’action), feedback succès.
- **Composant :** Utiliser `Modal` du design system ; formulaire avec `useActionState(updateGoal, …)` et pattern bouton de sauvegarde (PATTERN_SAVE_BUTTON.md).

### 6.4 Modale détail objectif (CalendarView)

- Ajouter une ligne « Objectif de temps » (label i18n) avec la valeur formatée (`formatTargetTime(selectedGoal)`) si `hasTargetTime(selectedGoal)`.

### 6.5 ActivityTile (type goal)

- Optionnel : si une prop optionnelle permet de passer le temps cible (ou le goal complet), afficher « Objectif : X » sous la distance. À faire uniquement si les usages du composant (calendrier, etc.) passent déjà ou peuvent passer le goal ; sinon laisser pour une évolution ultérieure.

---

## 7. i18n

- **Namespace `goals` (fr.json / en.json) :**
  - `targetTimeOptional` : « Objectif de temps (facultatif) » / “Target time (optional)”
  - `targetTimeLabel` : « Objectif » / “Target” (pour affichage court « Objectif : 3h30 »)
  - `achieved` : « Réalisé » / “Achieved” (pour « Réalisé 3h45 »)
  - `editGoal` : « Modifier » / “Edit” (bouton sur la tuile)
  - `editGoalTitle` : « Modifier l’objectif » / “Edit goal” (titre modale édition)
- **Namespace `goals.validation` :**
  - `targetTimeAllRequired` (ou réutiliser un message existant) : si un seul champ objectif de temps est renseigné, les trois sont requis. Ex. « Si vous renseignez l’objectif de temps, heures, minutes et secondes sont requis. » / “If you set a target time, hours, minutes and seconds are required.”
- Vérifier les clés existantes `result.hours`, `result.minutes`, `result.seconds` pour réutilisation dans les labels des champs (optionnel).

---

## 8. Tests manuels recommandés

1. **Création sans objectif de temps :** Ajouter un objectif avec uniquement nom, date, distance, priorité → pas d’affichage « Objectif : » sur la tuile.
2. **Création avec objectif de temps :** Renseigner 3h30 → tuile affiche « Objectif : 3h30 » ; modale détail calendrier affiche la ligne « Objectif de temps ».
3. **Validation partielle :** Renseigner seulement Heures → soumission → message d’erreur (les trois requis).
4. **Édition :** Modifier un objectif (nom, date, distance, priorité, objectif de temps) → sauvegarde → tuile et modale détail à jour. Modifier en vidant l’objectif de temps → sauvegarde → plus d’affichage « Objectif : ».
5. **Objectif passé avec résultat et objectif de temps :** Saisir un résultat sur un objectif qui a un temps cible → tuile affiche « Objectif 3h30 · Réalisé 3h45 » (et place si présente).
6. **Vue coach :** En tant que coach, ouvrir un athlète → liste objectifs et modale détail affichent bien l’objectif de temps ; pas de bouton Modifier (réservé à l’athlète).
7. **Calendrier :** Tuiles jour et modale détail objectif affichent l’objectif de temps quand présent.

---

## 9. Points à trancher en implémentation

- **Réutilisation des libellés résultat (h, min, s) :** Utiliser `goals.result.hours` / `minutes` / `seconds` pour les champs objectif de temps dans le formulaire d’ajout et la modale d’édition, ou créer des clés dédiées `goals.targetTimeHours` etc. pour éviter toute ambiguïté.
- **Bouton Modifier vs icône :** Utiliser un bouton texte « Modifier » ou une icône (crayon) avec title — aligner avec le design system et la tuile (place disponible).
- **ActivityTile :** Décider si on ajoute l’affichage « Objectif : X » dans cette US ou en différé (selon complexité des props et des usages).
- **Revalidation calendrier après addGoal :** Ajouter ou non `revalidatePath('/dashboard/calendar')` dans `addGoal` pour cohérence (recommandé : oui).
