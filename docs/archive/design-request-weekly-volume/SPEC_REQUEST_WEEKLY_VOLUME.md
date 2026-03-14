# Spec technique — Temps à allouer et volumes dans la demande de coach

**Mode :** Architecte  
**Date :** 14 mars 2026  
**Référence :** `DESIGN_REQUEST_WEEKLY_VOLUME.md`, `USER_STORIES_REQUEST_WEEKLY_VOLUME.md`

---

## 1. Modèle de données

**Aucune nouvelle table ni nouvelle colonne.**

- **`profiles`** : colonnes existantes `weekly_target_hours` (NUMERIC), `weekly_volume_by_sport` (JSONB) — déjà en place (migration 055).
- **`coach_requests`** : inchangé. Pas de snapshot des objectifs/volumes en base ; le coach lit le **profil athlète** à l’affichage (décision PO).

**RLS :** Aucune modification. La politique `profiles_select_coach_request_athletes` (migration 009) permet déjà au coach de `SELECT` sur les profils des athlètes ayant une demande en attente vers lui (`athlete_id IN (SELECT ... FROM coach_requests WHERE coach_id = auth.uid() AND status = 'pending')`). Le select ne restreint pas les colonnes, donc `weekly_target_hours` et `weekly_volume_by_sport` sont lisibles par le coach dans ce contexte.

---

## 2. Architecture et flux

### 2.1 Flux athlète : formulaire de demande (US 1, 2, 3, 4)

1. **Page** `app/[locale]/dashboard/find-coach/page.tsx`  
   - Charge déjà `current = await getCurrentUserWithProfile()` (profil complet, `select('*')` dans auth donc `weekly_target_hours` et `weekly_volume_by_sport` sont présents).  
   - **Modifier :** Passer à `FindCoachSection` les props `initialWeeklyTargetHours={current.profile.weekly_target_hours ?? undefined}` et `initialWeeklyVolumeBySport={current.profile.weekly_volume_by_sport ?? undefined}`.

2. **FindCoachSection**  
   - **Modifier :** Accepter `initialWeeklyTargetHours?: number | null` et `initialWeeklyVolumeBySport?: Record<string, number> | null` ; les transmettre à `CoachDetailModal`.

3. **CoachDetailModal** (formulaire dans la modale détail coach)  
   - **Modifier :**  
     - Ajouter les props `initialWeeklyTargetHours`, `initialWeeklyVolumeBySport`.  
     - Ajouter la section « Objectifs et volume par sport » entre « Sports pratiqués » et « Besoin de coaching » : même logique que `ProfileForm` (temps à allouer h/sem. ; tuiles volume dynamiques selon `sports` sélectionnés ; triathlon → course, vélo, natation ; trail → D+/sem. dans tuile Course).  
     - État local pour `weeklyTargetHours` et `weeklyVolumeBySport` (ou champs contrôlés depuis les initial + valeurs des inputs).  
     - À la soumission : construire l’objet `weekly_volume_by_sport` à partir des champs du formulaire (même logique que `ProfileForm` / `profile/actions.ts`), puis appeler `createCoachRequest` avec les nouveaux paramètres.

4. **Action** `createCoachRequest` (`app/[locale]/dashboard/actions.ts`)  
   - **Modifier :**  
     - Signature : ajouter `weeklyTargetHours?: number | null` et `weeklyVolumeBySport?: Record<string, number> | null`.  
     - **Validation :** (après validation sport/need existante) si `weeklyTargetHours` est fourni : nombre ≥ 0 et ≤ 168 ; si `weeklyVolumeBySport` fourni : chaque valeur ≥ 0, clés autorisées cohérentes avec les sports envoyés. Réutiliser la logique de `profile/actions.ts` (plafonds par unité si besoin). Messages d’erreur i18n `coachRequests.validation` ou `profile.validation`.  
     - **Ordre des opérations :**  
       1. Mettre à jour le profil athlète : `profiles.weekly_target_hours`, `profiles.weekly_volume_by_sport` (et `practiced_sports` comme aujourd’hui).  
       2. Si échec update profil → return error, ne pas insérer la demande.  
       3. Insérer dans `coach_requests` comme aujourd’hui (sport_practiced, coaching_need, offer frozen_*, etc.).  
     - Ne pas faire échouer la création de la demande si la mise à jour `practiced_sports` échoue (comportement actuel conservé) ; en revanche la mise à jour de `weekly_target_hours` / `weekly_volume_by_sport` doit réussir pour que l’insert demande soit exécutée.

### 2.2 Flux coach : tuile demande (US 5)

1. **Action** `getPendingCoachRequests`  
   - **Modifier :** Dans la requête sur `profiles` pour les athlètes (`.in('user_id', athleteIds)`), étendre le `select` pour inclure `weekly_target_hours` et `weekly_volume_by_sport`.  
   - Étendre le type `PendingRequestWithAthlete` avec `athlete_weekly_target_hours: number | null` et `athlete_weekly_volume_by_sport: Record<string, number> | null`.  
   - Mapper ces champs dans le tableau retourné.

2. **Composant** `PendingRequestTile`  
   - **Modifier :**  
     - En-tête : afficher nom et offre sur **une seule ligne** (ex. « Jean Dupont · Suivi complet — 49€/mois »), puis une ligne de badges sport (déjà `sport_practiced`), puis les boutons Discuter / Refuser / Accepter.  
     - Corps : grille 2 colonnes — colonne 1 : bloc « Message de l’athlète » (`coaching_need`) ; colonne 2 : bloc « Objectifs et volume (athlète) » en utilisant `athlete_weekly_target_hours` et `athlete_weekly_volume_by_sport`. Si absents ou vides, afficher « Non renseigné » ou ne pas afficher la liste des volumes.  
   - Design system : labels `text-xs font-bold uppercase tracking-wider text-stone-400`, blocs `rounded-lg border border-stone-200`, boutons existants.

### 2.3 Flux athlète : modale « Ma demande envoyée » (US 6, optionnel)

- **AthleteSentRequestDetailModal** : ajouter une section « Objectifs et volume » en lecture seule.  
- Données : soit passer `weeklyTargetHours` et `weeklyVolumeBySport` en props (depuis la page parente qui a le profil), soit exposer une petite action ou utiliser le profil déjà disponible. La page find-coach qui rend `RequestCoachButton` a accès à `current.profile` ; on peut passer ces champs via FindCoachSection → RequestCoachButton → AthleteSentRequestDetailModal (comme pour firstName/lastName).  
- **Modifier :** FindCoachSection reçoit déjà les props athlète ; ajouter `athleteWeeklyTargetHours` et `athleteWeeklyVolumeBySport` depuis la page find-coach, les passer à RequestCoachButton qui les passe à AthleteSentRequestDetailModal. Afficher la section seulement si au moins une des deux valeurs est renseignée.

---

## 3. Table des fichiers

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/find-coach/page.tsx` | Page Trouver un coach | **Modifier** : passer `initialWeeklyTargetHours`, `initialWeeklyVolumeBySport` à FindCoachSection |
| `app/[locale]/dashboard/FindCoachSection.tsx` | Section + CoachDetailModal | **Modifier** : props weekly target/volume ; section formulaire Objectifs et volume ; appel createCoachRequest avec ces paramètres |
| `app/[locale]/dashboard/actions.ts` | createCoachRequest, getPendingCoachRequests, PendingRequestWithAthlete | **Modifier** : createCoachRequest (params + update profil + validation) ; getPendingCoachRequests (select profil + champs weekly_*) ; type PendingRequestWithAthlete étendu |
| `app/[locale]/dashboard/PendingRequestTile.tsx` | Tuile demande coach | **Modifier** : layout en-tête (nom · offre une ligne, badges, boutons) ; corps 2 colonnes (Message, Objectifs et volume) |
| `app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx` | Modale « Ma demande envoyée » | **Modifier** (US 6) : section Objectifs et volume en lecture seule, props optionnelles |
| `messages/fr.json`, `messages/en.json` | i18n | **Modifier** : clés pour labels « Message de l’athlète », « Objectifs et volume (athlète) », « Non renseigné » (athletes ou coachRequests) ; validation (profile.validation ou coachRequests.validation) si nouvelles clés |
| `lib/sportStyles.ts` | Unité volume par sport, styles | **Aucun changement** (déjà utilisé par ProfileForm) |
| `app/[locale]/dashboard/profile/actions.ts` | Validation profil | **Référence** : réutiliser logique validation weekly_target_hours et weekly_volume_by_sport (plafonds, clés) dans createCoachRequest |

---

## 4. Logique métier

- **Validation (côté serveur) dans createCoachRequest :**  
  - `weekly_target_hours` : si fourni, nombre ∈ [0, 168].  
  - `weekly_volume_by_sport` : clés = sports issus de la liste pratiquée (avec expansion triathlon → course, velo, natation) ; optionnellement `course_elevation_m` si trail ; chaque valeur ≥ 0 ; plafonds par unité (km, m, h) comme dans profile/actions (ex. km ≤ 5000, m ≤ 1e6, h ≤ 168).  
  - Champs **obligatoires** pour pouvoir envoyer la demande : refuser la création si temps à allouer ou volumes (pour chaque sport sélectionné) manquants ou invalides, avec message d’erreur i18n.

- **Construction de `weekly_volume_by_sport` dans le formulaire :**  
  - Même règle que ProfileForm : liste de sports « affichés » pour le volume = expansion triathlon + trail → course si besoin ; pour chaque sport affiché, lire le champ `weekly_volume_<sport>` (et `weekly_volume_course_elevation_m` si trail). Envoyer l’objet au serveur.

- **Affichage coach (objectifs et volume) :**  
  - Formater « Temps à allouer : X h/sem. » puis liste « Sport1 V1 unité/sem., Sport2 V2 unité/sem. » en utilisant `getWeeklyVolumeUnit(sport)` pour le libellé d’unité (km/sem., m/sem., h/sem.). Gérer `course_elevation_m` en « D+ … m/sem. » si présent.

---

## 5. Tests manuels recommandés

- Athlète : ouvrir Trouver un coach → Voir le détail d’un coach → Sélectionner une offre → Vérifier que la section Objectifs et volume apparaît et est préremplie si le profil a déjà des valeurs.  
- Athlète : soumettre sans remplir temps/volumes → message d’erreur ou bouton désactivé.  
- Athlète : remplir et envoyer → vérifier en BDD ou sur Mon profil que `weekly_target_hours` et `weekly_volume_by_sport` sont à jour ; vérifier que la demande est créée.  
- Coach : aller sur Mes athlètes → vérifier que les tuiles de demande affichent bien nom · offre sur une ligne, badges sport, puis les deux blocs Message et Objectifs et volume (avec données lues depuis le profil athlète).  
- Athlète (US 6) : après avoir envoyé une demande, cliquer « Demande envoyée » → vérifier que la section Objectifs et volume s’affiche en lecture seule.

---

## 6. Points à trancher en implémentation

1. **US 7 (Contexte 2) :** Si le PO retient l’ajout de la section Objectifs et volume dans la modale `RequestCoachButton` (sans offre), appliquer les mêmes changements (props initial, section formulaire, paramètres createCoachRequest) pour ce flux ; `RequestCoachButton` est alors alimenté en `initialWeeklyTargetHours` / `initialWeeklyVolumeBySport` depuis la page qui le rend (find-coach).  
2. **i18n :** Définir le namespace exact pour les nouveaux libellés (ex. `athletes.pendingRequests.messageLabel`, `athletes.pendingRequests.objectivesAndVolumeLabel`, `athletes.pendingRequests.notFilled`).  
3. **Bouton désactivé vs erreur à la soumission :** Valider avec le design : désactiver le bouton « Envoyer la demande » tant que temps + volumes (pour chaque sport) ne sont pas renseignés et valides, ou afficher un message d’erreur au submit. Les deux sont acceptables ; le design doc mentionne « désactivé ou message d’erreur ».

---

## 7. Checklist avant livraison spec

- [x] Modèle de données : aucun changement BDD (colonnes existantes).  
- [x] RLS : aucune modification (politique 009 permet au coach de lire le profil des athlètes avec demande en attente).  
- [x] Table des fichiers avec Créer/Modifier.  
- [x] Flux et ordre des opérations (update profil puis insert demande) décrits.  
- [x] Tests manuels recommandés listés.  
- [x] Points à trancher en implémentation indiqués.
