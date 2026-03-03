# Spec technique : Moment de la journée (Matin / Midi / Soir)

**Mode :** Architecte  
**Date :** 2 mars 2026  
**Référence :** `docs/design-workout-time-of-day/DESIGN.md` (user stories US1–US5)

---

## 1. Modèle de données

### 1.1 Migration

**Fichier à créer :** `supabase/migrations/051_workout_time_of_day.sql`

- Ajouter sur `public.workouts` une colonne **`time_of_day`** :
  - Type : `TEXT` nullable.
  - Contrainte : `CHECK (time_of_day IS NULL OR time_of_day IN ('morning', 'noon', 'evening'))`.
  - Valeurs : `NULL` = non précisé ; `'morning'` = Matin ; `'noon'` = Midi ; `'evening'` = Soir.
- Pas de valeur par défaut : les lignes existantes restent `NULL` (compatibilité ascendante).
- Commentaire : `COMMENT ON COLUMN public.workouts.time_of_day IS 'Moment de la journée (affichage calendrier par sections). NULL = non précisé.'`

Aucune nouvelle table. Aucun impact sur les triggers existants (`workout_weekly_totals`, `updated_at`) : `time_of_day` n’intervient pas dans les totaux.

### 1.2 Types TypeScript

**Fichier à modifier :** `types/database.ts`

- Définir un type littéral :  
  `export type WorkoutTimeOfDay = 'morning' | 'noon' | 'evening'`
- Dans `Workout`, ajouter :  
  `/** Moment de la journée (section calendrier). Null = non précisé (premier bloc). */`  
  `time_of_day?: WorkoutTimeOfDay | null`

---

## 2. RLS

**Aucune modification des RLS.**

La colonne `time_of_day` est un champ métier comme les autres sur `workouts`. Les politiques existantes (`workouts_select_coach`, `workouts_insert_coach`, `workouts_update_coach`, `workouts_delete_coach`, `workouts_select_athlete`, `workouts_select_admin`) s’appliquent sans changement.

---

## 3. Architecture et table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `supabase/migrations/051_workout_time_of_day.sql` | Ajout colonne `time_of_day` sur `workouts` | **Créer** |
| `types/database.ts` | Type `WorkoutTimeOfDay` et champ `time_of_day` sur `Workout` | **Modifier** |
| `lib/workoutValidation.ts` | Lecture et validation optionnelle de `time_of_day` (formData) ; retour dans `data` | **Modifier** |
| `app/[locale]/dashboard/workouts/actions.ts` | `createWorkout` / `updateWorkout` : inclure `time_of_day` dans insert/update | **Modifier** |
| `components/WorkoutModal.tsx` | Formulaire coach : segments [ Non précisé \| Matin \| Midi \| Soir ], state + form hidden ; lecture seule : afficher le moment si présent | **Modifier** |
| `components/CalendarView.tsx` | Pour chaque jour : construire contenu par sections (premier bloc sans titre ; sections Matin / Midi / Soir avec titre si non vides) ; tri/groupement des workouts par `time_of_day` | **Modifier** |
| `messages/fr.json` | Clés `workouts.form.timeOfDay`, `workouts.form.timeOfDay.unspecified`, `workouts.form.timeOfDay.morning`, `.noon`, `.evening` ; évent. modale lecture seule | **Modifier** |
| `messages/en.json` | Idem (traductions EN) | **Modifier** |

Aucun nouveau fichier côté composants : réutilisation des segments existants (style Temps/Distance) et de la structure CalendarView.

---

## 4. Logique métier

### 4.1 Formulaire (création / édition)

- **Champ formulaire :** `time_of_day` envoyé via FormData (ex. `formData.get('time_of_day')`). Valeurs possibles : chaîne vide ou `''` = Non précisé → `null` ; `'morning'` | `'noon'` | `'evening'` sinon.
- **Validation :** optionnelle. Si absent ou valeur inconnue → traiter comme `null`. Valeurs autorisées : `''`, `'morning'`, `'noon'`, `'evening'`.
- **Création :** insérer `time_of_day: value ?? null` (value = valeur validée ou null).
- **Mise à jour :** idem dans l’objet `update`.

### 4.2 Calendrier : structure du jour

Pour une date donnée, l’ordre d’affichage est :

1. **Premier bloc (sans titre)**  
   - Objectifs (goals) du jour.  
   - Éventuellement dispo (si feature dispo par jour existante).  
   - Entraînements avec `time_of_day IS NULL`.  
   - Activités Strava importées (imported_activities).  
   Ordre interne du premier bloc : goals, puis workouts sans moment, puis imported (ordre actuel métier).

2. **Section « Matin »** (titre affiché uniquement si au moins un entraînement avec `time_of_day = 'morning'`)  
   - Liste des workouts du jour avec `time_of_day = 'morning'`.  
   - Entre eux : ordre secondaire `created_at` (ou ordre déjà reçu).

3. **Section « Midi »** (titre affiché uniquement si au moins un entraînement avec `time_of_day = 'noon'`)  
   - Liste des workouts avec `time_of_day = 'noon'`.

4. **Section « Soir »** (titre affiché uniquement si au moins un avec `time_of_day = 'evening'`)  
   - Liste des workouts avec `time_of_day = 'evening'`.

Implémentation côté client (CalendarView) : à partir de `workoutsByDate[dateStr]`, partitionner en `workoutsNoMoment`, `workoutsMorning`, `workoutsNoon`, `workoutsEvening`, puis rendre dans l’ordre ci‑dessus ; n’afficher le titre de section que pour Matin / Midi / Soir si la liste correspondante est non vide.

### 4.3 Modale « Activités du jour »

Même logique que le calendrier : construire la liste pour affichage dans l’ordre premier bloc (goals, workouts sans moment, imported) puis sections Matin, Midi, Soir (avec titre uniquement si non vide). Réutiliser la même fonction de partition/ordre que pour la colonne jour (ou une utilitaire partagée).

### 4.4 Requêtes serveur

- Les pages qui chargent les workouts (ex. `app/[locale]/dashboard/calendar/page.tsx`, page athlète coach qui charge le calendrier) n’ont pas besoin de tri particulier par `time_of_day` : le tri par sections est fait côté client à partir de la liste par jour.  
- Optionnel : ajouter `.order('time_of_day', { nullsFirst: true })` après `.order('created_at')` pour avoir un ordre stable côté serveur ; ce n’est pas indispensable car le groupement par section est refait côté client.

---

## 5. Points à trancher en implémentation

1. **Ordre dans le premier bloc** : confirmer l’ordre exact (goals → workouts sans moment → imported) comme dans la spec, ou goals → imported → workouts sans moment. Designer : « objectifs, dispo, entraînements sans moment, Strava » → on garde goals, puis workouts sans moment, puis imported sauf précision contraire.
2. **Modale lecture seule** : emplacement exact du libellé moment (ex. « Lundi 3 mars · Matin ») : sous la date, même ligne que la date, ou dans l’en-tête à droite. À aligner avec le mockup / design.
3. **i18n** : namespace `workouts` ; clés pour les titres de section calendrier (ex. `workouts.calendar.morning`, `.noon`, `.evening`) pour réutilisation dans la modale « Activités du jour » et la colonne jour.

---

## 6. Cas limites et contraintes

- **Entrées existantes** : `time_of_day` NULL pour tous les workouts existants → affichés dans le premier bloc (sans titre). Aucune migration de données à prévoir.
- **Valeur inconnue en base** : si une valeur hors enum arrivait (après future évolution), la traiter comme NULL pour l’affichage (premier bloc).
- **Performance** : pas d’impact (une colonne en plus, pas de nouveau index nécessaire pour les requêtes calendrier actuelles ; le partitionnement se fait en mémoire sur les lignes du jour déjà chargées).

---

## 7. Tests manuels recommandés

1. **Création** : créer un entraînement avec chaque option (Non précisé, Matin, Midi, Soir) → vérifier en BDD et dans le calendrier (bonne section, pas de titre « Autre »).
2. **Édition** : modifier un entraînement en changeant le moment → vérifier la persistance et le déplacement dans la bonne section.
3. **Calendrier** : jour avec 0, 1, 2, 3 sections Matin/Midi/Soir remplies → vérifier que seules les sections non vides ont un titre.
4. **Modale « Activités du jour »** : jour avec plusieurs activités réparties en sections → même ordre et mêmes titres que dans la colonne.
5. **Modale lecture seule** : ouvrir un entraînement avec moment renseigné → le libellé (ex. « Matin ») apparaît ; sans moment, rien.
6. **Rétrocompatibilité** : entraînements existants (sans `time_of_day`) restent affichés dans le premier bloc.
7. **i18n** : bascule FR/EN → libellés segments et titres de section corrects.

---

**Checklist livraison Architecte :** migration cohérente ✓ ; RLS justifiées (aucun changement) ✓ ; table des fichiers ✓ ; cas limites listés ✓ ; tests manuels indiqués ✓.
