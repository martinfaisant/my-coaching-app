# Spec technique : Objectifs et résultats dans la demande de coaching

**Mode :** Architecte  
**Date :** 16 mars 2026  
**Référence :** `docs/design-request-goals/DESIGN_REQUEST_GOALS.md` (user stories §8), mockups SOLUTION_RETENUE, MODAL_AJOUT, MODAL_VOIR_PLUS, COACH_TILE.  
**Décision PO :** Option B — bouton « Modifier le résultat » dans la section demande (ouvre GoalResultModal). Pas de snapshot objectifs ; pas de section objectifs dans le flux sans offre.

---

## 1. Données et RLS

### 1.1 Modèle de données

- **Aucune nouvelle table.** Réutilisation de la table **`goals`** (athlete_id, date, race_name, distance, is_primary, target_time_*, result_*).
- **Pas de snapshot** : à l’envoi de la demande, on ne copie pas les objectifs dans `coach_requests`. Le coach lit les objectifs **courants** de l’athlète (requête sur `goals` avec `athlete_id`).
- Les objectifs ajoutés depuis la modale d’ajout (demande) sont insérés dans `goals` avec `athlete_id = current user` ; ils apparaissent sur la page Objectifs et dans la tuile coach comme les autres.

### 1.2 RLS — Lecture des objectifs par le coach (demande en attente)

Aujourd’hui le coach peut SELECT sur `goals` uniquement pour les athlètes dont `profiles.coach_id = auth.uid()` (policy `goals_select_coach`). Pour une **demande en attente**, l’athlète n’a pas encore de `coach_id` ; le coach doit malgré tout pouvoir **lire** les objectifs de cet athlète.

- **Migration** : ajouter une policy `goals_select_coach_pending` sur `goals` pour SELECT :
  - `athlete_id IN (SELECT athlete_id FROM public.coach_requests WHERE coach_id = auth.uid() AND status = 'pending')`
- Ainsi le coach voit les objectifs des athlètes qui ont une demande en attente chez lui, sans modifier les policies existantes (athlète, coach de ses athlètes).

---

## 2. Actions serveur

### 2.1 Réutilisation / évolution

| Action | Fichier | Modification |
|--------|---------|--------------|
| **addGoal** | `app/[locale]/dashboard/objectifs/actions.ts` | **Étendre** : accepter en FormData les champs **résultat** optionnels (`result_time_hours`, `result_time_minutes`, `result_time_seconds`, `result_place`, `result_note`). Si `date < today` et ces champs sont renseignés (temps requis), les inclure dans l’`insert` et valider comme dans `saveGoalResult` (bornes, note max 500). Après insert : `revalidatePath('/dashboard/objectifs')`, `revalidatePath('/dashboard/calendar')`, **`revalidatePath('/dashboard/find-coach')`**. |
| **saveGoalResult** | idem | **Étendre** : après succès, ajouter **`revalidatePath('/dashboard/find-coach')`** pour que la liste objectifs dans la modale demande se rafraîchisse après « Modifier le résultat ». |
| **createCoachRequest** | `app/[locale]/dashboard/actions.ts` | **Aucun changement** de signature (pas de paramètre objectifs). Les objectifs sont déjà en base. |

### 2.2 Nouvelle action (optionnelle selon implémentation)

- **getGoalsForRequest(athleteId)** : utilisable côté **coach** pour charger les objectifs d’un athlète ayant une demande en attente. Vérifier que l’appelant est bien le coach de la demande (`coach_requests` où `athlete_id = athleteId` et `coach_id = auth.uid()` et `status = 'pending'`) ou que l’athlète charge ses propres objectifs (`athleteId === auth.uid()`). Retourner les goals triés par **date décroissante** (plus récent en premier). Utilisation possible depuis le serveur (page) pour fournir les goals à PendingRequestTile sans action client dédiée si on préfère tout charger en page.

---

## 3. Tri et filtrage

- **Tri unique** : **date décroissante** (du plus récent au plus vieux), partout :
  - Liste dans le formulaire de demande (athlète),
  - Modale « Voir plus » (athlète : liste mixte ; coach : par bloc Objectifs / Résultats),
  - Blocs Objectifs et Résultats dans PendingRequestTile.
- **Objectifs à venir** : `goal.date > today`.
- **Résultats (passés)** : `goal.date <= today` (avec ou sans résultat saisi). Affichage visuel : bande grise (objectif passé sans résultat = même style que résultat).
- **Limite affichée** : au plus **5** par liste (formulaire demande) ou par bloc (coach). Au-delà : bouton « Voir plus (n) » qui ouvre la modale liste complète.

---

## 4. Fichiers — Créer / Modifier

| Fichier | Rôle | Action |
|---------|------|--------|
| **supabase/migrations/057_goals_select_coach_pending.sql** | RLS : coach peut SELECT goals des athlètes avec demande en attente | **Créer** |
| **app/[locale]/dashboard/objectifs/actions.ts** | addGoal : champs résultat optionnels si date passée ; revalidate find-coach. saveGoalResult : revalidate find-coach | **Modifier** |
| **app/[locale]/dashboard/find-coach/page.tsx** | Charger les goals de l’athlète courant (order date desc), passer en props à FindCoachSection | **Modifier** |
| **app/[locale]/dashboard/FindCoachSection.tsx** | Section « Objectifs de course / résultats passés » (états vide / liste), bouton Ajouter, liste triée (5 max), différenciation visuelle (bande ambre/sage / grise), bouton « Modifier le résultat » sur les tuiles passées avec résultat → GoalResultModal, bouton « Voir plus » ; intégrer GoalResultModal et modale d’ajout + modale Voir plus | **Modifier** |
| **app/[locale]/dashboard/objectifs/GoalResultModal.tsx** | Optionnel : accepter une prop **onSuccess** (callback après sauvegarde réussie) pour que le parent puisse appeler `router.refresh()` et fermer la modale (contexte demande) | **Modifier** (optionnel) |
| **Composant modale d’ajout objectif (demande)** | Formulaire nom, date, distance, priorité, objectif de temps (facultatif), résultat si date passée ; action addGoal | **Créer** (ex. `RequestGoalAddModal.tsx` dans dashboard ou dans objectifs) |
| **Composant modale « Voir plus »** | Liste complète des objectifs (tri date desc), lecture seule, même style tuiles, scroll | **Créer** (ex. `RequestGoalsListModal.tsx`) |
| **app/[locale]/dashboard/PendingRequestTile.tsx** | Ajouter deux blocs « Objectifs » et « Résultats » ; recevoir en props `goals: Goal[]` (ou goals passés par la page) ; afficher au plus 5 par bloc, tri date desc, **tuiles sur deux lignes** (ligne 1 : date, nom, badge ; ligne 2 : distance · temps/objectif/place) ; bande ambre/sage / bande grise ; bouton « Voir plus » par bloc → modale liste complète du bloc | **Modifier** |
| **app/[locale]/dashboard/athletes/page.tsx** (ou page qui rend PendingRequestTile) | Charger les goals des athlètes ayant une demande en attente (requête goals où athlete_id IN (athlete_ids des pending requests)), passer à chaque PendingRequestTile les goals de l’athlète concerné | **Modifier** |
| **app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx** | Afficher la section objectifs/résultats en lecture seule (même logique que formulaire : liste triée, 5 max, « Voir plus » si > 5). Reçoit les goals en props (depuis FindCoachSection / find-coach). | **Modifier** |
| **messages/fr.json**, **messages/en.json** | Clés i18n pour la section objectifs/résultats (titres, boutons Ajouter, Voir plus, Modifier le résultat, états vides, modales) | **Modifier** |

---

## 5. Flux principaux

### 5.1 Athlète — Formulaire de demande (CoachDetailModal)

1. **Page find-coach** : charge les goals de l’athlète (order by date desc), les passe à `FindCoachSection`.
2. **CoachDetailModal** (dans FindCoachSection) reçoit `initialGoals: Goal[]`.
3. **État vide** (aucun goal) : message + bouton « Ajouter un objectif ou résultat passé » → ouvre **RequestGoalAddModal** (formulaire addGoal, avec résultat si date passée). Après succès : fermer la modale, `router.refresh()` pour recharger les goals depuis la page.
4. **État avec liste** : titre de section + bouton « Ajouter » sur une ligne ; liste des 5 premiers (tri date desc) ; tuiles avec différenciation visuelle (bande ambre/sage / bande grise) ; pour chaque objectif **passé avec résultat**, bouton **« Modifier le résultat »** → ouvre **GoalResultModal** (goal, onClose qui appelle `router.refresh()` après fermeture si besoin). Si > 5 goals : bouton « Voir plus (n) » → **RequestGoalsListModal** (liste complète).
5. **GoalResultModal** : réutiliser le composant existant ; après `saveGoalResult` réussi, revalidate find-coach déjà fait côté action ; le parent peut fermer la modale et appeler `router.refresh()` pour mettre à jour la liste (les goals viennent des props rechargées par la page).

### 5.2 Coach — Tuile demande en attente

1. **Page athletes** (ou équivalent) : pour chaque demande en attente, récupérer les goals de `request.athlete_id` (une requête batch : goals où athlete_id IN (...)). Passer à chaque `PendingRequestTile` les goals de l’athlète.
2. **PendingRequestTile** : split des goals en **Objectifs** (date > today) et **Résultats** (date <= today), chacun trié date desc, 5 max ; affichage **deux lignes** par tuile ; bouton « Voir plus » par bloc ouvrant une modale liste complète (même composant RequestGoalsListModal en mode « Objectifs » ou « Résultats »).

### 5.3 Athlète — Modale « Ma demande envoyée »

- **AthleteSentRequestDetailModal** reçoit les goals en props (même source que le formulaire). Affiche la section objectifs/résultats en lecture seule (liste, 5 max, « Voir plus »). Pas de bouton « Modifier le résultat » dans cette modale si le design le précise (lecture seule) ; si on souhaite permettre la modification ici aussi, réutiliser GoalResultModal comme dans le formulaire.

---

## 6. i18n

- **Namespace** : ex. `coachRequests.goals` ou réutilisation partielle de `goals.*` + nouvelles clés `requestGoals.*`.
- **Clés utiles** : titre section « Objectifs de course / résultats passés », « Aucun objectif ou résultat pour l’instant », « Ajouter un objectif ou résultat passé », « Ajouter », « Voir plus (n) », « Modifier le résultat », « Aucun objectif », « Aucun résultat », titre modale ajout « Ajouter un objectif ou résultat passé », titre modale « Tous mes objectifs et résultats » / « Objectifs » / « Résultats ». Voir `docs/I18N.md` pour structure.

---

## 7. Tests manuels recommandés

- Athlète sans objectif : ouvrir demande, voir état vide, ajouter un objectif (futur et passé avec résultat), vérifier liste et apparition sur page Objectifs.
- Athlète avec > 5 objectifs : vérifier affichage des 5 premiers (tri date desc) et bouton « Voir plus ».
- Depuis la demande : sur un objectif passé avec résultat, cliquer « Modifier le résultat », modifier et enregistrer ; vérifier mise à jour de la liste sans quitter la modale demande.
- Coach : ouvrir une demande en attente, vérifier les deux blocs Objectifs / Résultats avec tuiles deux lignes, bandes colorées/grises, « Voir plus » par bloc.
- Vérifier qu’aucun objectif n’est stocké dans `coach_requests` (pas de snapshot).

---

## 8. Points laissés à l’implémentation

- **Emplacement exact des composants** : `RequestGoalAddModal` et `RequestGoalsListModal` dans `app/[locale]/dashboard/` ou dans `app/[locale]/dashboard/objectifs/` (à trancher selon préférence colocation).
- **GoalResultModal onSuccess** : soit callback `onSuccess` passé par le parent pour `router.refresh()` + fermeture, soit fermeture simple et revalidation suffisante (refresh au prochain focus/navigation). Préférer callback pour feedback immédiat.
- **AthleteSentRequestDetailModal** : afficher ou non un bouton « Modifier le résultat » (design actuel = lecture seule ; si on l’ajoute, même pattern que dans CoachDetailModal).
