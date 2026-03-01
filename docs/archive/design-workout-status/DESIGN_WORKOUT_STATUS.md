# Design – Statut de réalisation des séances (planifié / réalisé / non réalisé)

**Mode :** Designer  
**Contexte :** Les entraînements créés par le coach sont affichés dans le calendrier de l’athlète sans notion de « fait » ou « non fait ». L’athlète peut ajouter un commentaire. Le « total d’activité » affiche un **prévu** (somme des séances planifiées) et un **fait** (Strava + séances marquées réalisées, avec règle d’évitement du double comptage).

---

## 1. Reformulation du besoin

- **Objectif :** Permettre à l’athlète d’indiquer pour chaque séance planifiée s’il l’a **réalisée** ou **non réalisée**, afin que les séances réalisées comptent dans le total d’activité « fait ».
- **Statut par défaut :** À la création par le coach, la séance a le statut **planifié**.
- **Actions athlète :** Réalisé ou Non réalisé. Seules les séances **réalisées** entrent dans le calcul du « fait » (sous réserve de la règle Strava ci‑dessous).
- **Périmètre UI :** Calendrier (tuiles, modale athlète + modale coach), bloc totaux hebdomadaires.

---

## 2. Règle « fait » et évitement du double comptage (Strava)

- **Règle :** Si l’athlète a **une activité Strava importée le même jour et du même type** (après correspondance Strava ↔ app), on **n’ajoute pas** la séance marquée « réalisée » au « fait » (pour éviter de compter deux fois la même activité).
- **Sinon :** on ajoute le volume de la séance réalisée au « fait ».

La correspondance **type Strava → type app** utilisée pour comparer « même type » est celle du mapping d’import (voir tableau §3). Ainsi, une séance coach « course » + une activité Strava « Run » le même jour → on ne double pas ; une séance « course » sans Strava Run ce jour‑là → on compte la séance réalisée dans le fait.

---

## 3. Table de correspondance Strava ↔ App (sport_type)

Mapping utilisé à l’import (`app/[locale]/dashboard/devices/actions.ts` : `mapStravaTypeToSportType`) et pour la règle même jour / même type :

| Type app (coach / workout) | Types Strava (API) mappés vers ce sport |
|----------------------------|------------------------------------------|
| **course** | Run, VirtualRun, Trail Run, et tout type non reconnu (fallback) |
| **velo** | Ride, VirtualRide, EBikeRide, EMountainBikeRide, GravelRide, Handcycle, Velomobile |
| **natation** | Swim |
| **musculation** | Yoga, WeightTraining, Workout, Crossfit |
| **nordic_ski** | NordicSki, Ski (si non Alpine, non RollerSki) |
| **backcountry_ski** | BackcountrySki |
| **ice_skating** | IceSkate |

**Types Strava non mappés vers les sports coach (ex. Hike, Walk, AlpineSki, Snowboard, Rowing, etc.) :**  
À l’import, ils sont actuellement mappés en fallback sur `course`. Pour la règle « même jour / même type », on compare uniquement les **sport_type** après ce mapping (ex. une activité Strava « Hike » stockée en `course` et une séance coach `course` le même jour = même type, on n’ajoute pas la séance réalisée au fait).

*Note :* Les sports que le coach peut proposer en création de séance sont aujourd’hui : course, velo, natation, musculation (voir `WORKOUT_SPORT_TYPES` dans WorkoutModal). Les types nordic_ski, backcountry_ski, ice_skating sont supportés en BDD et calendrier (totaux, couleurs) pour cohérence avec les activités Strava importées.

---

## 4. Réponses PO (décisions)

| Question | Décision |
|----------|----------|
| **Total d’activité « fait »** | Si une activité Strava existe le **même jour** et le **même type** (après mapping), on **n’ajoute pas** la séance réalisée ; sinon on l’ajoute. |
| **Date (futur)** | Aucune règle spécifique : pas de restriction sur les dates pour marquer réalisé / non réalisé. |
| **Commentaire « non réalisé »** | Utiliser le **champ commentaire existant** de l’activité ; pas de champ dédié « non réalisé ». |
| **Coach** | Le coach **voit** le statut (planifié / réalisé / non réalisé) sur les tuiles et dans la modale ; **pas de filtre** pour l’instant. |

---

## 5. Contraintes design (tuiles et modales)

- **Tuiles calendrier :**
  - La **couleur de la bordure gauche** dépend **uniquement du type de sport** (SPORT_CARD_STYLES) ; le statut ne change pas cette couleur.
  - Affichage : **badge sport** (icône + type), **titre**, **description** (line-clamp), puis ligne de métadonnées : **temps**, **distance**, **vitesse/allure**, **D+** si présent, **icône commentaire** si présent, **badge statut** (Planifié / Réalisé / Non réalisé).
- **Objectifs et sport dans les modales :** Réutiliser les **mêmes icônes que sur les tuiles** (horloge = durée, règle = distance, éclair = vitesse/allure, courbe = D+) pour les objectifs ; **tuile sport** avec icône du type (course, vélo, natation, musculation) comme sur le calendrier.
- **Modale athlète :** Respect du design system (Modal, `px-6 py-4`). Bloc séance : date, **sport = même tuile que sur la carte** (non éditable : rounded-xl border-2, icône + libellé, couleur selon sport), objectifs (avec icônes comme tuiles), titre, description. Puis **statut** (3 segments), **puis commentaire** en dessous (sans titres). Placeholder : « Commentaires sur la séance pour votre coach ». Un bouton Enregistrer. Pas de phrase « Seules les séances Réalisé… ».
- **Modale coach :**
  - **Statut en haut** de la modale.
  - **Modifiable** : En-tête = icône + **sélecteur de date** (affichage mois en toutes lettres, ex. « Lundi 3 mars 2026 », avec bouton calendrier) + badge statut. Corps : **Sport** (`SportTileSelectable`), **Titre** (champ éditable), **Objectifs de la séance** (toggle Temps/Distance, grille avec icônes, ligne horizontale, **description** en textarea sans label), bloc « Commentaire de l’athlète » (lecture seule), footer Supprimer / Enregistrer. Champs conformes à `lib/formStyles.ts` (Input, Textarea).
  - **Lecture seule** : Titre modale = **titre de la séance**. En-tête : badge statut. Corps : **date · sport** (badge variante sport), **Objectifs de la séance** (métriques + ligne horizontale + description en texte), Commentaire de l’athlète. Pas de champ Titre ni footer.
  - Une séance **dans le passé** ou déjà **réalisée** s’ouvre en **lecture seule** (pas de formulaire, pas de boutons).

---

## 6. Mockup unique (choix retenus)

**Fichier :** `workout-status-mockup.html`

- **Tuiles :** Style solution 1 (bordure = sport, métadonnées + badge statut).
- **Modale athlète :** Structure solution 1 (contenu complet) avec **choix de statut en 3 segments** (solution 3). **Optimisation d’espace :** en-tête réduit, bloc séance compact (labels en `text-[10px]`, espacement `space-y-3`), section « Votre retour » en **2 colonnes** (md+) : commentaire (textarea 2 lignes + Enregistrer) | statut (3 segments + courte aide).
- **Modale coach :** Deux états dans le mockup :
  1. **Modifiable** (date future, statut planifié) : formulaire + bloc Retour athlète + footer Supprimer / Enregistrer.
  2. **Lecture seule** (date passée ou statut réalisé) : mêmes blocs en lecture seule, pas de footer.

---

## 7. Découpage en user stories

Découpage en user stories avec critères d’acceptation et Voir **`USER_STORIES_WORKOUT_STATUS.md`** dans le même dossier : 7 user stories (US1–US7) avec critères d'acceptation et référence aux zones du mockup. Ordre suggéré : US1 → US2–US5 → US6 → US7.

**Spec technique (pour le développeur) :** voir **`SPEC_WORKOUT_STATUS.md`** dans le même dossier (architecture, migrations, RLS, actions, impacts, table des fichiers, relié aux user stories).
