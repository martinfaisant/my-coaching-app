# Design — Intensité prévisionnelle (RPE) séance

**Version :** 1.0  
**Date :** 11 mai 2026  
**Statut :** Phase 2 Designer — solution validée par le PO (Option A, textes RPE figés FR ; EN proposés pour implémentation i18n).  
**Périmètre :** modale entraînement coach / athlète, tuiles calendrier, règle de complétude retour intensité perçue.

**Spec technique (Architecte) :** [`SPEC_ARCHITECTE_RPE_PLANNED_INTENSITY.md`](./SPEC_ARCHITECTE_RPE_PLANNED_INTENSITY.md)

**Références code existant (analyse Designer) :** `components/WorkoutModal.tsx`, `components/workout-modal/CoachWorkoutForm.tsx`, `components/workout-modal/views/AthleteWorkoutModalView.tsx`, `components/workout-modal/views/CoachReadOnlyWorkoutModalView.tsx`, `components/workout-modal/WorkoutFeedbackSection.tsx`, `components/workout-modal/WorkoutFeedbackSummary.tsx`, `components/workout-modal/WorkoutTargetActualCards.tsx`, `components/CalendarView.tsx`, `lib/workoutFeedbackColors.ts`, `docs/DESIGN_SYSTEM.md` (Modal, Segments, tokens), `lib/formStyles.ts`.

---

## Solution validée

1. **Échelle** : RPE **1 à 10** entier, même granularité que l’intensité perçue existante côté retour athlète.
2. **Coach — saisie** : champ **facultatif** dans le bloc **« Objectifs de la séance »** (sous les métriques volume / allure / D+ selon sport). Grille de dix boutons ; **pas de tableau ni modale « échelle complète »**.
3. **Aide contextuelle (Option A)** — **uniquement en saisie** (coach édition, athlète sur le picker d’intensité **ressentie**) : sous la grille 1–10, **encart** avec titre `{RPE} — {Intensité}` + description courte (liste FR / EN). **En lecture seule** (athlète consultation, coach vue séance non modifiable / réalisée) : **affichage compact uniquement**, comme `WorkoutFeedbackSummary` / `IntensityCard` — libellé + tuile `w-12 h-12` avec le chiffre + texte « / 10 » (`summary.feedback.intensityScale`), **sans** grille 1–10 ni texte descriptif long ; couleurs **`INTENSITY_TILE_CLASSES`** pour cohérence avec l’intensité perçue.
4. **Si aucune valeur sélectionnée** (coach n’a pas défini d’intensité prévue) : pas d’encart **ou** encart discret « Aucune intensité cible » — **À trancher en implémentation** : préférence produit **masquer totalement** l’encart lorsque `null` / effacé (moins de bruit). Les maquettes US1 montrent les deux variantes.
5. **Coach — édition** : l’intensité prévue **évolue comme les autres champs** tant que la séance est modifiable (`canEdit` inchangé : jour futur / règles calendrier existantes).
6. **Athlète — affichage** : RPE prévu en **lecture seule** dans la **carte Objectif** de `WorkoutTargetActualCards`, au **format compact** identique à l’intensité perçue vue par le coach (`IntensityCard` : valeur + « / 10 », classes `INTENSITY_TILE_CLASSES`). Les textes longs RPE restent réservés à la **saisie** (coach + picker ressenti athlète).
7. **Tuile calendrier** : si une intensité prévue est persistée, **badge compact** neutre (ex. `RPE 7` ou `7`) — **couleur de la tuile = sport uniquement** (règle projet) ; le badge reste **stone** / neutre, pas de statut sur la bordure sport.
8. **Athlète — retour intensité perçue** :
   - si **intensité prévue coach absente** : saisie intensité perçue **facultative** (comportement actuel) ;
   - si **intensité prévue coach présente** : saisie intensité perçue **obligatoire** lors de l’action d’enregistrement qui inclut le retour (statut réalisé + feedback — flux à cadrer avec l’Architecte sur la même server action que aujourd’hui) ;
   - **Récap / résumé** : ne **pas afficher** de ligne dédiée à l’intensité **perçue** athlète si aucune valeur ; l’intensité **prévue** reste affichée si présente.
9. **Coach — lecture seule** : intensité prévue au **format compact** (`IntensityCard`) dans la **carte Objectif**, comme pour le retour intensité athlète dans `WorkoutFeedbackSummary`.

---

## Hypothèses

- **H1** : Les textes FR des 10 niveaux ci-dessous sont **la source produit** pour les clés i18n ; les EN de l’annexe sont une **proposition** de traduction (à relire PO si besoin).
- **H2** : Le nom technique du champ en BDD (`planned_rpe` ou autre) est **hors périmètre Designer** — tranché en Mode Architecte.
- **H3** : L’accessibilité suit le pattern actuel du feedback : `role="group"`, `aria-pressed` sur chaque bouton, `aria-label` sur le groupe.

---

## User stories

### US-RPE-01 — Coach : définir une intensité prévue (facultatif)

**Objectif :** Le coach peut renseigner ou modifier une intensité prévisionnelle 1–10 dans les objectifs de séance, avec aide par encart, ou laisser vide.

**Critères d’acceptation**

1. Le bloc « Objectifs de la séance » contient après les champs métier existants une sous-zone **« Intensité prévue (RPE) »** avec hint du type *Facultatif — 1 = très léger, 10 = maximal* (i18n).
2. Dix boutons **1** à **10** ; un seul sélectionnable à la fois ; état visuel sélection = style cohérent avec le feedback intensité (`palette-forest-dark`) ou variante **légèrement plus neutre** si le Designer valide un léger écart pour distinguer « consigne » / « ressenti » — **à trancher** : par défaut **réutiliser le même style sélection** que `WorkoutFeedbackSection` pour cohérence d’échelle.
3. Au changement de sélection, l’encart affiche immédiatement le **titre** et la **description** du niveau (table FR / clés i18n).
4. Le coach peut **retirer** la sélection (effacer l’intensité prévue) si le produit prévoit un contrôle explicite — **recommandation** : bouton lien secondaire *« Effacer l’intensité cible »* ou resélection impossible sans clear — **À trancher PO** : maquette US1 variante B avec bouton effacer.
5. La valeur est **soumise avec le formulaire** séance comme les autres champs objectifs.
6. Aucun écran « échelle RPE complète » (ni modale dédiée).

**Fichier HTML associé :** `MOCKUP_US1_COACH_PLANNED_RPE_SESSION_GOALS.html`  
**Ce que montre le fichier :** états « aucune sélection », « niveau sélectionné + encart », variante « bouton effacer », grille responsive (wrap).

---

### US-RPE-02 — Athlète : consulter l’intensité prévue dans la modale

**Objectif :** L’athlète voit l’intensité fixée par le coach, avec la même description courte que le coach.

**Critères d’acceptation**

1. Si une intensité prévue est persistée : affichage **lecture seule** dans la **carte Objectif** de `WorkoutTargetActualCards` (sous les lignes métriques) : **même pattern visuel que `IntensityCard`** dans `WorkoutFeedbackSummary` (libellé i18n distinct « intensité prévue coach », tuile chiffre, « / 10 »), **pas** de grille 1–10, **pas** d’encart texte descriptif.
2. Si absente : **aucune** sous-section « intensité prévue » dans la carte Objectif (pas de placeholder).
3. Les clés i18n des niveaux RPE (US-RPE-01) servent à la **saisie** (coach + picker ressenti) ; en **lecture seule** athlète, seule la **valeur** compacte est affichée (pas de texte descriptif long dans la carte Objectif).
4. La cible RPE prévue est visible **dans la carte Objectif** au-dessus du bandeau formulaire (statut / retour), pour l’enchaînement *consigne → ressenti*.

**Fichier HTML associé :** `MOCKUP_US2_ATHLETE_MODAL_PLANNED_RPE.html`  
**Ce que montre le fichier :** même gabarit que la vue athlète actuelle (`AthleteWorkoutModalView`) : bandeau date, **`WorkoutTargetActualCards`**, intensité prévue **compacte** dans la carte Objectif (équivalent `IntensityCard`) ; bandeau bas formulaire statut ; cas sans RPE.

---

### US-RPE-03 — Calendrier : indicateur RPE sur la tuile séance

**Objectif :** Repérer vite les séances avec une cible RPE, sans ouvrir la modale.

**Critères d’acceptation**

1. Si intensité prévue **persistée** : badge ou pastille **compact** visible sur la **tuile** entraînement (vues liste / grille / mois selon ce qui existe déjà pour la densité — **implémentation** : ne pas déborder sur le texte titre).
2. Style **neutre** (`stone` / texte secondaire) ; **pas** de couleur de statut sur la bordure gauche sport.
3. `aria-label` / title i18n du type « Intensité prévue RPE 7 ».

**Fichier HTML associé :** `MOCKUP_US3_CALENDAR_WORKOUT_TILE_RPE.html`  
**Ce que montre le fichier :** tuile avec / sans badge RPE ; exemple mobile étroit.

---

### US-RPE-04 — Athlète : intensité perçue obligatoire si prévue ; récap sans ligne vide

**Objectif :** Forcer la cohérence prévu / ressenti lorsque le coach a posé une cible ; éviter les lignes vides en résumé.

**Critères d’acceptation**

1. Si `planned_rpe` (nom indicatif) **non null** et l’athlète enregistre avec statut **Réalisé** (ou équivalent métier déjà en place) **sans** choisir d’intensité perçue : **message d’erreur** visible sous la zone intensité perçue (i18n), enregistrement **refusé**.
2. Si pas d’intensité prévue : intensité perçue **facultative** (comportement inchangé).
3. Dans `WorkoutFeedbackSummary` (ou équivalent) : **aucune** carte / ligne « intensité perçue » si valeur absente ; si présente, affichage inchangé par rapport au design actuel.
4. Lorsque les deux existent (récap coach ou écran de synthèse) : **deux blocs** au format `IntensityCard` côte à côte (comme `WorkoutFeedbackSummary`), libellés i18n distincts **Intensité prévue** / **Intensité ressentie** (ou équivalent), chacun **valeur + « / 10 »** uniquement.

**Fichier HTML associé :** `MOCKUP_US4_ATHLETE_REQUIRED_PERCEIVED_INTENSITY.html`  
**Ce que montre le fichier :** message d’erreur validation ; rappel RPE prévu **compact** (`IntensityCard`) au-dessus du picker ressenti ; récap avec **deux** tuiles « / 10 » (prévu / ressenti) ; récap sans ligne ressenti si absente.

---

### US-RPE-05 — Coach : consulter une séance non modifiable

**Objectif :** Le coach voit l’intensité prévue en **lecture seule**, au même format compact que l’intensité perçue athlète, lorsque la séance n’est pas modifiable.

**Critères d’acceptation**

1. Dans la **carte Objectif** : affichage **compact** (`IntensityCard` + `INTENSITY_TILE_CLASSES`), pas de grille ni description RPE longue.
2. Même enchaînement vertical que `CoachReadOnlyWorkoutModalView` : cartes objectif / réalisé, puis `WorkoutFeedbackSummary`.

**Fichier HTML associé :** `MOCKUP_US5_COACH_READONLY_PLANNED_RPE.html`  
**Ce que montre le fichier :** aligné sur `CoachReadOnlyWorkoutModalView` : **`WorkoutTargetActualCards`** avec RPE prévu **compact** dans la carte Objectif, puis **`WorkoutFeedbackSummary`**.

---

## Table de contenu RPE (FR — source produit)

| RPE | Intensité (FR) | Description (FR) |
|-----|----------------|------------------|
| 1 | Très léger | Effort minimal, respiration tout à fait normale. |
| 2 | Léger | Rythme facile, conversation totalement fluide. |
| 3 | Modéré | Effort calme, respiration très régulière. |
| 4 | Actif | Effort dynamique, essoufflement très léger. |
| 5 | Difficile | Effort sensible, discussion plus ardue. |
| 6 | Vigoureux | Rythme soutenu, seulement quelques mots. |
| 7 | Très difficile | Effort pénible, essoufflement très marqué. |
| 8 | Exténuant | Intensité haute, souffle très court. |
| 9 | Limite | Effort extrême, parole quasiment impossible. |
| 10 | Maximal | Épuisement total, effort physique absolu. |

### Proposition EN (i18n `messages/en.json`)

| RPE | Intensity (EN) | Description (EN) |
|-----|----------------|------------------|
| 1 | Very easy | Minimal effort, completely normal breathing. |
| 2 | Easy | Easy pace, conversation totally fluid. |
| 3 | Moderate | Calm effort, very steady breathing. |
| 4 | Steady | Dynamic effort, very slight breathlessness. |
| 5 | Hard | Noticeable effort, conversation harder to sustain. |
| 6 | Vigorous | Sustained pace, only a few words at a time. |
| 7 | Very hard | Tough effort, marked breathlessness. |
| 8 | Exhausting | High intensity, very short breaths. |
| 9 | Limit | Extreme effort, speech almost impossible. |
| 10 | Maximal | Total exhaustion, all-out physical effort. |

**Namespace i18n probable (non contractuel tant que l’Architecte n’a pas livré la spec) :** sous `workouts` — ex. `workouts.rpe.levels.{1..10}.intensity`, `workouts.rpe.levels.{1..10}.description`, `workouts.form.plannedRpeLabel`, `workouts.form.plannedRpeHint`, `workouts.summary.plannedRpe`, `workouts.validation.perceivedIntensityRequiredWhenPlanned`, `calendar.workoutTile.plannedRpeAriaLabel`, etc. **À figer avec** `docs/I18N.md` **lors de l’implémentation.**

---

## Composants à utiliser tels quels

- `Modal` — si un jour un détail légal / aide longue ; **hors scope** actuel.
- `Segments` — inchangé pour Temps/Distance dans objectifs.
- `Input`, `Textarea` — champs existants objectifs.
- `lib/formStyles.ts` — labels / erreurs.
- Tokens Tailwind `palette-forest-dark`, `stone-*` — pas de hex en dur dans le code React (les HTML maquettes CDN peuvent dupliquer les hex pour autonomie du fichier).

---

## Composants à faire évoluer ou extraire

- **`CoachWorkoutForm`** / **`WorkoutModal`** : ajouter zone RPE + encart + hidden input ou contrôle contrôlé existant.
- **`AthleteWorkoutModalView`** / **`WorkoutFeedbackSection`** : ordre des blocs, validation visuelle, libellés distincts prévu / ressenti.
- **`WorkoutTargetActualCards`** : bloc « intensité prévue » en lecture seule — **réutiliser le même layout que `IntensityCard`** (`WorkoutFeedbackSummary.tsx`, `INTENSITY_TILE_CLASSES`) avec libellé i18n dédié ; factoriser si pertinent pour éviter la duplication.
- **`CalendarView`** (tuile entraînement) : slot badge RPE.
- **Optionnel** : extraire **`RpeLevelPicker`** + **`RpeSelectedLevelCard`** réutilisables (coach + athlète + read-only) — si duplication > seuil projet (~80 %), documenter dans `docs/DESIGN_SYSTEM.md` après livraison.

---

## Points ouverts (implémentation / PO)

| Sujet | Décision attendue |
|--------|-------------------|
| Effacer la sélection coach | Bouton « Effacer » explicite vs seulement en création — maquette US1 propose un exemple. |
| Encart quand pas de valeur | Masquer complètement vs message neutre. |
| Style sélection boutons | Identique au feedback vs variante neutre « consigne ». |
| Tuile mois condensée | Si pas assez de place, tronquer le badge (ex. « 7 » seul) — à valider sur vraie grille. |

---

## Fichiers de maquette (index)

| Fichier | User story |
|---------|------------|
| `MOCKUP_OPTION_A_RPE_MODAL.html` | Référence **interactive** (grille + encart dynamique) — alignée Option A. |
| `MOCKUP_US1_COACH_PLANNED_RPE_SESSION_GOALS.html` | US-RPE-01 |
| `MOCKUP_US2_ATHLETE_MODAL_PLANNED_RPE.html` | US-RPE-02 |
| `MOCKUP_US3_CALENDAR_WORKOUT_TILE_RPE.html` | US-RPE-03 |
| `MOCKUP_US4_ATHLETE_REQUIRED_PERCEIVED_INTENSITY.html` | US-RPE-04 |
| `MOCKUP_US5_COACH_READONLY_PLANNED_RPE.html` | US-RPE-05 |
| `MOCKUP_OPTION_B_RPE_INLINE.html` | **Non retenu** (référence historique seulement). |

---

## Hors périmètre / rôle suivant

- **Mode Architecte** : migration BDD, contraintes, RLS, `saveWorkout` / `saveWorkoutStatusAndComment`, typage `Workout`, chargement SSR calendrier pour le badge.
- **Mode Développeur** : implémentation.
- **Reviewer Tech / Analyste** : post-code ; mise à jour `Project_context.md`, `DESIGN_SYSTEM.md`, `I18N.md` après verdict.

---

## En attente de validation PO (checklist Designer Phase 2)

- [ ] Validation explicite des **points ouverts** (effacer, encart vide, style boutons, tuile condensée).
- [ ] Validation des **traductions EN** proposées ou corrections fournies.

Une fois coché, le **Mode Architecte** peut produire la spec technique et la table des fichiers.
