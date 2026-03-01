# Spécification technique – Statut de réalisation des séances

**Mode :** Architecte  
**Référence :** `USER_STORIES_WORKOUT_STATUS.md`, `DESIGN_WORKOUT_STATUS.md`, mockup `workout-status-mockup.html`.

Ce document prépare le travail pour le développeur : architecture, modèle de données, RLS, logique métier et table des fichiers, reliés aux user stories.  
**Point d’attention :** la modification de la date par le coach n’existe pas aujourd’hui dans l’UI ; l’ajouter a des impacts (revalidation, affichage calendrier).

### Impacts de l’ajout de la modification de la date par le coach

- **Actuellement :** la date est passée en hidden depuis la cellule du calendrier (`modalDate` = date du jour de la cellule) ; le coach ne peut pas la changer.
- **Après changement (US4) :** le coach peut choisir une autre date dans la modale. Il faut :
  1. **WorkoutModal :** state local pour la date en édition coach (ex. `editableDate`), initialisé à `workout.date`, et champ (sélecteur) dans l’en-tête ; le formulaire envoie cette date (name `date`), pas la date d’ouverture.
  2. **Backend :** `updateWorkout` accepte déjà `date` et le trigger `sync_workout_weekly_totals` (migration 030) gère le changement de semaine (recalcul des deux semaines concernées). Aucun changement backend nécessaire pour la date.
  3. **Calendrier :** après sauvegarde, le workout peut être sur un autre jour/semaine. Le parent fait déjà `revalidatePath` + `router.refresh()` et `onWorkoutSaved(updatedWorkout)`. Vérifier que le re-fetch des workouts (plage affichée) est bien déclenché pour que la tuile disparaisse de l’ancien jour et apparaisse sur le nouveau. Si les données viennent des props serveur, un simple refresh suffit.

---

## 1. Vue d’ensemble et lien aux user stories

| User story | Thème | Fichiers principaux | Section spec |
|------------|--------|----------------------|--------------|
| **US1** | Données : statut + persistance | Migration, types, actions (athlète + coach) | §2, §3, §4 |
| **US2** | Tuiles calendrier (badge statut, métadonnées) | CalendarView | §5 |
| **US3** | Modale athlète (layout, statut, commentaire) | WorkoutModal, actions | §5, §6 |
| **US4** | Modale coach modifiable (date, sport, titre, objectifs) | WorkoutModal, actions, validation | §5, §6, §7 |
| **US5** | Modale coach lecture seule | WorkoutModal | §5, §6 |
| **US6** | Totaux « fait » (séances réalisées + règle Strava) | Lib + action + CalendarView / pages | §8 |
| **US7** | i18n et accessibilité | messages, composants | §9 |

---

## 2. Modèle de données (US1)

### 2.1 Table `workouts`

- **Ajout d’un champ** `status` :
  - Type : `TEXT`
  - Valeurs autorisées : `'planned'` | `'completed'` | `'not_completed'`
  - Contrainte : `CHECK (status IN ('planned', 'completed', 'not_completed'))`
  - Défaut : `'planned'`
  - Nullable : non (NOT NULL avec DEFAULT)

**Migration à créer** (ex. `031_workout_status.sql`) :

- `ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned'`
- `ADD CONSTRAINT workouts_status_check CHECK (status IN ('planned', 'completed', 'not_completed'))`
- `COMMENT ON COLUMN public.workouts.status IS 'Statut de réalisation : planned (planifié), completed (réalisé), not_completed (non réalisé). Modifiable par l’athlète.'`

Aucune nouvelle table. Pas de modification des tables `workout_weekly_totals` ou `imported_activity_weekly_totals` pour la structure (les totaux « fait » combinés sont calculés en application, voir §8).

### 2.2 Types TypeScript

- **Fichier :** `types/database.ts`
- **Modifier le type `Workout`** : ajouter  
  `status: 'planned' | 'completed' | 'not_completed'`
- Exporter un type (ex. `WorkoutStatus`) pour usage dans les composants et actions.

---

## 3. RLS (US1)

### 3.1 Comportement actuel

- **Coach** : `workouts_update_coach` — peut UPDATE toute ligne des workouts de ses athlètes.
- **Athlète** : `workouts_update_athlete_comment` — peut UPDATE les lignes où `athlete_id = auth.uid()` (tous les champs, tant que la ligne est la sienne).

### 3.2 Règles métier à respecter dans l’application

- **Athlète** : ne peut mettre à jour que `status`, `athlete_comment`, `athlete_comment_at` (une seule action dédiée, voir §4).
- **Coach** : ne doit **pas** modifier `status` (lecture seule). Le coach peut modifier `date`, `sport_type`, `title`, `description`, objectifs, etc. — mais pas `status`.

Comme Postgres RLS ne permet pas de restreindre facilement les colonnes modifiables par rôle, on impose la règle **dans le code** :

1. **Action athlète** `saveWorkoutStatusAndComment` : ne fait qu’un `UPDATE` avec `status`, `athlete_comment`, `athlete_comment_at` (cf. §4).
2. **Action coach** `updateWorkout` : ne doit **jamais** envoyer `status` dans le payload (ne pas lire `status` depuis le formData, ne pas l’inclure dans `.update()`). Ainsi le statut reste inchangé lors d’une édition coach.

Aucune nouvelle politique RLS ni modification des politiques existantes n’est requise pour satisfaire ces règles.

---

## 4. Logique métier et actions serveur (US1, US3, US4, US6)

### 4.1 Création d’entraînement (coach) – US1

- **Fichier :** `app/[locale]/dashboard/workouts/actions.ts`
- **Fonction :** `createWorkout`
- **Changement :** lors de l’`insert`, ne pas préciser `status` (le défaut BDD `'planned'` s’applique) ou passer explicitement `status: 'planned'`.

### 4.2 Mise à jour entraînement (coach) – US4, impact date

- **Fichier :** `app/[locale]/dashboard/workouts/actions.ts`
- **Fonction :** `updateWorkout`
- **Comportement :**
  - Continuer à accepter `date` dans le formulaire (déjà le cas) et l’inclure dans l’`.update()`.
  - **Ne jamais** inclure `status` dans l’objet passé à `.update()` (le coach ne modifie pas le statut).
- **Impact modification de la date :**
  - Aujourd’hui, le coach ne peut pas changer la date dans l’UI (la date est en hidden, valeur = date du jour de la cellule). Le trigger `sync_workout_weekly_totals` (migration 030) gère déjà un changement de date (mise à jour des deux semaines concernées).
  - En ajoutant un sélecteur de date dans la modale coach (US4), le formulaire enverra une nouvelle date possiblement différente. Après un `updateWorkout` réussi, le workout peut donc « changer de jour » (et de semaine). Le parent (CalendarView) fait déjà `router.refresh()` et `onWorkoutSaved(updatedWorkout)`. S’assurer que soit le refresh recharge bien les workouts pour la plage affichée, soit que le callback reçoit bien `updatedWorkout` avec la nouvelle `date` pour que le parent puisse mettre à jour l’état local (retirer l’ancien, ajouter au nouveau jour). **Recommandation :** garder `revalidatePath` + `router.refresh()` côté client pour recharger les données ; si le calendrier utilise un state local dérivé des props, le re-fetch serveur suffit.

### 4.3 Mise à jour statut + commentaire (athlète uniquement) – US1, US3

- **Fichier :** `app/[locale]/dashboard/workouts/actions.ts`
- **Nouvelle fonction (ou évolution de l’existant) :** `saveWorkoutStatusAndComment`
  - **Rôle :** permettre à l’athlète de mettre à jour en une seule requête : `status`, `athlete_comment`, `athlete_comment_at`.
  - **Paramètres :** `workoutId`, `athleteId`, `pathToRevalidate`, `prevState`, `formData`.
  - **Vérifications :** `requireCoachOrAthleteAccess` puis vérifier que l’utilisateur est l’athlète (`user.id === athleteId`). Si c’est le coach, retourner une erreur.
  - **Lecture formData :** `status` (valeurs autorisées : `planned` | `completed` | `not_completed`), `comment` (texte).
  - **UPDATE :** uniquement les champs `status`, `athlete_comment`, `athlete_comment_at` (pour `athlete_comment_at`, mettre une date si le commentaire est non vide, sinon null).
  - **Réponse :** même forme que `CommentFormState` (ou étendue avec `workout?: Workout` pour mise à jour optimiste).

On peut soit renommer/étendre `saveWorkoutComment` pour accepter aussi `status`, soit créer une nouvelle action dédiée. La spec recommande une seule action « save status + comment » pour l’athlète pour rester aligné avec l’UI (un seul bouton Enregistrer).

### 4.4 Totaux « fait » combinés (US6)

- **Règle (design §2–§3) :**  
  Total « fait » = (volume des activités importées) + (volume des séances avec `status = 'completed'`), **moins** le volume des séances « réalisées » qui ont une activité Strava **même jour et même type** (après mapping Strava → app).

- **Implémentation recommandée :**
  - **Pas de nouvelle table ni de trigger** pour ce « fait » combiné (la règle de déduplication dépend du mapping Strava → sport_type qui est en code).
  - **Nouvelle action serveur** (ex. `getEffectiveWeeklyTotalsFait`) dans `app/[locale]/dashboard/workouts/actions.ts` (ou un module dédié si préféré) :
    - **Entrée :** `athleteId`, `startDate`, `endDate` (plage de lundis / semaines).
    - **Étapes :**
      1. Récupérer `imported_activity_weekly_totals` pour l’athlète et la plage (déjà fait aujourd’hui par les pages).
      2. Récupérer les **workouts** avec `status = 'completed'` et `date` dans la plage.
      3. Récupérer les **imported_activities** pour l’athlète et la même plage (pour la règle même jour / même type).
      4. Pour chaque semaine et chaque sport, partir des totaux `imported_activity_weekly_totals`.
      5. Pour chaque workout « completed », calculer son volume (temps, distance, D+ selon les objectifs). Si une activité importée existe **le même jour** et **même type** (après mapping Strava → app), ne pas ajouter le volume de ce workout au « fait » ; sinon l’ajouter.
    - **Sortie :** structure identique ou très proche de `ImportedActivityWeeklyTotal[]` (par ex. par semaine + sport : `total_moving_time_seconds`, `total_distance_m`, `total_elevation_m`) pour alimenter `weekFaitBySport` dans CalendarView.

- **Mapping Strava → sport_type :** actuellement dans `app/[locale]/dashboard/devices/actions.ts` (`mapStravaTypeToSportType`). Pour US6, **extraire** cette logique dans un module partagé (ex. `lib/stravaMapping.ts`) et l’utiliser à la fois dans devices et dans le calcul des totaux « fait ». Référence : design §3 (table de correspondance).

- **Côté client :** les pages calendrier (athlète et coach) appellent aujourd’hui `getImportedActivityWeeklyTotals`. Pour afficher le « fait » incluant les séances réalisées sans double comptage, soit :
  - **Option A :** Remplacer l’appel par `getEffectiveWeeklyTotalsFait` et utiliser son résultat pour `weekFaitBySport` (recommandé).
  - **Option B :** Garder les deux appels et fusionner côté client (plus complexe et duplique la règle).

**Tests manuels recommandés (US6) :** créer un workout « completed » sans activité Strava le même jour → le total « fait » doit augmenter ; créer une activité Strava le même jour et même type → le total ne doit pas doubler.

---

## 5. Table des fichiers (créer / modifier)

| Fichier | Rôle | Créer / Modifier | User story |
|---------|------|-------------------|------------|
| `supabase/migrations/031_workout_status.sql` | Ajout colonne `status` + contrainte + commentaire | **Créer** | US1 |
| `types/database.ts` | Ajout `status` au type `Workout` (+ type `WorkoutStatus`) | **Modifier** | US1 |
| `lib/stravaMapping.ts` | Mapping type Strava → sport_type (exporté) | **Créer** (extraction depuis devices/actions) | US6 |
| `app/[locale]/dashboard/devices/actions.ts` | Utiliser `lib/stravaMapping.ts` au lieu de la fonction locale | **Modifier** | US6 |
| `app/[locale]/dashboard/workouts/actions.ts` | `createWorkout` : défaut status ; `updateWorkout` : ne pas envoyer status ; nouvelle action `saveWorkoutStatusAndComment` ; nouvelle action `getEffectiveWeeklyTotalsFait` | **Modifier** | US1, US3, US4, US6 |
| `lib/workoutValidation.ts` | Optionnel : validation `status` pour l’action athlète | **Modifier** (si validation dédiée) | US1 |
| `components/WorkoutModal.tsx` | Layout modale athlète (titre = titre séance, date · sport, objectifs + description, statut 3 segments, commentaire) ; modale coach modifiable (sélecteur date en-tête, SportTileSelectable, titre, objectifs, description, pas de label « Type de sport ») ; modale coach lecture seule (titre = titre séance, date · sport, pas de formulaire) ; condition d’édition : date future ET status !== 'completed' | **Modifier** | US3, US4, US5 |
| `components/CalendarView.tsx` | Tuiles : badge statut en fin de métadonnées ; bordure gauche inchangée (sport uniquement) ; appel totaux « fait » via nouvelle action si option A | **Modifier** | US2, US6 |
| `app/[locale]/dashboard/calendar/page.tsx` | Si option A : appeler `getEffectiveWeeklyTotalsFait` au lieu de (ou en plus de) `getImportedActivityWeeklyTotals` pour alimenter le « fait » | **Modifier** | US6 |
| `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | Idem : totaux « fait » via `getEffectiveWeeklyTotalsFait` si option A | **Modifier** | US6 |
| `messages/fr.json`, `messages/en.json` | Clés pour statut (Planifié, Réalisé, Non réalisé), placeholders, labels, aria | **Modifier** | US7 |
| `docs/DESIGN_SYSTEM.md` | Si nouveau composant (ex. sélecteur de date en-tête) : le documenter | **Modifier** (si applicable) | — |

---

## 6. Détails UI et composants (US3, US4, US5)

### 6.1 Modale athlète (US3)

- **Titre de la modale :** titre de la séance (pas la date).
- **Corps :** une ligne **date · sport** (date formatée + ` · ` + Badge variante sport du design system) ; bloc **Objectifs de la séance** (métriques avec icônes comme sur les tuiles, séparateur horizontal, description en texte, sans label « Description »).
- **Section retour :** sélecteur **statut** 3 segments (Planifié | Réalisé | Non réalisé), puis textarea commentaire (placeholder « Commentaires sur la séance pour votre coach »), bouton Enregistrer. Pas de titres « Statut de la séance » / « Votre commentaire ».
- **Formulaire :** soumission vers `saveWorkoutStatusAndComment` avec `status` + `comment`. Champs conformes à `lib/formStyles.ts` et composants `Textarea` / design system.

### 6.2 Modale coach modifiable (US4) – impact date

- **Condition d’affichage modifiable :** `date` (du workout) dans le futur **et** `status !== 'completed'`. Sinon, afficher en lecture seule (US5).
- **En-tête :** icône + **sélecteur de date** (affichage mois en toutes lettres, ex. « Lundi 3 mars 2026 », avec bouton calendrier) + badge **statut** (lecture seule). La date sélectionnée est envoyée dans le formulaire principal (champ `date`) ; aujourd’hui la date est en hidden et fixée à la date du jour de la cellule — il faut un **state local** pour la date quand le coach est en édition (initialisé à `workout.date`), et un contrôle (date picker) pour la modifier. Le formulaire doit soumettre cette date (pas seulement la date du jour d’ouverture).
- **Corps :** 1) Sport (`SportTileSelectable`, pas de label « Type de sport ») ; 2) Titre (champ éditable) ; 3) Objectifs de la séance (toggle Temps/Distance, grille avec icônes, ligne horizontale, description en textarea éditable sans label « Description ») ; 4) Commentaire de l’athlète (lecture seule). Footer : Supprimer, Enregistrer.
- **Composants :** `Input`, `Textarea`, `lib/formStyles.ts` pour tous les champs éditables.

**Point d’attention :** la modification de la date par le coach n’existe pas actuellement. Vérifier que :
- Le parent passe bien la date du workout (ex. `workout.date`) pour l’édition, et que la modale gère un state `editableDate` pour le coach qui peut différer de la date d’ouverture.
- Après sauvegarde, `revalidatePath` et le refresh côté client mettent bien à jour le calendrier (workout déplacé sur le nouveau jour).

### 6.3 Modale coach lecture seule (US5)

- Si **date dans le passé** OU **status = 'completed'** : aucun champ éditable, pas de boutons Supprimer/Enregistrer.
- Titre modale = titre de la séance. En-tête : badge statut. Corps : date · sport (Badge), Objectifs de la séance (métriques + ligne horizontale + description), Commentaire de l’athlète.

### 6.4 Tuiles calendrier (US2)

- **Bordure gauche :** inchangée, définie uniquement par le type de sport (`SPORT_CARD_STYLES`).
- **Métadonnées :** durée, distance, allure, D+ si présent, icône commentaire si présent, puis **badge statut** (Planifié / Réalisé / Non réalisé) en fin de ligne. Styles distincts pour Réalisé (vert) et Non réalisé (style distinct, ex. palette-danger ou neutre selon design system).

---

## 7. Validation et formulaire coach (US4)

- **Validation formulaire coach :** `validateWorkoutFormData` continue de recevoir `date` depuis le formulaire. Pour l’édition avec sélecteur de date, le champ `date` envoyé doit être la date choisie dans le sélecteur (format YYYY-MM-DD ou celui attendu par la validation).
- **Date :** le format attendu par le backend est un type date (string ISO ou YYYY-MM-DD). Le sélecteur de date (ex. input type date ou librairie) doit produire cette valeur. Affichage « mois en toutes lettres » (ex. « Lundi 3 mars 2026 ») : utiliser `formatDateFr` ou équivalent avec options `weekday: 'long'`, `month: 'long'`, etc., pour l’affichage uniquement ; la valeur soumise reste la date au format attendu.

---

## 8. Totaux « fait » – récap (US6)

- **Source de vérité pour la règle :** design §2 et §3 (évitement double comptage même jour + même type).
- **Implémentation :** action serveur `getEffectiveWeeklyTotalsFait` qui combine `imported_activity_weekly_totals` et workouts `status = 'completed'`, en soustrayant le volume des workouts qui ont une activité importée même jour et même type (mapping dans `lib/stravaMapping.ts`).
- **Consommation :** pages calendrier athlète et coach utilisent ce résultat pour `weekFaitBySport` (remplacer ou compléter l’appel actuel à `getImportedActivityWeeklyTotals` selon le choix option A/B).

---

## 9. i18n et accessibilité (US7)

- **Namespace :** ex. `workouts` (ou `calendar` pour libellés de tuiles). Clés pour : Planifié, Réalisé, Non réalisé ; titre modale ; placeholders (commentaire athlète) ; labels (sélecteur de date : « Choisir une date » ou équivalent) ; boutons.
- **Accessibilité :** labels explicites ou `aria-label` sur les boutons et champs ; sélecteur de date accessible (nom, rôle, valeur).

---

## 10. Points à trancher en implémentation

1. **Sélecteur de date (coach) :** utiliser un input HTML5 `type="date"` avec un libellé formaté à côté (mois en lettres) ou une librairie (ex. date picker) selon le design system et l’UX. Documenter dans DESIGN_SYSTEM si nouveau composant réutilisable.
2. **SportTileSelectable :** vérifier qu’il existe dans le design system / les composants ; si la modale coach utilise aujourd’hui une grille de boutons, le remplacer par `SportTileSelectable` comme dans le mockup.
3. **Ordre des champs coach (modifiable) :** dans le mockup, l’ordre est Sport → Titre → Objectifs (dont description). L’ordre actuel de WorkoutModal (date en haut, puis sport, objectifs, titre, description) peut différer — aligner sur le mockup.
4. **Réutilisation de `saveWorkoutComment` :** soit étendre cette action pour accepter `status`, soit créer `saveWorkoutStatusAndComment` et faire pointer le formulaire athlète vers celle-ci ; supprimer ou déprécier l’ancienne si plus utilisée.

---

## 11. Tests manuels recommandés

- **US1 :** Créer un workout par le coach → vérifier `status = planned`. En tant qu’athlète, mettre à jour statut et commentaire → vérifier en BDD et en rafraîchissant.
- **US2 :** Vérifier les tuiles (badge statut, métadonnées, bordure gauche inchangée).
- **US3 :** Modale athlète : titre = titre séance, date · sport, objectifs + description, 3 segments + commentaire, enregistrement.
- **US4 :** Modale coach modifiable : changer la date, enregistrer → le workout doit apparaître sur le nouveau jour après refresh ; sport, titre, objectifs, description éditables.
- **US5 :** Séance passée ou réalisée → modale coach en lecture seule, pas de boutons.
- **US6 :** Séance réalisée sans Strava même jour → total « fait » augmente ; avec Strava même jour et même type → pas de double comptage.
- **US7 :** Basculer FR/EN, vérifier tous les libellés ; tester au clavier et avec un lecteur d’écran sur le sélecteur de date et les segments de statut.

---

**Document :** `docs/design-workout-status/SPEC_WORKOUT_STATUS.md`  
**Lié à :** `USER_STORIES_WORKOUT_STATUS.md`, `DESIGN_WORKOUT_STATUS.md`, `workout-status-mockup.html`
