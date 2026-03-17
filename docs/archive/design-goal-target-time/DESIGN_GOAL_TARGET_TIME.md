# Design : Objectif de temps facultatif sur les objectifs

**Mode :** Designer  
**Date :** 16 mars 2026  
**Contexte :** Lors de la création d’un objectif (course/événement), l’athlète peut ajouter un **objectif de temps** facultatif. Ce temps cible doit être visible sur les tuiles d’objectif pour l’athlète et pour le coach.

---

## 1. Reformulation du besoin

- **Objectif :** À la **création** et à l’**édition** d’un objectif (page Objectifs), l’athlète peut renseigner un **objectif de temps** (temps cible, ex. « viser 3h30 ») en **facultatif**. Ce temps cible est enregistré avec l’objectif et affiché sur **toutes les tuiles d’objectif** : page Objectifs (athlète), calendrier (tuiles jour + modale détail objectif), vue coach (liste objectifs athlète + modale détail). Pour les objectifs passés avec résultat, la tuile affiche **les deux** (objectif de temps et résultat réalisé).
- **Contraintes :** Réutiliser le modèle existant des objectifs ; format du temps cohérent avec le résultat (heures, minutes, secondes). Pas de modification du flux « résultat » (saisi après la course).
- **Périmètre :**
  - **Formulaire d’ajout d’objectif** : `ObjectifsTable.tsx` (colonne droite, formulaire « Ajouter un objectif »).
  - **Édition d’objectif** : modale ou formulaire « Modifier l’objectif » (nom, date, distance, priorité, objectif de temps) — l’athlète peut modifier un objectif existant.
  - **Tuiles objectif** : `ObjectifsTable.tsx`, `CoachAthleteCalendarPage.tsx`, `CalendarView.tsx` (tuiles jour + modale détail), `ActivityTile.tsx` (type goal) si les props le permettent.

---

## 2. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal – création avec objectif de temps** | L’athlète remplit nom, date, distance, priorité et optionnellement un temps cible (h, min, s). À l’envoi, l’objectif est créé avec le temps cible. Les tuiles affichent « Objectif : 3h30 » (ou équivalent). |
| **Nominal – création sans objectif de temps** | L’athlète ne remplit pas le bloc temps cible. Comportement actuel : tuiles sans mention de temps jusqu’à éventuel résultat passé. |
| **Objectif futur avec temps cible** | Sur la tuile : affichage du temps cible (ex. « Objectif : 3h30 ») à côté de la distance. |
| **Objectif passé avec temps cible et résultat** | Sur la tuile : afficher les deux (ex. « Objectif 3h30 · Réalisé 3h45 ») pour permettre la comparaison. |
| **Objectif passé avec temps cible, sans résultat** | Afficher uniquement « Objectif : 3h30 » (comme pour un futur). |
| **Validation** | Si l’athlète remplit au moins un des trois champs (h, min, s), les **trois sont requis** (validation côté serveur). Mêmes bornes que le résultat : h 0–99, min/s 0–59. |
| **Édition d’objectif** | L’athlète peut **modifier** un objectif existant (nom, date, distance, priorité, objectif de temps) via un bouton « Modifier » sur la tuile ou une modale détail, ouvrant une modale / formulaire d’édition. Le résultat (temps réalisé, place, note) reste géré séparément (GoalResultModal pour les objectifs passés). |

---

## 3. Décisions PO (validé le 16 mars 2026)

- **Édition :** Oui — l’athlète peut modifier l’objectif (nom, date, distance, priorité, objectif de temps) après création.
- **Affichage tuile (passé) :** Oui — afficher **les deux** côte à côte sur la tuile (ex. « Objectif 3h30 · Réalisé 3h45 »).
- **Formulaire objectif de temps :** Pas d’encadré autour du bloc objectif de temps ; pas de texte d’aide (« Temps cible pour la course… Si vous renseignez un champ, les trois sont requis »). Uniquement le label « Objectif de temps (facultatif) » et les 3 champs (Heures, Minutes, Secondes). Règle de validation inchangée : si un champ est renseigné, les trois sont requis.

---

## 4. Structure actuelle des écrans concernés

### 4.1 Formulaire d’ajout d’objectif (page Objectifs)

- **Fichier :** `app/[locale]/dashboard/objectifs/ObjectifsTable.tsx`.
- **Structure actuelle :** Bloc « Ajouter un objectif » avec : Nom de la course, Date, Distance (km), Priorité (Principal / Secondaire), bouton « Ajouter un objectif ». Pas de champ temps.

### 4.2 Tuiles objectif – Page Objectifs

- **Fichier :** `ObjectifsTable.tsx` (TileCard par objectif).
- **Affichage actuel :** Bloc date (mois/jour), nom, priorité (badge), ligne « distance km » puis pour les objectifs **passés** : « temps · place » si résultat renseigné, sinon « Pas de résultat saisi ». Aucun temps cible aujourd’hui.

### 4.3 Tuiles objectif – Calendrier (athlète et coach)

- **Fichiers :** `CalendarView.tsx` (tuiles jour + modale détail objectif), `CoachAthleteCalendarPage.tsx` (liste objectifs + même rendu tuiles), `ActivityTile.tsx` (type `goal` : titre, date, distance).
- **Modale détail objectif (CalendarView) :** Date, Nom, Distance, Type (Principal/Secondaire), et si résultat : section « Résultat » (temps, place, note). Pas d’affichage temps cible.

### 4.4 Vue coach – Liste objectifs athlète

- **Fichier :** `CoachAthleteCalendarPage.tsx` (drawer ou section objectifs avec tuiles identiques à la page Objectifs). Même structure : date, nom, distance, priorité, résultat si passé.

---

## 5. Composants existants à réutiliser

| Composant | Usage |
|-----------|--------|
| `Input` | Champs h, min, s pour l’objectif de temps (type number, min/max comme GoalResultModal) |
| `TileCard` | Tuiles objectif (déjà utilisées) |
| `Modal` | Modale détail objectif (CalendarView) — ajout d’une ligne « Objectif de temps » si présent |
| `lib/formStyles.ts` | Styles des champs |
| `lib/goalResultUtils.ts` | Étendre avec `hasTargetTime(goal)`, `formatTargetTime(goal)` (même format que `formatGoalResultTime`) pour affichage cohérent |

**À faire évoluer :**

- **ObjectifsTable** : formulaire d’ajout : ligne « Objectif de temps (facultatif) » (label + 3 champs h, min, s) **sans encadré ni texte d’aide** ; bouton « Modifier » sur chaque tuile ouvrant la modale d’édition ; tuiles : afficher le temps cible quand présent (ligne « Objectif : XhYmin »), et pour les passés avec résultat « Objectif X · Réalisé Y ».
- **Modale d’édition d’objectif** (nouvelle ou existante) : champs nom, date, distance, priorité, objectif de temps (h, min, s) ; pas d’encadré autour de l’objectif de temps.
- **actions.ts (objectifs)** : `addGoal` et `updateGoal` acceptent les champs optionnels `target_time_hours`, `target_time_minutes`, `target_time_seconds`.
- **CalendarView** : modale détail objectif : ajout d’une ligne « Objectif de temps » si présent ; tuiles jour : afficher le temps cible sur la tuile objectif (texte court).
- **CoachAthleteCalendarPage** : tuiles objectifs : même affichage temps cible que ObjectifsTable.
- **ActivityTile** (type goal) : si les données goal sont passées avec le temps cible, afficher « Objectif : 3h30 » sous la distance (optionnel selon complexité des props).
- **goalResultUtils.ts** : `hasTargetTime(goal)`, `formatTargetTime(goal)`.

---

## 6. Propositions UI (2 solutions)

Deux options d’intégration du bloc « Objectif de temps » dans le formulaire sont proposées. L’affichage sur les tuiles est identique pour les deux.

### Solution A — Objectif de temps (facultatif) toujours visible, sans encadré

- **Place :** Dans le formulaire « Ajouter un objectif » (et dans le formulaire d’édition), après le sélecteur Priorité et avant le bouton de soumission.
- **Contenu :** Label « Objectif de temps (facultatif) » puis 3 champs sur une ligne : Heures, Minutes, Secondes (mêmes contraintes que la modale Résultat : h 0–99, min/s 0–59). **Pas d’encadré** (pas de bordure ni fond) autour de ce bloc ; **pas de texte d’aide**. Si l’utilisateur remplit au moins un champ, les 3 sont requis (validation côté serveur).
- **Tuiles :** Pour tout objectif (futur ou passé) avec temps cible : sous la ligne « distance km », afficher « Objectif : 3h30 ». Pour un objectif **passé** avec résultat : « Objectif 3h30 · Réalisé 3h45 » (et place si présente).
- **Modale détail (calendrier) :** Ligne « Objectif de temps » avec la valeur formatée si présente.

### Solution B — Bloc repliable « Objectif de temps (facultatif) », sans encadré

- Même contenu que A (label + 3 champs h/min/s, sans encadré ni texte d’aide), dans un **repliable** (ex. « Objectif de temps (facultatif) ▼ »). Fermé par défaut.

---

## 7. Récapitulatif des mockups

| Fichier | Contenu |
|---------|---------|
| `MOCKUP_GOAL_TARGET_TIME_FORM_A.html` | Formulaire « Ajouter un objectif » : objectif de temps (facultatif) toujours visible, sans encadré ni texte d’aide (Solution A). |
| `MOCKUP_GOAL_TARGET_TIME_FORM_B.html` | Formulaire avec repliable « Objectif de temps (facultatif) », sans encadré ni texte d’aide (Solution B). |
| `MOCKUP_GOAL_TARGET_TIME_TILES.html` | Tuiles objectif : futur avec temps cible ; passé avec cible + résultat ; passé avec cible sans résultat. Modale détail avec ligne « Objectif de temps ». |

---

## 8. Suite

- Choix **Solution A ou B** pour le formulaire (objectif de temps sans encadré ni texte d’aide dans les deux cas).
- Découpage en **user stories** avec critères d’acceptation et référence aux mockups, puis passage en mode Architecte pour spec technique (migration BDD, RLS, actions, modale édition, fichiers).
