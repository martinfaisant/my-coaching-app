# Analyse architecture – Chargement du calendrier athlète

**Date :** 23 février 2026  
**Mode :** Architecte  
**Objectif :** Analyser le comportement de chargement des informations du calendrier d’un athlète et proposer des pistes d’amélioration (réduction des appels backend, meilleur chargement des données).

---

## 1. Flux actuels

### 1.1 Chargement initial (page serveur)

| Contexte | Fichier | Appels Supabase |
|----------|---------|------------------|
| **Athlète (son calendrier)** | `app/[locale]/dashboard/calendar/page.tsx` | `getCurrentUserWithProfile` (auth + profile) puis **5 requêtes en parallèle** : `workouts` (date range), `imported_activities` (date range), `goals` (tous, sans filtre date), `imported_activity_weekly_totals` (5 lundis), `workout_weekly_totals` (5 lundis). |
| **Coach (calendrier d’un athlète)** | `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | `getCurrentUserWithProfile` + 1 requête `profiles` (athlète), puis **4 requêtes en parallèle** : `workouts`, `goals`, `imported_activity_weekly_totals`, `workout_weekly_totals`. Pas d’`imported_activities` (réservé à l’athlète). |

Les données sont passées en props aux composants client (`AthleteCalendarPage` / `CoachAthleteCalendarPage` → `CalendarViewWithNavigation`). Au premier rendu client, les 5 semaines (S-2 à S+2) sont déjà dans `loadedWeeksRef`, donc **aucun appel client supplémentaire** si les données initiales sont présentes.

### 1.2 Navigation (précédent / suivant)

Quand l’utilisateur change de semaine (`referenceMonday` change), un `useEffect` dans `CalendarViewWithNavigation.tsx` (l.231–317) calcule les semaines requises (toujours 5 : S-2 à S+2 par rapport à la semaine de référence). Si une ou plusieurs semaines ne sont pas encore dans `loadedWeeksRef`, le client lance **4 server actions en parallèle** :

- `getWorkoutsForDateRange(athleteId, earliestStart, latestEnd)`
- `getImportedActivitiesForDateRange(athleteId, earliestStart, latestEnd)` (vue athlète uniquement)
- `getImportedActivityWeeklyTotals(athleteId, earliestStart, latestEnd)`
- `getWorkoutWeeklyTotals(athleteId, earliestStart, latestEnd)`

Chaque server action fait côté serveur :

1. `createClient()`
2. **Auth** : `requireCoachOrAthleteAccess` → `getUser()` + 2× `getProfile()` (en parallèle), ou pour `getImportedActivitiesForDateRange` : `getUser()` seul
3. **i18n** : `getLocale()` + 2× `getTranslations(...)` en parallèle
4. **1 requête Supabase** (workouts, imported_activities, weekly_totals, workout_weekly_totals)

Résultat : **4 requêtes HTTP** (client → Next) et, côté serveur, **4 × (1 getUser + 2 getProfile + 1 query)** ≈ **16 appels Supabase** par navigation dès qu’une nouvelle semaine entre dans la fenêtre (getUser et getProfile répétés 4 fois).

### 1.3 Après sauvegarde d’un entraînement

Après `createWorkout` ou `updateWorkout` :

1. La server action fait déjà : auth, profile, locale, translations, insert/update, `revalidatePath(pathToRevalidate)`.
2. Le client reçoit le résultat et appelle `onWorkoutSaved(updatedWorkout)` → `refetchWorkoutsAfterSave` :
   - Si `updatedWorkout` est fourni : mise à jour optimiste du state (workout fusionné), puis **1 appel** : `getWorkoutWeeklyTotals(athleteId, start, end)` pour rafraîchir les totaux.
   - Sinon : **2 appels** : `getWorkoutsForDateRange` + `getWorkoutWeeklyTotals` sur la plage des 5 semaines.

Donc après une sauvegarde : **1 (save) + 1 ou 2 (refetch)** = **2 ou 3 requêtes HTTP** et chaque refetch refait auth + profile + i18n.

### 1.4 Chargement initial côté client (cas sans données serveur)

Si `initialWorkouts.length === 0 && initialWeeklyTotals.length === 0`, un `useEffect` (l.178–228) lance les **4 mêmes server actions** (workouts, imported, imported totals, workout totals) pour la plage des 5 semaines. Cas rare (page avec cache vide ou erreur), mais même problème : 4 HTTP, auth/i18n répétés 4 fois.

---

## 2. Synthèse des coûts

| Événement | Requêtes HTTP (client → Next) | Appels Supabase (ordre de grandeur) |
|----------|-------------------------------|--------------------------------------|
| Ouverture calendrier (SSR) | 0 (données en SSR) | 5 (athlète) ou 5 (coach : 1 profile + 4) |
| Navigation (nouvelle semaine) | 4 | ~16 (4 × auth + 4 × query) |
| Sauvegarde workout + refetch | 2 ou 3 | 1 (save) + 2 à 4 (refetch selon cas) |

Points sensibles :

- **Auth et i18n répétés** à chaque server action (getUser, getProfile, getLocale, getTranslations).
- **Plusieurs requêtes HTTP pour une même opération logique** (ex. « charger les données du calendrier pour une plage »).
- **Goals** : chargés sans filtre de date (tous les objectifs de l’athlète). Si l’affichage ne montre que les objectifs dans la fenêtre visible, on peut limiter la requête aux dates utiles.

---

## 3. Pistes d’amélioration

### 3.1 (Recommandé) Une seule action « données calendrier » pour le client

**Idée :** Exposer une seule server action `getCalendarData(athleteId, startDate, endDate, options?)` qui :

- fait **une fois** : `requireCoachOrAthleteAccess`, `getLocale`, `getTranslations` ;
- lance en **parallèle** les 4 (ou 3 pour le coach) requêtes Supabase : workouts, imported_activities (si athlète), imported_activity_weekly_totals, workout_weekly_totals ;
- retourne un seul payload `{ workouts, importedActivities?, weeklyTotals, workoutTotals, error? }`.

**Utilisation :**

- **Navigation** : le client appelle une seule fois `getCalendarData(athleteId, earliestStart, latestEnd)` au lieu de 4 appels.
- **Chargement initial client** (fallback sans données serveur) : idem, 1 appel au lieu de 4.

**Bénéfices :** 1 requête HTTP au lieu de 4, 1 auth + 1 i18n au lieu de 4. Réduction nette des appels backend (Supabase et coût serveur).

**Fichiers à créer/modifier :**

- `app/[locale]/dashboard/workouts/actions.ts` : ajouter `getCalendarData`, éventuellement déléguer les requêtes existantes en interne pour éviter duplication.
- `components/CalendarViewWithNavigation.tsx` : remplacer les `Promise.all([getWorkoutsForDateRange, getImportedActivitiesForDateRange, ...])` par un unique `getCalendarData` (navigation + effet de chargement initial client).

**Points à trancher en implémentation :**

- Garder ou non les actions `getWorkoutsForDateRange`, etc. pour d’autres usages (ex. autre page). Si oui, les appeler depuis `getCalendarData` pour ne pas dupliquer la logique Supabase.
- Gestion d’erreur : une seule erreur auth/i18n pour tout le bloc ; en cas d’erreur sur une seule table, décider si on retourne partiel ou une erreur globale.

---

### 3.2 (Recommandé) Réduire le refetch après sauvegarde

**Idée :**

- Quand le serveur retourne `workout` (création ou mise à jour), le client a déjà mis à jour la liste des workouts. Ne refetch que **les totaux** (`getWorkoutWeeklyTotals`) pour la plage concernée, ce qui est déjà le cas quand `updatedWorkout` est fourni.
- Si pour une raison métier on doit parfois refetch aussi la liste des workouts (ex. calculs côté serveur), on pourrait soit :
  - faire retourner par `createWorkout` / `updateWorkout` les **workout_weekly_totals** mis à jour pour la semaine concernée (ou les 5 semaines), pour éviter un second appel ; soit
  - appeler la nouvelle action `getCalendarData` sur la même plage (1 seul appel au lieu de 2).

**Bénéfice :** Après sauvegarde : 1 (save) + 0 ou 1 (totaux ou getCalendarData) au lieu de 2 ou 3 requêtes.

---

### 3.3 (Optionnel) Filtrer les goals par plage de dates

**Idée :** Sur la page serveur, au lieu de `goals.select('*').eq('athlete_id', id)` sans filtre date, restreindre aux objectifs dont la date est dans l’intervalle des 5 semaines (ou un peu plus pour les objectifs « à venir »). Ex. `gte('date', startStr).lte('date', endStr)` ou équivalent selon le schéma.

**Bénéfice :** Moins de données transférées et moins de travail en base si un athlète a beaucoup d’objectifs. Impact faible si le nombre de goals reste limité.

---

### 3.4 (Optionnel) Cache / déduplication côté client

**Idée :** Éviter de relancer un chargement pour une plage déjà en cours ou déjà chargée (ex. garder un cache par `(athleteId, start, end)` avec un TTL court ou invalidation à la sauvegarde). Les `loadedWeeksRef` font déjà une partie du travail ; on pourrait étendre pour éviter des appels redondants si l’utilisateur navigue rapidement (prev/next/prev).

**Bénéfice :** Moins d’appels en cas de navigation répétée. À pondérer avec la complexité (cache, annulation, cohérence).

---

### 3.5 (Optionnel) Route API ou Server Action unique pour la page

**Idée :** Si on souhaite un cache HTTP (ex. court `revalidate` ou `stale-while-revalidate`), on pourrait exposer les données du calendrier via une **route API** GET (ou une server action appelée depuis le client) avec paramètres `athleteId`, `start`, `end`, et laisser Next gérer le cache. Cela s’accorde bien avec une action unique `getCalendarData` : l’API appellerait cette logique et renverrait le JSON.

**Bénéfice :** Possibilité de mettre en cache la réponse au niveau HTTP. À évaluer selon les besoins (fraîcheur vs réduction de charge).

---

## 4. Table des fichiers (recommandations principales)

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/workouts/actions.ts` | Logique données calendrier | **Créer** `getCalendarData(athleteId, startDate, endDate)` ; réutiliser les requêtes existantes en interne si on garde les 4 get* pour ailleurs. |
| `components/CalendarViewWithNavigation.tsx` | Chargement navigation + initial client | **Modifier** : remplacer les 2 endroits qui appellent les 4 get* par un seul appel à `getCalendarData`. Adapter le typage du payload (importedActivities optionnel pour le coach). |
| `app/[locale]/dashboard/calendar/page.tsx` | Données initiales athlète | Optionnel : appeler une fonction partagée (ex. même logique que `getCalendarData`) pour garder une seule source de vérité pour les requêtes calendrier. |
| `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | Données initiales coach | Idem : optionnel partage avec la logique `getCalendarData` (sans `imported_activities`). |

---

## 5. Tests manuels recommandés

- Ouvrir le calendrier (athlète puis coach) : vérifier que les données s’affichent comme avant (workouts, totaux, objectifs, activités importées pour l’athlète).
- Naviguer « semaine suivante » puis « semaine précédente » : vérifier qu’une seule requête réseau (ou un seul batch) part pour le chargement des semaines manquantes (après mise en place de `getCalendarData`).
- Créer / modifier un entraînement : vérifier que les totaux et la liste se mettent à jour sans double chargement inutile.
- Vérifier le comportement quand une des requêtes (ex. workouts) échoue : message d’erreur ou fallback cohérent.

---

## 6. Résumé

- **Problème principal :** multiplication des appels backend (4 requêtes HTTP et ~16 appels Supabase) à chaque navigation vers une nouvelle semaine, et répétition de l’auth/i18n dans chaque server action.
- **Pistes les plus impactantes :**
  1. **Une action agrégée `getCalendarData`** pour tout le chargement calendrier côté client (navigation + fallback initial).
  2. **Refetch après sauvegarde** limité aux totaux (ou à un seul appel `getCalendarData`) quand le workout est déjà retourné par le serveur.
- **Pistes complémentaires :** filtre des goals par plage, cache/déduplication client, option API + cache HTTP.

En suivant ces pistes, le chargement des informations du calendrier peut être nettement mieux regroupé et le nombre d’appels au backend réduit sans changer le comportement fonctionnel visible par l’utilisateur.
