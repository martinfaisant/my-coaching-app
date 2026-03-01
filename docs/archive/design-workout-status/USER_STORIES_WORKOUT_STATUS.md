# User stories – Statut de réalisation des séances

**Référence :** design `DESIGN_WORKOUT_STATUS.md` et mockup `workout-status-mockup.html`.  
**Situation actuelle :** pas de champ `status` sur les workouts ; totaux « fait » = uniquement activités Strava importées ; modale athlète/coach sans statut ni mise en page du mockup.

---

## US1 — Données : statut de réalisation et persistance

**En tant que** système,  
**je veux** que chaque entraînement ait un statut (planifié / réalisé / non réalisé) et que l'athlète puisse le modifier avec son commentaire,  
**afin que** le « fait » hebdomadaire et l'affichage reflètent la réalité.

**Critères d'acceptation :**
- La table `workouts` (ou équivalent) dispose d'un champ `status` avec valeurs `planned` | `completed` | `not_completed` (affichage i18n : Planifié, Réalisé, Non réalisé).
- À la création d'un entraînement par le coach, `status` = « planifié » par défaut.
- Une action (ex. server action) permet à l'athlète de mettre à jour le statut et le commentaire (`athlete_comment` / `athlete_comment_at`) en une seule requête. Seul l'athlète propriétaire peut modifier le statut.
- RLS : lecture pour coach/athlète concernés ; mise à jour statut + commentaire réservée à l'athlète.

**Référence mockup :** section « Modale athlète » — sélecteur 3 segments + textarea commentaire + Enregistrer.

---

## US2 — Tuiles calendrier : affichage du statut et métadonnées

**En tant qu'** athlète ou coach,  
**je veux** voir sur chaque tuile le statut (Planifié / Réalisé / Non réalisé) et les métadonnées (durée, distance, allure, D+, icône commentaire),  
**afin que** je comprenne d'un coup d'œil l'état et le contenu de la séance.

**Critères d'acceptation :**
- Chaque tuile affiche un **badge de statut** en fin de ligne de métadonnées : « Planifié » (neutre), « Réalisé » (vert), « Non réalisé » (style distinct). **Mockup :** tuiles calendrier (l.34–118).
- La **bordure gauche** reste définie **uniquement par le type de sport** (SPORT_CARD_STYLES).
- Métadonnées : durée (icône horloge), distance (icône règle), vitesse/allure (icône éclair), D+ si présent, icône commentaire si présent, puis badge statut.

**Référence mockup :** section « Tuiles calendrier » (3 tuiles : Planifié, Réalisé, Non réalisé).

---

## US3 — Modale athlète : mise en page et comportement

**En tant qu'** athlète,  
**je veux** une modale dont le titre est le titre de la séance, avec date · sport, objectifs + description dans un bloc, puis statut et commentaire,  
**afin que** je consulte et mette à jour mon retour sans surcharge.

**Critères d'acceptation :**
- **Titre modale** = titre de la séance (ex. « Sortie endurance »). **Mockup :** l.129–133.
- **Corps :** ligne **date · sport** (date formatée + point + Badge variante sport) ; bloc **Objectifs de la séance** (métriques avec icônes tuiles, ligne horizontale, description en texte, sans label « Description »). **Mockup :** l.136–164.
- **Section retour :** sélecteur **statut** 3 segments (Planifié | Réalisé | Non réalisé) ; textarea commentaire, placeholder « Commentaires sur la séance pour votre coach » ; bouton Enregistrer. Pas de titres « Statut de la séance » / « Votre commentaire ».
- Champs conformes au design system (`lib/formStyles.ts`, `Textarea`).
- Enregistrer envoie statut + commentaire (US1) et rafraîchit/ferme.

**Référence mockup :** section « Modale athlète » (l.125–178).

---

## US4 — Modale coach : séance modifiable (date, sport, titre, objectifs, description)

**En tant que** coach,  
**je veux** modifier la date, le sport, le titre, les objectifs et la description d'une séance tant qu'elle est à venir et non réalisée,  
**afin que** j'ajuste le planning et le contenu.

**Critères d'acceptation :**
- **En-tête :** icône + **sélecteur de date** (affichage **mois en toutes lettres**, ex. « Lundi 3 mars 2026 », + bouton calendrier) + badge **statut** (lecture seule). **Mockup :** l.185–205.
- **Corps, ordre :** 1) **Sport** (SportTileSelectable, pas de label « Type de sport ») ; 2) **Titre** (champ éditable) ; 3) **Objectifs de la séance** (toggle Temps/Distance, grille avec icônes, ligne horizontale, **description** en textarea éditable **sans** label « Description ») ; 4) Commentaire de l'athlète (lecture seule). **Mockup :** l.206–266.
- **Footer :** Supprimer l'entraînement, Enregistrer.
- Tous les champs utilisent `Input`, `Textarea`, `lib/formStyles.ts`.
- Date modifiable en en-tête ; affichage avec mois en toutes lettres (format FR).

**Référence mockup :** section « Modale coach modifiable » (l.181–272).

---

## US5 — Modale coach : séance en lecture seule

**En tant que** coach,  
**je veux** que les séances passées ou déjà « réalisée » s'ouvrent en lecture seule (titre = titre de la séance, pas de formulaire ni boutons),  
**afin que** je voie les infos sans modification accidentelle.

**Critères d'acceptation :**
- Si **date dans le passé** OU **statut = réalisé** → modale **lecture seule** (aucun champ éditable, pas de boutons).
- **Titre modale** = titre de la séance (ex. « Home trainer 1h »). **Mockup :** l.277–282.
- **En-tête :** icône + titre séance + badge statut.
- **Corps :** ligne **date · sport** ; bloc Objectifs de la séance (métriques, ligne horizontale, description) ; Commentaire de l'athlète. Pas de champ « Titre » ni « Description » séparé. **Mockup :** l.283–324.

**Référence mockup :** section « Modale coach lecture seule » (l.274–326).

---

## US6 — Totaux hebdomadaires « fait » : séances réalisées + règle Strava

**En tant qu'** athlète ou coach,  
**je veux** que le total « fait » inclue les séances « réalisées », sans double comptage avec une activité Strava même jour + même type,  
**afin que** le volume affiché soit correct.

**Critères d'acceptation :**
- Total « fait » = (volume Strava importé) + (volume séances `status` = réalisé), **moins** le volume des séances réalisées qui ont une activité Strava **même jour et même type** (mapping §2–§3 du design).
- Mapping type : table correspondance design (Run → course, Ride → velo, Swim → natation, etc.).
- Totaux par semaine (référence `workout_weekly_totals` / `imported_activity_weekly_totals` ou équivalent).

**Référence :** design §2 et §3 (règle et table Strava ↔ app).

---

## US7 — i18n et accessibilité

**En tant qu'** utilisateur FR ou EN,  
**je veux** que les libellés (Planifié, Réalisé, Non réalisé, titres, placeholders, boutons) soient traduits et les contrôles accessibles,  
**afin que** l'usage soit clair dans ma langue et pour les technologies d'assistance.

**Critères d'acceptation :**
- Tous les textes visibles en i18n (next-intl), namespace ex. `workouts`. **Référence :** `docs/I18N.md`.
- Boutons et champs avec labels / `aria-label` ; sélecteur de date avec « Choisir une date » ou équivalent.

**Référence :** design system et `docs/I18N.md`.

---

## Récapitulatif

| # | User story | Dépendances |
|---|------------|-------------|
| US1 | Données statut + persistance | — |
| US2 | Tuiles calendrier (badge statut, métadonnées) | US1 |
| US3 | Modale athlète (layout, statut, commentaire) | US1 |
| US4 | Modale coach modifiable (date, sport, titre, objectifs, description) | US1 |
| US5 | Modale coach lecture seule | US1 |
| US6 | Totaux « fait » (séances réalisées + règle Strava) | US1 |
| US7 | i18n et accessibilité | US2–US6 |

**Composants design system :**
- **Tuiles :** `SPORT_CARD_STYLES`, `SPORT_ICONS`, `SPORT_TRANSLATION_KEYS` ; Badge (statut).
- **Modale athlète :** `Modal`, `Button`, `Textarea`, `Badge` (sport) ; icônes objectifs comme CalendarView.
- **Modale coach :** `Modal`, `Button`, `Input`, `Textarea`, `SportTileSelectable` ; sélecteur date (mois en lettres) ; `Badge` (statut, sport lecture seule).
- **Formulaires :** `lib/formStyles.ts`.
