# Spec Architecte — Intensité prévisionnelle (RPE) séance

**Version :** 1.0  
**Date :** 11 mai 2026  
**Entrées :** `docs/design-rpe-planned-intensity/DESIGN_RPE_PLANNED_INTENSITY.md` (Phase 2 Designer validée), maquettes US1–US5, code existant workouts / modale / calendrier.

---

## Entrées reçues

- User stories **US-RPE-01** à **US-RPE-05** et critères d’acceptation du design.
- Table RPE FR + proposition EN (i18n).
- Décisions UI : saisie coach avec grille + encart ; lecture seule = **format `IntensityCard`** (`INTENSITY_TILE_CLASSES` + « / 10 ») ; badge tuile neutre ; si `planned_intensity` non null et statut **completed** → `perceived_intensity` **obligatoire** à l’enregistrement ; récap sans ligne intensité perçue si null.

---

## Hypothèses

- **Nom de colonne BDD** : `planned_intensity` (`SMALLINT`, nullable, contrainte 1–10 ou NULL), par **symétrie** avec `perceived_intensity` et vocabulaire métier « intensité ».
- **Effacer la cible** : champ formulaire optionnel — chaîne vide / absence de clé → `NULL` en base (pas de migration dédiée « clear »).
- **Coach modifie une séance déjà `completed`** : déjà possible côté produit selon `canEdit` calendrier ; si le coach ajoute une `planned_intensity` sur une séance completed sans `perceived_intensity`, l’athlète devra pouvoir corriger au prochain enregistrement — **comportement par défaut** : appliquer la même règle « completed + planned → perceived requis » (voir *Points à trancher* si exception souhaitée).

---

## Questions bloquantes

1. **Séance `completed` sans `perceived_intensity`, coach renseigne ensuite `planned_intensity`** : accepte-t-on que l’athlète soit « bloqué » jusqu’à complétion du RPE ressenti au prochain enregistrement (recommandation : **oui**, cohérent avec la règle métier) ?
2. **Bouton « Effacer l’intensité cible »** : obligatoire en UI ou simple re-soumission sans champ (hidden vide) suffit-elle ? — **Non bloquant** pour la spec BDD ; **bloquant UX** minimal : prévoir au moins un moyen de repasser à `NULL` (champ optionnel non posté ou clear explicite).

*Si le PO ne répond pas : appliquer les défauts des hypothèses ci-dessus.*

---

## Architecture proposée

### Données

- Une seule source de vérité : colonne **`workouts.planned_intensity`** (nullable).
- Pas de duplication dans d’autres tables.
- Typage applicatif : `Workout` dans `types/database.ts` → `planned_intensity?: number | null` (aligné `perceived_intensity`).

### Couches

1. **BDD** : migration `ALTER TABLE workouts ADD COLUMN planned_intensity …` + `CHECK` + `COMMENT`.
2. **Écriture coach** : `createWorkout` / `updateWorkout` (`app/[locale]/dashboard/workouts/actions.ts`) — parser `FormData`, valider 1–10 ou absent, inclure dans `insert` / `update`. Réutiliser / étendre `validateWorkoutFormData` dans `lib/workoutValidation.ts` (retour typé étendu ou parse parallèle documenté).
3. **Écriture athlète** : `saveWorkoutStatusAndComment` — **ne jamais** accepter `planned_intensity` depuis le `FormData` athlète ; lecture seule du champ existant pour la règle de validation.
4. **UI coach édition** : `CoachWorkoutForm` + `useWorkoutFormReducer` + `WorkoutModal` (chemins dupliqués legacy si encore présents) — grille 1–10 + encart i18n (`workouts.rpe.*`).
5. **UI lecture seule** : `WorkoutTargetActualCards` — sous-bloc dans la carte Objectif si `planned_intensity != null`, composant visuel **réutilisant le même layout que `IntensityCard`** (`WorkoutFeedbackSummary.tsx`) : soit export d’un petit **`IntensityReadOnlyTile`**, soit props optionnelles — éviter duplication des classes `INTENSITY_TILE_CLASSES`.
6. **UI athlète saisie ressenti** : `WorkoutFeedbackSection` — encart RPE sous la grille intensité **ressentie** uniquement (textes i18n partagés `workouts.rpe.levels.{n}.*`).
7. **Calendrier** : `CalendarView.tsx` (et sous-composants de tuile workout concernés) — badge conditionnel si `planned_intensity != null`, classes neutres `stone`, `aria-label` i18n.
8. **Chargements** : toute `select` métier qui alimente le calendrier / la modale doit inclure `planned_intensity` si la liste de colonnes est **explicite** ; sinon vérifier que le typage et le SSR incluent le champ après migration.

### Validation métier centralisée

| Contexte | Règle |
|----------|--------|
| Coach create/update | `planned_intensity` ∈ ∅ ou [1, 10] |
| Athlète save status | Si `status === 'completed'` **et** `planned_intensity != null` (lu en DB) **et** champs feedback présents dans le form → `perceived_intensity` **obligatoire** (1–10) |
| Athlète save status | Si `planned_intensity == null` → `perceived_intensity` optionnel (inchangé) |
| Statut non `completed` | Pas d’obligation RPE ressenti (comportement actuel) |

---

## Table des fichiers

| Fichier | Action |
|---------|--------|
| `supabase/migrations/073_workout_planned_intensity.sql` | **Créer** — colonne + contrainte + commentaire. |
| `types/database.ts` | **Modifier** — type `Workout`. |
| `lib/workoutValidation.ts` | **Modifier** — parser / valider `planned_intensity` pour formulaire coach (ou extension du type retour `validateWorkoutFormData`). |
| `app/[locale]/dashboard/workouts/actions.ts` | **Modifier** — `createWorkout`, `updateWorkout` (insert/update) ; `saveWorkoutStatusAndComment` (select étendu, condition perceived requis, pas d’écriture `planned_intensity`). |
| `components/workout-modal/useWorkoutFormReducer.ts` | **Modifier** — état initial + valeurs + sync depuis `currentWorkout`. |
| `components/workout-modal/CoachWorkoutForm.tsx` | **Modifier** — champs + hidden / contrôles RPE + encart. |
| `components/WorkoutModal.tsx` | **Modifier** si formulaire legacy dupliqué pour objectifs (aligner avec `CoachWorkoutForm`). |
| `components/workout-modal/WorkoutTargetActualCards.tsx` | **Modifier** — affichage compact `planned_intensity` dans carte Objectif. |
| `components/workout-modal/WorkoutFeedbackSummary.tsx` | **Modifier** optionnel — factoriser `IntensityCard` / tuile réutilisable si le Designer l’exige ; sinon duplication minimale des classes pour `WorkoutTargetActualCards`. |
| `components/workout-modal/WorkoutFeedbackSection.tsx` | **Modifier** — encart descriptions RPE pour la grille **ressentie** (props + i18n). |
| `components/workout-modal/views/AthleteWorkoutModalView.tsx` | **Modifier** si nécessaire pour erreur inline / scroll (souvent géré par `statusCommentState`). |
| `components/CalendarView.tsx` | **Modifier** — badge RPE sur tuiles workout (toutes variantes concernées). |
| `messages/fr.json`, `messages/en.json` | **Modifier** — clés `workouts.rpe.*`, `workouts.validation.*`, `workouts.summary.*`, `calendar.*` ou équivalent selon `docs/I18N.md`. |
| `docs/I18N.md` | **Modifier** — checklist namespace (post-livraison Analyste possible ; Architecte peut noter les clés attendues ici). |
| `docs/design-rpe-planned-intensity/DESIGN_RPE_PLANNED_INTENSITY.md` | **Conserver** — référence produit ; ajouter lien vers cette spec en tête (optionnel). |
| `Project_context.md` | **Reporter** — mise à jour post-implémentation (Analyste) ou une ligne « à venir » si le PO impose synchronisation immédiate. |

Fichiers **à vérifier** (select explicite) : toute action ou page chargeant des `workouts` avec colonnes listées — recherche `from('workouts')` + `.select(` dans le repo.

---

## Données / BDD

```sql
-- Contenu indicatif de migration 073 (numéro à ajuster si 073 déjà pris au moment du merge)
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS planned_intensity SMALLINT;

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_planned_intensity_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_planned_intensity_check
  CHECK (planned_intensity IS NULL OR (planned_intensity >= 1 AND planned_intensity <= 10));

COMMENT ON COLUMN public.workouts.planned_intensity IS
  'RPE cible 1–10 défini par le coach (optionnel). Lecture athlète ; édition coach uniquement via l''app.';
```

- **Aucune** vue matérialisée ni table annexe.
- **Trigger** `workout_weekly_totals` : inchangé (ne dépend pas de cette colonne).

---

## RLS

**Aucun changement RLS** requis pour livrer la feature : les politiques existantes sur `workouts` (coach update sur athlètes liés, athlète update sur sa ligne) couvrent déjà les `UPDATE` / `SELECT`.  
**Contrôle applicatif** : seules les server actions coach écrivent `planned_intensity` ; l’action athlète ne doit pas inclure cette clé dans l’objet `update`.

**Note sécurité (hors scope immédiat)** : la politique `workouts_update_athlete_comment` ne restreint pas les colonnes — un client malveillant pourrait tenter d’écrire `planned_intensity`. Mitigation **app** suffisante pour le MVP ; durcissement possible (trigger `BEFORE UPDATE`, colonnes protégées) — **À valider par le PO** si exigence compliance.

---

## Logique métier

1. **Création / édition coach** : persister `planned_intensity` avec les autres champs objectifs ; `NULL` si non renseigné.
2. **Affichage** : si `NULL`, pas de badge tuile, pas de bloc dans la carte Objectif.
3. **Athlète enregistre statut + feedback** :  
   - Lire `planned_intensity` depuis la ligne workout (même `SELECT` que pour les `target_*`).  
   - Si `status === 'completed'` et `planned_intensity IS NOT NULL` → exiger `perceived_intensity` non null dans les données parsées du formulaire ; sinon erreur i18n dédiée (clé type `workouts.validation.perceivedIntensityRequiredWhenPlanned`).  
   - Ordre de validation : après les règles `actual_*` existantes pour `completed`, avant l’`update` Supabase.
4. **Récap `WorkoutFeedbackSummary`** : ne pas afficher la carte intensité perçue si `perceived_intensity` null (déjà le cas) ; l’intensité **prévue** reste dans `WorkoutTargetActualCards`, pas dans `WorkoutFeedbackSummary` (évite doublon avec la carte Objectif).

---

## Edge cases / sécurité

| Cas | Traitement |
|-----|------------|
| Valeur hors 1–10 en POST coach | Rejet validation (`workouts.validation` ou code dédié). |
| `completed` + `planned_intensity` + perceived vide | Erreur serveur + message sous zone intensité (côté client déjà branché sur `statusCommentState.error`). |
| Passage `completed` → `planned` | Pas d’exigence RPE ressenti sur `planned`. |
| Passage `completed` → `not_completed` | Comportement actuel (clear actuals, etc.) ; `perceived_*` gérés comme aujourd’hui — vérifier cohérence si le code efface les perceived sur `not_completed` (sinon **pas** d’effet de bord sur `planned_intensity`). |
| Données historiques | `planned_intensity` NULL pour toutes les lignes existantes. |
| Calendrier / SSR | Vérifier que les workouts sérialisés vers le client contiennent le nouveau champ. |

---

## Tests manuels recommandés

1. Coach crée une séance avec RPE 7 → athlète voit tuile badge + carte Objectif compacte + pas d’obligation tant que non réalisé.
2. Athlète marque Réalisé avec métriques OK, sans perceived, **avec** planned → erreur attendue ; avec perceived → succès.
3. Athlète marque Réalisé sans perceived, **sans** planned → succès (régression).
4. Coach modifie / efface `planned_intensity` sur séance future → valeurs et UI cohérentes.
5. Coach ouvre séance passée lecture seule → affichage compact RPE dans Objectif + feedback inchangé.
6. Calendrier : tuiles avec et sans badge ; `aria-label` sur le badge.

---

## Points à trancher en implémentation

- Numéro de migration final (073 vs suivant disponible sur la branche).
- Factorisation `IntensityCard` exportée vs copie contrôlée des classes Tailwind.
- **US1 point ouvert Designer** : style picker identique au ressenti vs variante — **défaut** : réutiliser `INTENSITY_PICKER_SELECTED` pour cohérence.
- Mise à jour **Project_context.md** / index docs : **après** livraison code (flux Analyste) ou mini-ajout si PO l’exige avant dev.

---

## Hors périmètre / rôle suivant

- **Mode Développeur** : implémentation conforme à cette spec + mockups.
- **Reviewer Tech** : revue post-implémentation.
- **Mode Analyste** : `Project_context.md`, `docs/I18N.md`, `DOCS_INDEX`, archivage éventuel du dossier design en `docs/archive/` après stabilisation produit.

---

*Référence workflow : `.cursor/rules/workflow-personas.mdc` (Architecte).*
