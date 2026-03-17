# Design : Objectifs et résultats passés dans la demande de coaching

**Mode :** Designer  
**Date :** 15 mars 2026  
**Contexte :** Lors de sa demande de coaching, l’athlète doit pouvoir ajouter des objectifs (courses/événements) et des résultats passés. Ces éléments doivent être enregistrés, visibles dans la vue Objectifs ensuite, et visibles par le coach dans la demande.

---

## 1. Reformulation du besoin

- **Objectif :** Dans le parcours « Demande de coaching » (modale détail coach ou bouton Choisir ce coach), l’athlète peut **associer des objectifs** (courses/événements avec date, nom, distance, priorité, et **objectif de temps** facultatif) et, pour les objectifs déjà passés, **saisir un résultat** (temps, place, note). Les objectifs créés ou modifiés dans ce contexte sont **persistés** dans la table `goals` et restent visibles sur la **page Objectifs** ; le **coach** les voit dans la **demande** (tuile en attente et, le cas échéant, modale détail). **Données :** la table `goals` comporte déjà les colonnes `target_time_hours`, `target_time_minutes`, `target_time_seconds` (migration 056) ; voir `lib/goalResultUtils.ts` (`hasTargetTime`, `formatTargetTime`) et `docs/design-request-goals/DESIGN_GOAL_TARGET_TIME.md`.
- **Contraintes :** Réutiliser le modèle de données `goals` existant (pas de doublon métier) ; garder une UX claire dans un formulaire déjà riche (offre, sports, objectifs/volume, besoin).
- **Périmètre :**
  - **Formulaire de demande** : CoachDetailModal (FindCoachSection.tsx), éventuellement RequestCoachButton si le flux sans offre est conservé.
  - **Vue athlète « Ma demande envoyée »** : AthleteSentRequestDetailModal — afficher les objectifs en lecture seule.
  - **Vue coach « Demandes en attente »** : PendingRequestTile — afficher les objectifs (et résultats) de l’athlète.
  - **Page Objectifs** : aucun changement de structure ; les objectifs ajoutés depuis la demande y apparaissent comme les autres.

---

## 2. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal – athlète sans objectifs** | La section affiche l’**état vide** et un bouton « Ajouter un objectif ou résultat passé ». L’athlète peut envoyer la demande sans objectif (section **optionnelle**). S’il ajoute via la modale, les objectifs sont enregistrés dans `goals` et apparaissent dans la section puis sur la page Objectifs et dans la vue coach. |
| **Nominal – athlète avec objectifs** | La section affiche la **liste** (tri du plus récent au plus vieux, au plus 5), **lecture seule**. L’athlète peut **uniquement voir** les objectifs existants et **en ajouter** via le bouton « Ajouter » (modale). Pas d’édition ni suppression depuis la demande. |
| **Objectif passé + résultat** | Lors de l’**ajout** (dans la modale), si la date est passée, les champs **résultat** (temps, place, note) sont affichés et remplissables dans la même modale. |
| **Plus de 5 objectifs** | Liste **triée du plus récent au plus vieux** ; on affiche au plus **5**. Un bouton **« Voir plus (n) »** (sous le dernier item, même largeur qu’une tuile) ouvre une modale avec la **liste complète** en lecture seule. Idem pour le coach (deux blocs Objectifs / Résultats, « Voir plus » par bloc). |
| **Erreur / validation** | Champs objectif vides, date invalide, etc. — messages d’erreur cohérents (i18n). Validation identique à la page Objectifs pour l’ajout. |
| **Limites** | Pas de snapshot dans `coach_requests` : affichage des objectifs **courants** de l’athlète (table `goals`). |

---

## 3. Réponses du PO (décisions)

1. **Obligatoire ou optionnel ?** → **Optionnel.** L’athlète peut envoyer la demande sans aucun objectif ni résultat.

2. **Édition / suppression dans la demande** → L’athlète peut **uniquement voir** les objectifs existants dans la demande (lecture seule). Il ne peut pas les modifier ni les supprimer depuis le formulaire de demande ; il peut seulement **en ajouter** (via la modale d’ajout).

3. **Résultat pour objectif passé** → Il faut pouvoir **saisir un résultat** (temps, place, note) lors de l’ajout d’un objectif passé — donc champs résultat intégrés dans le formulaire d’ajout (dans la modale lorsque la date est passée).

4. **Nombre affiché et tri** → Liste **triée du plus récent au plus vieux** (date décroissante). On affiche **au maximum 5** ; un bouton **« Voir plus (n) »** (sous le dernier item, même largeur qu’une tuile) ouvre la modale liste complète. **Idem pour le coach** : deux blocs Objectifs / Résultats, max 5 par bloc, « Voir plus » par bloc. **Objectif passé sans résultat** = même affichage visuel que résultat (bande grise).

5. **Place dans le formulaire** → Section entre « Objectifs et volume par sport » et « Besoin de coaching » (déjà retenue).

---

## 4. Structure actuelle des écrans concernés

### 4.1 Formulaire de demande (CoachDetailModal)

- **Fichier :** `app/[locale]/dashboard/FindCoachSection.tsx` (CoachDetailModal).
- **Structure actuelle (une fois une offre sélectionnée) :**
  - Titre « Compléter ma demande »
  - Optionnel : Prénom / Nom (si non renseignés au profil)
  - **Sports pratiqués** (SportTileSelectable)
  - **Objectifs et volume par sport** (temps à allouer/sem. + volumes par sport, D+ si trail)
  - **Besoin de coaching** (Textarea)
  - Bouton « Envoyer la demande »
- **Données envoyées :** `createCoachRequest(coachId, sports, need, offerId, locale, firstName?, lastName?, weeklyTargetHours, volumeBySport)` — pas de paramètre objectifs aujourd’hui.

### 4.2 Tuile demande en attente (coach)

- **Fichier :** `app/[locale]/dashboard/PendingRequestTile.tsx`.
- **Structure :** En-tête (avatar, nom · offre, badges sport, boutons Discuter / Refuser / Accepter) ; corps en **2 colonnes** : « Message de l’athlète » (coaching_need) | « Objectifs et volume (athlète) » (temps à allouer + volumes par sport). Aucune section objectifs (goals) actuellement.

### 4.3 Modale « Ma demande envoyée » (athlète)

- **Fichier :** `app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx`.
- **Contenu :** Détail de la demande (offre, sports, message, objectifs et volume). Pas d’affichage des objectifs de course (goals).

### 4.4 Page Objectifs

- **Fichier :** `app/[locale]/dashboard/objectifs/page.tsx`, `ObjectifsTable.tsx`.
- **Contenu :** Liste des objectifs par saison (TileCard, date, nom, distance, priorité, résultat si passé), formulaire d’ajout (race_name, date, distance, is_primary), GoalResultModal pour saisir/modifier le résultat d’un objectif passé. Les objectifs créés depuis la demande y apparaîtront comme les autres (même table `goals`).

---

## 5. Composants existants à réutiliser

| Composant | Usage |
|-----------|--------|
| `Input`, `Textarea` | Champs nom, date, distance, besoin (déjà dans le formulaire) |
| `Button` | Envoyer demande, Ajouter un objectif, Saisir résultat |
| `TileCard` | Affichage d’un objectif (liste dans la demande ou dans la tuile coach) — comme sur la page Objectifs |
| `Modal` | Si saisie résultat dans une modale depuis la demande |
| `SportTileSelectable` | Déjà utilisé pour sports pratiqués |
| `lib/formStyles.ts` | Classes des champs |
| `lib/sportStyles.ts` | Non utilisé pour les objectifs (objectifs = courses, pas par sport) |
| `lib/goalResultUtils.ts` | hasGoalResult, formatGoalResultTime, formatGoalResultPlaceOrdinal pour l’affichage résultat |
| Styles tuile objectif (ObjectifsTable) | Bloc date (mois/jour), nom, distance, priorité, résultat — à réutiliser en lecture seule ou version compacte |

**À faire évoluer (selon solution retenue) :**

- **CoachDetailModal** : ajout d’une section « Objectifs de course / résultats passés » avec **deux états** (vide | avec liste). Liste **triée du plus récent au plus vieux**, au plus 5, **différenciation visuelle** (bande ambre/sage / bande grise). Titre + bouton « Ajouter » sur une ligne ; bouton « Voir plus » sous le dernier item si > 5. Chargement des objectifs existants (athlete_id = current user) ; à l’envoi, `createCoachRequest` (objectifs déjà en base).
- **Modale d’ajout** : formulaire (nom, date, distance, priorité, objectif de temps facultatif, résultat si date passée). Action `addGoal` (réutiliser celle de la page Objectifs).
- **PendingRequestTile** : **deux blocs** « Objectifs » et « Résultats » ; liste triée, max 5 par bloc, même design tuiles, « Voir plus » sous le dernier item par bloc.
- **AthleteSentRequestDetailModal** : section objectifs/résultats en lecture seule (même logique que formulaire demande).
- **Modale « Voir plus »** : liste complète des objectifs (ou des résultats selon le bloc) en lecture seule, style compact, scroll si besoin. Réutilisable côté athlète (demande) et côté coach.
- **RequestCoachButton** : si le flux sans offre conserve un formulaire complet, appliquer la même section objectifs (alignement avec CoachDetailModal).

---

## 6. Propositions UI (historique)

Les solutions A (formulaire inline), B (section repliable) et C (lien vers page Objectifs) ont été écartées. **Solution retenue** : §6.1. Les mockups A, B et C ont été supprimés ; seuls les mockups listés en §7 sont conservés pour l’implémentation.

*(Solutions A, B et C écartées ; détail retiré, mockups supprimés.)*

---

## 6.1 Solution retenue (PO)

**Choix :** Section avec **deux états** (sans objectif/résultat | avec au moins un) + **formulaire d’ajout dans une modale** (ouvert par un bouton) + liste **triée du plus récent au plus vieux** (au plus 5 affichés) + **« Voir plus »** sous le dernier item (même largeur qu’une tuile) ouvrant une modale avec la liste complète. **Différenciation visuelle** : objectifs à venir = bande ambre/sage ; passés (avec ou sans résultat) = bande grise. **Objectif passé sans résultat** = même affichage que résultat (bande grise).

### État 1 — Sans objectif ni résultat

- La section « Objectifs de course / résultats passés » affiche un **état vide** : message du type « Aucun objectif ou résultat pour l’instant » (ou équivalent i18n) et un **bouton** « Ajouter un objectif ou résultat passé » (ou « Ajouter »). Le bouton ouvre une **modale** contenant le formulaire d’ajout.

### État 2 — Avec au moins un objectif ou résultat

- La section affiche une **liste compacte** (lecture seule), **triée du plus récent au plus vieux** (date décroissante), au plus **5** éléments. Affichage : **une ligne par tuile** (date · nom · infos) ; **différenciation visuelle** : objectifs à venir = bande ambre/sage ; passés (avec ou sans résultat) = bande grise. Si objectif de temps : « 42 km · Objectif 3h30 » ; si passé avec résultat : « 21 km · 1h42 · 24e » ou « Objectif X · Réalisé Y · place ».
- **Titre de section** et **bouton « Ajouter »** sur la **même ligne** (titre à gauche, bouton à droite). Le bouton ouvre la **modale** d’ajout.
- Si **plus de 5** : bouton **« Voir plus (n) »** **sous le dernier item**, **même largeur qu’une tuile**, ouvre la modale liste complète en lecture seule.

### Modale « Ajouter un objectif ou résultat passé »

- Contenu : **formulaire** (nom de la course, date, distance, priorité Principal/Secondaire), **objectif de temps (facultatif)** : 3 champs Heures, Minutes, Secondes (même règle que page Objectifs : si un champ renseigné, les trois sont requis ; bornes h 0–99, min/s 0–59). Si la **date** saisie est **passée**, les champs **Résultat** apparaissent dans la modale : Temps (h, min, s), Place (optionnel), Note (optionnel). Soumission « Ajouter » : création en base (objectif + objectif de temps si renseigné + résultat si passé), fermeture de la modale, mise à jour de la liste. Composant : `Modal` ; réutiliser la logique et les champs de la page Objectifs / `addGoal` (déjà `target_time_*`).

### Lecture seule dans la demande

- Les objectifs **déjà en base** affichés dans la section sont **lecture seule** (pas d’édition ni suppression depuis la demande). Pour modifier un résultat existant, l’athlète le fait sur la page Objectifs (ou on peut prévoir un lien « Modifier le résultat » ouvrant GoalResultModal — à trancher en implémentation).

### Vue coach (et athlète « Ma demande envoyée »)

- **Deux blocs** : **« Objectifs »** et **« Résultats »**. Dans chaque bloc : **tuiles sur deux lignes** (plus d’infos visibles), liste triée du plus récent au plus vieux, au plus 5 affichés ; bande ambre/sage / bande grise ; **bouton « Voir plus »** sous le dernier item si > 5.
- **Affichage objectif de temps :** pour les objectifs à venir, si un **objectif de temps** (temps cible) est renseigné, l’afficher (ex. « 42 km · Objectif 3h30 »). Pour les résultats passés qui avaient un objectif de temps, afficher « Objectif X · Réalisé Y · place » (voir `formatTargetTime` et `formatGoalResultTime` dans `lib/goalResultUtils.ts`).
- Référence mockup : `MOCKUP_REQUEST_GOALS_COACH_TILE.html`.

### Récapitulatif mockups

- Formulaire demande : `MOCKUP_REQUEST_GOALS_SOLUTION_RETENUE.html` (états vide / avec liste + boutons Ajouter et Voir plus).
- Modale d’ajout : `MOCKUP_REQUEST_GOALS_MODAL_AJOUT.html`.
- Modale « Voir plus » : `MOCKUP_REQUEST_GOALS_MODAL_VOIR_PLUS.html` (optionnel si le comportement est clair).

---

## 7. Mockups retenus pour l’implémentation

Seuls les quatre fichiers ci‑dessous sont conservés ; les solutions A, B et C ont été supprimées.

| Fichier | Contenu |
|---------|---------|
| **`MOCKUP_REQUEST_GOALS_SOLUTION_RETENUE.html`** | Formulaire de demande : deux états (vide \| avec liste). État vide : message + bouton « Ajouter un objectif ou résultat passé ». État avec liste : titre de section et bouton « Ajouter » sur une ligne (titre à gauche, bouton à droite) ; liste triée **du plus récent au plus vieux** ; tuiles avec **différenciation visuelle** (objectifs à venir = bande ambre/sage, passés = bande grise) ; **bouton « Voir plus »** sous le dernier item, même largeur qu’une tuile, si > 5. |
| **`MOCKUP_REQUEST_GOALS_MODAL_AJOUT.html`** | Modale d’ajout : formulaire (nom, date, distance, priorité, **objectif de temps** h/min/s facultatif) ; si date passée, champs **résultat** (temps, place, note). |
| **`MOCKUP_REQUEST_GOALS_MODAL_VOIR_PLUS.html`** | Modale « Voir plus » : liste complète en lecture seule (style compact, scroll). Côté athlète : liste mixte triée ; côté coach : une modale par bloc (Objectifs ou Résultats). |
| **`MOCKUP_REQUEST_GOALS_COACH_TILE.html`** | Tuile demande en attente (vue coach) : deux blocs « Objectifs » et « Résultats », **tuiles sur deux lignes** (ligne 1 : date, nom, badge ; ligne 2 : distance · temps/objectif/place), bande ambre/sage / bande grise, tri du plus récent au plus vieux ; bouton « Voir plus » sous le dernier item par bloc. |

---

## 8. Découpage en user stories

### US1 — Section « Objectifs de course / résultats passés » (état vide)

**En tant qu’** athlète complétant une demande de coaching, **je veux** voir une section dédiée aux objectifs et résultats passés lorsqu’il n’en a aucun, **afin de** savoir que je peux en ajouter optionnellement.

- **Critères d’acceptation :**
  - Entre « Objectifs et volume par sport » et « Besoin de coaching », la section « Objectifs de course / résultats passés » affiche un message du type « Aucun objectif ou résultat pour l’instant » et un bouton « Ajouter un objectif ou résultat passé ».
  - Un court texte indique que la section est optionnelle (ex. « Optionnel : vous pouvez envoyer la demande sans en ajouter »).
  - Le bouton ouvre la modale d’ajout (voir US3).
- **Référence mockup :** `MOCKUP_REQUEST_GOALS_SOLUTION_RETENUE.html` (État 1).

---

### US2 — Section « Objectifs de course / résultats passés » (avec liste)

**En tant qu’** athlète ayant au moins un objectif ou résultat, **je veux** voir une liste compacte et un bouton pour en ajouter, **afin de** vérifier ce qui sera visible par le coach et ajouter d’éventuels objectifs sans quitter la demande.

- **Critères d’acceptation :**
  - La section affiche le **titre** « Objectifs de course / résultats passés » et le bouton **« Ajouter »** sur la **même ligne** (titre à gauche, bouton à droite).
  - La liste affiche au plus **5** objectifs/résultats, **triés du plus récent au plus vieux** (date décroissante).
  - Chaque tuile : **une ligne** (date · nom · infos distance/temps/place) ; **différenciation visuelle** : objectifs à venir = bande gauche ambre (principal) ou sage (secondaire) + contour ; objectifs **passés** (avec ou sans résultat saisi) = bande grise à gauche uniquement (pas de contour). Badges Principal/Secondaire avec fond blanc, texte et contour colorés.
  - Si l’athlète a **plus de 5** objectifs/résultats : un bouton **« Voir plus (n) »** apparaît **sous le dernier item**, **même largeur qu’une tuile** ; il ouvre la modale liste complète (US4).
  - Les objectifs affichés sont en **lecture seule** (pas d’édition ni suppression depuis la demande).
- **Référence mockup :** `MOCKUP_REQUEST_GOALS_SOLUTION_RETENUE.html` (État 2).

---

### US3 — Modale « Ajouter un objectif ou résultat passé »

**En tant qu’** athlète, **je veux** ajouter un objectif (ou un objectif passé avec résultat) depuis la demande, **afin de** compléter ma demande sans aller sur la page Objectifs.

- **Critères d’acceptation :**
  - La modale contient le **formulaire** : Nom de la course *, Date *, Distance (km) *, Priorité (Principal / Secondaire), **Objectif de temps** (facultatif : 3 champs h / min / s ; si un renseigné, les trois requis).
  - Si la **date** saisie est **passée** : les champs **Résultat** sont affichés (Temps h/min/s *, Place optionnel, Note optionnelle).
  - À la soumission : création en base (table `goals`), fermeture de la modale, mise à jour de la liste dans la section. Validation et messages d’erreur cohérents (i18n), mêmes règles que la page Objectifs pour objectif de temps et résultat.
- **Référence mockup :** `MOCKUP_REQUEST_GOALS_MODAL_AJOUT.html`.

---

### US4 — Modale « Voir plus » (liste complète)

**En tant qu’** athlète (ou coach), **je veux** ouvrir une modale listant tous les objectifs/résultats concernés, **afin de** consulter la liste complète en lecture seule.

- **Critères d’acceptation :**
  - **Côté athlète (demande) :** une modale « Tous mes objectifs et résultats » (ou équivalent i18n) affiche la **liste complète**, triée du plus récent au plus vieux, même style de tuiles (différenciation bande colorée / bande grise), zone scroll si besoin.
  - **Côté coach (PendingRequestTile) :** une modale par bloc — « Objectifs » ou « Résultats » — liste complète du bloc concerné, lecture seule, scroll si besoin.
- **Référence mockup :** `MOCKUP_REQUEST_GOALS_MODAL_VOIR_PLUS.html`.

---

### US5 — Vue coach : blocs Objectifs et Résultats dans la tuile demande

**En tant que** coach, **je veux** voir les objectifs et résultats passés de l’athlète dans la tuile demande en attente, **afin de** mieux cerner son profil avant d’accepter ou refuser.

- **Critères d’acceptation :**
  - La tuile (PendingRequestTile) comporte **deux blocs** : **« Objectifs »** (à venir) et **« Résultats »** (passés, avec ou sans résultat saisi).
  - Chaque bloc : liste d’au plus 5 items, **tri du plus récent au plus vieux** ; **même design de tuiles** (bande ambre/sage / bande grise). **Vue coach : tuiles sur deux lignes** — ligne 1 : date, nom, badge ; ligne 2 : distance · objectif de temps / temps · place (plus d’infos visibles).
  - Si plus de 5 dans un bloc : bouton **« Voir plus (n) »** sous le dernier item, même largeur qu’une tuile, ouvre la modale liste complète du bloc (US4).
  - Si un bloc est vide : afficher « Aucun objectif » / « Aucun résultat » (i18n).
- **Référence mockup :** `MOCKUP_REQUEST_GOALS_COACH_TILE.html`.

---

### US6 — Vue athlète « Ma demande envoyée » : affichage objectifs/résultats

**En tant qu’** athlète, **je veux** voir les objectifs et résultats que j’ai associés à ma demande dans la modale « Ma demande envoyée », **afin de** vérifier ce que le coach voit.

- **Critères d’acceptation :**
  - Dans AthleteSentRequestDetailModal, une section « Objectifs de course / résultats passés » affiche la **même logique** que dans le formulaire de demande (liste triée, au plus 5, différenciation visuelle, bouton « Voir plus » si > 5). Lecture seule.
- **Référence mockup :** même design que `MOCKUP_REQUEST_GOALS_SOLUTION_RETENUE.html` (état avec liste) et `MOCKUP_REQUEST_GOALS_COACH_TILE.html` pour la cohérence des tuiles.

---

## 9. Points à trancher / Décisions

1. **Modifier le résultat d’un objectif passé depuis la demande** — *À décider*  
   **Proposition A :** Garder la demande en lecture seule pour les objectifs ; pour modifier un résultat (temps, place, note), l’athlète va sur la **page Objectifs**. Simple, pas de duplication de GoalResultModal dans le flux demande.  
   **Proposition B :** Ajouter un lien/bouton « Modifier le résultat » sur chaque tuile (objectif passé avec résultat) dans la section demande ; au clic, ouvrir **GoalResultModal** (réutiliser le composant existant). L’athlète ne quitte pas le parcours demande.  
   **Décision : option B.** Voir **SPEC_REQUEST_GOALS.md**.

2. **Flux sans offre (RequestCoachButton)** — **Décision : pas besoin.**  
   Le formulaire de demande sans offre n’inclut **pas** la section objectifs/résultats. Pas de développement spécifique pour ce flux.

3. **Données à l’envoi de la demande** — **Décision : pas de snapshot.**  
   Les objectifs restent dans la table `goals` (profil athlète). À l’envoi, `createCoachRequest` ne reçoit pas de liste d’objectifs ; le coach consulte les objectifs **courants** de l’athlète. Aucune copie dans `coach_requests`.

---

## 10. Suite

- **Spec technique :** `docs/design-request-goals/SPEC_REQUEST_GOALS.md` (RLS migration 057, actions, fichiers, tri, option B « Modifier le résultat »).
- Passage en **mode Développeur** pour implémentation.
