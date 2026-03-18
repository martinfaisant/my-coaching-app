# Spec technique — Volumes hebdomadaires (Volume actuel + Volume maximum)

**Mode :** Architecte  
**Date :** 17 mars 2026  
**Référence :** `DESIGN_WEEKLY_VOLUME_TWO_COLUMNS.md`, `USER_STORIES_WEEKLY_VOLUME_TWO_COLUMNS.md`, mockup `MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html`.

---

## 1. Contexte et périmètre

- **Besoin :** Section « Volumes hebdomadaires » (ex-« Objectifs et volume par sport ») avec deux champs en deux colonnes : **Volume actuel** (gauche) et **Volume maximum** (droite), en profil athlète et dans le formulaire de demande de coaching. Vue coach : afficher les deux lignes en lecture seule dans la tuile Demande en attente.
- **Données :** Nouveau champ **Volume actuel** (heures/sem.) ; **Volume maximum** = champ existant `weekly_target_hours`. Les deux obligatoires (profil + demande). Pas de règle « actuel ≤ max ». Snapshot des deux (et volumes par sport) dans la demande à l’envoi.

---

## 2. Architecture et flux

### 2.1 Flux profil athlète (Mon profil)

1. Page `app/[locale]/dashboard/profile/page.tsx` charge le profil (déjà `weekly_target_hours`, `weekly_volume_by_sport`) ; ajouter `weekly_current_hours` dans le select et le passer à `ProfileForm`.
2. `ProfileForm.tsx` : section « Volumes hebdomadaires » (titre i18n), grille 2 colonnes (Volume actuel | Volume maximum), puis grille volumes par sport. Champs : `weekly_current_hours`, `weekly_target_hours` (noms de champs formulaire).
3. Soumission → `updateProfile` (profile/actions.ts) : lire `weekly_current_hours` et `weekly_target_hours`, valider (positif, ≤ 168 h), mettre à jour `profiles.weekly_current_hours` et `profiles.weekly_target_hours`.

### 2.2 Flux demande de coaching

1. Ouverture formulaire (FindCoachSection) : préremplir Volume actuel et Volume maximum depuis le profil athlète (`weekly_current_hours`, `weekly_target_hours`).
2. Soumission → `createCoachRequest` (dashboard/actions.ts) : mettre à jour le profil (first_name, last_name, practiced_sports, **weekly_current_hours**, weekly_target_hours, weekly_volume_by_sport), puis insérer dans `coach_requests` en incluant le **snapshot** (athlete_weekly_current_hours, athlete_weekly_target_hours, athlete_weekly_volume_by_sport) depuis le profil mis à jour.
3. Coach : `getPendingCoachRequests` lit les demandes et, pour les volumes hebdo, utilise les colonnes snapshot sur `coach_requests` si présentes, sinon repli sur le profil (demandes créées avant la migration). `PendingRequestTile` affiche deux lignes (Volume actuel, Volume maximum) + volumes par sport.

### 2.3 Récapitulatif

- **Profil :** 1 nouveau champ en base (`profiles.weekly_current_hours`). `weekly_target_hours` inchangé (sémantique « Volume maximum »).
- **Demande :** Snapshot sur `coach_requests` : 3 colonnes (athlete_weekly_current_hours, athlete_weekly_target_hours, athlete_weekly_volume_by_sport) pour figer les valeurs au moment de l’envoi. Lecture côté coach depuis ces colonnes (avec fallback profil pour l’existant).

---

## 3. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|--------|------|-------------------|
| `supabase/migrations/058_profiles_weekly_current_hours.sql` | Ajout colonne `weekly_current_hours` sur `profiles`. | **Créer** |
| `supabase/migrations/059_coach_requests_snapshot_weekly_volume.sql` | Colonnes snapshot sur `coach_requests` (athlete_weekly_current_hours, athlete_weekly_target_hours, athlete_weekly_volume_by_sport). | **Créer** |
| `types/database.ts` | `Profile` : ajouter `weekly_current_hours`. Type retour `getPendingCoachRequests` : ajouter `athlete_weekly_current_hours` ; optionnellement typer les colonnes snapshot sur la table (si génération types Supabase). | **Modifier** |
| `app/[locale]/dashboard/profile/page.tsx` | Passer `weeklyCurrentHours` (et garder `weeklyTargetHours`) à `ProfileForm`. | **Modifier** |
| `app/[locale]/dashboard/profile/ProfileForm.tsx` | Section « Volumes hebdomadaires » : grille 2 colonnes (Volume actuel, Volume maximum), titre i18n, champs `weekly_current_hours` et `weekly_target_hours`. Validation côté client (obligatoire si besoin). | **Modifier** |
| `app/[locale]/dashboard/profile/actions.ts` | `updateProfile` : lire `weekly_current_hours`, validation (0–168), obligatoire pour athlète avec sports pratiqués ; mettre à jour `payload.weekly_current_hours`. Garder `weekly_target_hours` obligatoire. | **Modifier** |
| `app/[locale]/dashboard/FindCoachSection.tsx` | Section « Volumes hebdomadaires » : grille 2 colonnes (Volume actuel, Volume maximum), state `weeklyCurrentHoursInput` + `weeklyTargetHoursInput`, préremplissage depuis `initialWeeklyCurrentHours` et `initialWeeklyTargetHours`. Envoi : inclure les deux dans le payload. | **Modifier** |
| `app/[locale]/dashboard/actions.ts` | `createCoachRequest` : accepter `weeklyCurrentHours` (obligatoire), mettre à jour profil avec `weekly_current_hours` et `weekly_target_hours` ; après update profil, récupérer ou conserver les valeurs et les ajouter au `insertPayload` (athlete_weekly_current_hours, athlete_weekly_target_hours, athlete_weekly_volume_by_sport). `getPendingCoachRequests` : select des colonnes snapshot sur `coach_requests` ; construire `athlete_weekly_current_hours`, `athlete_weekly_target_hours`, `athlete_weekly_volume_by_sport` depuis la ligne request si présentes, sinon fallback depuis profiles (rétrocompat). | **Modifier** |
| `app/[locale]/dashboard/find-coach/page.tsx` | Passer `initialWeeklyCurrentHours` (et garder `initialWeeklyTargetHours`) au composant de formulaire (CoachDetailModal / FindCoachSection). | **Modifier** |
| `app/[locale]/dashboard/PendingRequestTile.tsx` | Bloc Volumes hebdomadaires : afficher « Volume actuel : X h/sem. » et « Volume maximum : Y h/sem. » (deux lignes) lorsque les données sont présentes ; conserver l’affichage des volumes par sport. | **Modifier** |
| `messages/fr.json` | Clés profile : `weeklyVolumesSectionTitle`, `weeklyCurrentHoursLabel`, `weeklyMaxHoursLabel` ; validation si besoin. findCoach / pendingRequests : `weeklyCurrentHoursLabel`, `weeklyMaxHoursLabel`. Remplacer / adapter les clés existantes « Temps à allouer » par « Volume maximum » / « Volumes hebdomadaires ». | **Modifier** |
| `messages/en.json` | Idem (EN). | **Modifier** |

**Aucun nouveau fichier** côté composants partagés ; réutilisation des patterns existants (input + suffixe, grille 2 colonnes).

---

## 4. Modèle de données

### 4.1 Table `profiles`

| Colonne | Type | Existant | Modification |
|---------|------|----------|--------------|
| `weekly_target_hours` | NUMERIC(5,2) | Oui | Aucune (sémantique UI = « Volume maximum »). |
| `weekly_volume_by_sport` | JSONB | Oui | Aucune. |
| **`weekly_current_hours`** | **NUMERIC(5,2)** | **Non** | **Ajout.** Volume actuel (heures/sem.). Nullable pour rétrocompat ; en pratique obligatoire pour athlète quand la section est affichée. |

**Migration 058** (nouveau fichier) :

```sql
-- Volumes hebdomadaires : volume actuel (heures/sem.) pour l'athlète
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_current_hours NUMERIC(5,2);

COMMENT ON COLUMN public.profiles.weekly_current_hours IS 'Volume horaire actuel par semaine (heures), pour l''athlète (affichage « Volume actuel »).';
```

### 4.2 Table `coach_requests` (snapshot à l’envoi de la demande)

Aujourd’hui les volumes hebdo vus par le coach sont lus depuis **profiles** (join par athlete_id). Pour figer les valeurs au moment de la demande, on ajoute des colonnes snapshot sur `coach_requests`.

| Colonne | Type | Existant | Modification |
|---------|------|----------|--------------|
| **`athlete_weekly_current_hours`** | **NUMERIC(5,2)** | **Non** | **Ajout.** Snapshot « Volume actuel » à l’envoi. |
| **`athlete_weekly_target_hours`** | **NUMERIC(5,2)** | **Non** | **Ajout.** Snapshot « Volume maximum » à l’envoi. |
| **`athlete_weekly_volume_by_sport`** | **JSONB** | **Non** | **Ajout.** Snapshot volumes par sport à l’envoi. |

Toutes nullable (demandes existantes sans snapshot). Pour les nouvelles demandes, remplies à l’insert depuis le profil (après update).

**Migration 059** (nouveau fichier) :

```sql
-- Snapshot volumes hebdomadaires sur la demande (Volume actuel, Volume max, volumes par sport)
ALTER TABLE public.coach_requests
  ADD COLUMN IF NOT EXISTS athlete_weekly_current_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS athlete_weekly_target_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS athlete_weekly_volume_by_sport JSONB;

COMMENT ON COLUMN public.coach_requests.athlete_weekly_current_hours IS 'Snapshot : volume horaire actuel (h/sem.) de l''athlète au moment de la demande.';
COMMENT ON COLUMN public.coach_requests.athlete_weekly_target_hours IS 'Snapshot : volume horaire max (h/sem.) de l''athlète au moment de la demande.';
COMMENT ON COLUMN public.coach_requests.athlete_weekly_volume_by_sport IS 'Snapshot : volumes par sport (km, m ou h/sem.) au moment de la demande.';
```

---

## 5. RLS

- **profiles :** Aucune modification. Les policies existantes (`profiles_select_own`, `profiles_update_own`, `profiles_select_coach_athletes`) s’appliquent aux nouvelles colonnes.
- **coach_requests :** Aucune nouvelle policy. Les colonnes snapshot sont insérées par l’athlète (via `coach_requests_insert_athlete`) et lues par le coach (via `coach_requests_select_coach`). Pas d’accès direct aux colonnes snapshot par des rôles non prévus.

---

## 6. Logique métier

### 6.1 Validation (profil et demande)

- **Volume actuel** et **Volume maximum** : nombre ≥ 0, ≤ 168 (heures/semaine). Obligatoires lorsque la section « Volumes hebdomadaires » est affichée (athlète avec au moins un sport pratiqué).
- **Pas de règle** « Volume actuel ≤ Volume maximum » (le volume actuel peut être supérieur).
- Messages d’erreur i18n (profile.validation et/ou findCoach) : clés dédiées (ex. `weeklyCurrentHoursInvalid`, `weeklyMaxHoursInvalid` ou réutilisation avec paramètre).

### 6.2 Snapshot demande

- À l’appel de `createCoachRequest` : après mise à jour du profil (weekly_current_hours, weekly_target_hours, weekly_volume_by_sport), construire l’objet d’insertion dans `coach_requests` en y ajoutant `athlete_weekly_current_hours`, `athlete_weekly_target_hours`, `athlete_weekly_volume_by_sport` avec les valeurs **vient d’être écrites** dans le profil (pas de re-read si les variables sont déjà disponibles).

### 6.3 Lecture côté coach

- `getPendingCoachRequests` : sélectionner sur `coach_requests` les colonnes `athlete_weekly_current_hours`, `athlete_weekly_target_hours`, `athlete_weekly_volume_by_sport`.
- Pour chaque demande : si ces colonnes sont non nulles (pour la ligne), les utiliser pour `athlete_weekly_current_hours`, `athlete_weekly_target_hours`, `athlete_weekly_volume_by_sport` du résultat ; sinon **fallback** : comme aujourd’hui, joindre `profiles` et utiliser `weekly_current_hours`, `weekly_target_hours`, `weekly_volume_by_sport` du profil (rétrocompat pour demandes créées avant la migration).

---

## 7. Tests manuels recommandés

1. **Profil athlète**  
   - Ouvrir Mon profil, section Volumes hebdomadaires : deux champs (Volume actuel, Volume maximum) en deux colonnes, titre « Volumes hebdomadaires ».  
   - Renseigner les deux (ex. 6 et 10), enregistrer → recharger la page : valeurs bien persistées.  
   - Laisser un champ vide ou mettre une valeur > 168 → message d’erreur.  
   - Vérifier que Volume actuel > Volume maximum est accepté (ex. 12 et 10).

2. **Demande de coaching**  
   - Avec profil déjà rempli : ouvrir le formulaire de demande → Volume actuel et Volume maximum préremplis.  
   - Modifier les deux, envoyer la demande.  
   - Côté coach : tuile Demande en attente affiche « Volume actuel : X h/sem. » et « Volume maximum : Y h/sem. » + volumes par sport.  
   - Modifier à nouveau le profil athlète puis rouvrir la tuile coach : les valeurs affichées restent celles de la demande (snapshot), pas le nouveau profil.

3. **Demandes existantes (avant migration)**  
   - Une demande pending créée avant les migrations n’a pas les colonnes snapshot remplies.  
   - Vérifier que la tuile coach affiche quand même les infos (fallback profil) et que l’affichage des deux lignes (Volume actuel / Volume maximum) gère les nulls (afficher seulement les lignes présentes).

4. **i18n**  
   - Basculer FR/EN : titres et libellés « Volumes hebdomadaires », « Volume actuel », « Volume maximum » corrects partout (profil, formulaire demande, tuile coach).

---

## 8. Points à trancher en implémentation

- **Obligatoire sur le profil :** Si l’athlète n’a aucun sport pratiqué, la section est masquée (comportement actuel). Dès qu’il a au moins un sport, les deux champs (Volume actuel, Volume maximum) sont obligatoires pour pouvoir enregistrer / envoyer la demande. À confirmer : désactiver le bouton Enregistrer / Envoyer tant que l’un des deux est vide, ou afficher une erreur à la soumission (spec : obligatoire, donc les deux approches sont acceptables).
- **Fallback coach :** Pour les demandes sans snapshot (colonnes null), le fallback profil peut donner des valeurs plus récentes que la demande. Acceptable pour l’existant ; les nouvelles demandes auront toujours le snapshot.
- **Types générés Supabase :** Si le projet génère les types depuis la base, relancer la génération après les migrations 058 et 059 pour avoir `weekly_current_hours` sur `Profile` et les trois colonnes snapshot sur la table `coach_requests`.

---

## 9. Checklist avant livraison (Architecte)

- [x] Migrations définies (058 profiles, 059 coach_requests)
- [x] RLS : aucune nouvelle policy, colonnes couvertes par l’existant
- [x] Table des fichiers (créer / modifier) complète
- [x] Logique métier (validation, snapshot, lecture coach + fallback) décrite
- [x] Tests manuels recommandés listés
- [x] Points à trancher en implémentation indiqués
