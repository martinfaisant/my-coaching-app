# Spec technique – Disponibilités / indisponibilités athlète

**Mode :** Architecte  
**Date :** 2 mars 2026  
**Référence :** `docs/design-athlete-availability/DESIGN.md` (US1–US6, option D)

---

## 1. Modèle de données

### 1.1 Table `athlete_availability_slots`

Une ligne = un créneau (une date) de disponibilité ou d’indisponibilité. La **récurrence** est gérée en **dépliant** les occurrences à la création : pour « Récurrent, 1 semaine, jusqu’au 30 avril », on insère une ligne par date (même jour de la semaine entre la date de départ et la date de fin).

| Colonne        | Type         | Contraintes | Description |
|----------------|--------------|-------------|-------------|
| `id`           | UUID         | PK, default gen_random_uuid() | Identifiant |
| `athlete_id`   | UUID         | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Propriétaire (athlète) |
| `date`         | DATE         | NOT NULL | Jour concerné |
| `type`         | TEXT         | NOT NULL, CHECK (type IN ('available', 'unavailable')) | Type de créneau |
| `start_time`   | TIME         | NULL | Heure de début (optionnel ; NULL = journée entière) |
| `end_time`     | TIME         | NULL | Heure de fin (optionnel) |
| `note`         | TEXT         | NULL | Texte libre (affiché comme description sur la tuile) |
| `created_at`   | TIMESTAMPTZ  | NOT NULL DEFAULT NOW() | |
| `updated_at`   | TIMESTAMPTZ  | NOT NULL DEFAULT NOW() | |

**Contraintes métier (à vérifier en app ou en base) :**
- Si `start_time` et `end_time` sont renseignés : `start_time <= end_time`.
- Pas de contrainte d’unicité : plusieurs créneaux par jour et par athlète sont autorisés.

**Index :** `(athlete_id, date)` pour les requêtes calendrier par plage de dates.

---

### 1.2 Migration

**Fichier :** `supabase/migrations/052_athlete_availability_slots.sql`

- Création de la table, index, RLS (voir §2).
- Trigger `updated_at` sur `athlete_availability_slots` (même pattern que `workouts` si présent).

---

## 2. RLS (Row Level Security)

- **Athlète** (`athlete_id = auth.uid()`) : **SELECT**, **INSERT**, **UPDATE**, **DELETE** sur ses propres lignes.
- **Coach** : **SELECT** uniquement pour les athlètes dont il est le coach (`athlete_id IN (SELECT user_id FROM profiles WHERE coach_id = auth.uid())`). Pas d’INSERT/UPDATE/DELETE.
- **Admin** : optionnel, **SELECT** sur tout (policy avec `is_admin()` comme pour les autres tables si existant).

Policies à créer (sur `athlete_availability_slots`) :
- `athlete_availability_slots_select_athlete` (FOR SELECT, USING athlete_id = auth.uid())
- `athlete_availability_slots_insert_athlete` (FOR INSERT, WITH CHECK athlete_id = auth.uid())
- `athlete_availability_slots_update_athlete` (FOR UPDATE, USING + WITH CHECK athlete_id = auth.uid())
- `athlete_availability_slots_delete_athlete` (FOR DELETE, USING athlete_id = auth.uid())
- `athlete_availability_slots_select_coach` (FOR SELECT, USING athlete_id IN (SELECT user_id FROM profiles WHERE coach_id = auth.uid()))

---

## 3. Architecture des fichiers

### 3.1 Tableau Fichier | Rôle | Créer / Modifier

| Fichier | Rôle | Action |
|---------|------|--------|
| `supabase/migrations/052_athlete_availability_slots.sql` | Migration BDD | **Créer** |
| `types/database.ts` | Type `AthleteAvailabilitySlot` | **Modifier** (ajout type) |
| `lib/availabilityValidation.ts` | Validation formulaire (date, type, heures, récurrence) | **Créer** |
| `app/[locale]/dashboard/workouts/actions.ts` ou `app/[locale]/dashboard/availability/actions.ts` | Server actions : getAvailabilityForDateRange, createAvailability, updateAvailability, deleteAvailability | **Créer** (nouveau module `availability/actions.ts` recommandé) ou étendre workouts |
| `components/AvailabilityModal.tsx` | Modale création/édition (formulaire : date, type, Début/Fin, Note, bloc Récurrence) | **Créer** |
| `components/AvailabilityDetailModal.tsx` | Modale détail (lecture seule coach ; athlète : Modifier / Supprimer) | **Créer** |
| `components/CalendarView.tsx` | Affichage tuiles dispo/indispo (option D), ordre jour, bouton « + » athlète, clic tuile | **Modifier** |
| `components/CalendarViewWithNavigation.tsx` | Chargement `getAvailabilityForDateRange` avec plage dates, passage `availabilities` au CalendarView | **Modifier** |
| `components/AthleteCalendarPage.tsx` | Réception `initialAvailabilities`, passage à CalendarViewWithNavigation | **Modifier** |
| `components/CoachAthleteCalendarPage.tsx` | Idem (initialAvailabilities) | **Modifier** |
| `app/[locale]/dashboard/calendar/page.tsx` | Requête `athlete_availability_slots` sur plage 5 semaines, passage `initialAvailabilities` | **Modifier** |
| `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | Idem pour le calendrier coach d’un athlète | **Modifier** |
| `messages/fr.json` / `messages/en.json` | Clés i18n (namespace ex. `availability`) | **Modifier** |
| `docs/DESIGN_SYSTEM.md` | Tuile disponibilité (option D) si composant réutilisable documenté | **Modifier** (si composant dédié exporté) |

---

## 4. Flux et logique métier

### 4.1 Création avec récurrence

- **Entrées** : date de départ, type, start_time, end_time, note, récurrent (oui/non), si oui : fréquence (1/2/3/4 semaines), date de fin.
- **Logique** : si non récurrent → 1 ligne insérée. Si récurrent → calcul des dates (même jour de la semaine, pas = fréquence en semaines, de la date de départ jusqu’à date de fin incluse), puis **une insertion par date** (plusieurs lignes).
- **Validation** : date de fin ≥ date de départ ; fréquence 1, 2, 3 ou 4 ; start_time ≤ end_time si les deux présents.

### 4.2 Lecture calendrier

- **Pages** (calendar, athletes/[athleteId]) : charger les slots comme pour goals/workouts (plage 5 semaines initiale). Passer `initialAvailabilities` au composant calendrier.
- **Navigation** (changement de semaine) : comme pour les workouts, appeler `getAvailabilityForDateRange(athleteId, start, end)` et fusionner dans l’état des availabilities (ou recharger la plage concernée).
- **Ordre d’affichage par jour** : dispos/indispos → objectifs → entraînements → Strava. Tri des dispos/indispos par `start_time` (NULL en premier) puis `created_at`.

### 4.3 Bouton « + » et modale création

- **Qui** : affiché uniquement pour l’**athlète** (`athleteView === true`) et pour les jours **futurs** (`!day.isPast`).
- **Clic** : ouvre `AvailabilityModal` en mode création (date = jour cliqué, pré-remplie).
- **Enregistrement** : server action createAvailability (avec dépliage récurrence si besoin) → revalidatePath / router.refresh ou mise à jour état local.

### 4.4 Clic sur une tuile dispo/indispo

- **Athlète** : ouvre `AvailabilityDetailModal` avec actions **Modifier** (réouvre AvailabilityModal en édition) et **Supprimer** (confirmation puis deleteAvailability).
- **Coach** : ouvre `AvailabilityDetailModal` en **lecture seule** (pas de boutons Modifier/Supprimer).

### 4.5 Heures (pas de 15 min)

- Créneaux proposés dans les Dropdown : de 00:00 à 23:45 par pas de **15 minutes** (génération côté client ou liste statique). En base : type `TIME` (Supabase/Postgres).

---

## 5. Points à trancher en implémentation

1. **Emplacement des actions** : dédier `app/[locale]/dashboard/availability/actions.ts` (recommandé) ou ajouter dans `workouts/actions.ts`. Les deux nécessitent `requireCoachOrAthleteAccess` ; pour create/update/delete, restreindre à l’athlète (comme pour goals).
2. **Chargement des availabilities en navigation** : soit les inclure dans le même appel que les workouts (étendre la réponse ou un seul fetch « calendar data »), soit un appel séparé `getAvailabilityForDateRange` dans le même `useEffect` que les autres chargements. Prévoir fusion avec les données initiales (comme pour workouts).
3. **Modale détail** : une seule modale avec mode « lecture » (coach) vs « édition » (athlète avec Modifier/Supprimer), ou deux composants distincts. Recommandation : une `AvailabilityDetailModal` avec prop `canEdit` (dérivée de `athleteView` / rôle).
4. **Token couleur indisponible** : utiliser `palette-amber` ou ajouter `palette-unavailable` (orange) dans `tailwind.config.ts` et `docs/DESIGN_SYSTEM.md`.
5. **Limite récurrence** : nombre max d’occurrences à générer (ex. 52 pour 1 an en hebdo) pour éviter des insertions massives. À définir (ex. max 100 lignes par création).

---

## 6. Tests manuels recommandés

- **Athlète** : créer une dispo sans récurrence → vérifier apparition tuile (option D), ordre dans le jour. Créer une indispo avec récurrence 1 semaine jusqu’à J+21 → vérifier 3 tuiles. Modifier une tuile (heure, note). Supprimer une tuile. Jour passé : pas de bouton « + ». Sans heures : affichage note seule.
- **Coach** : ouvrir le calendrier d’un athlète → voir les tuiles dispo/indispo, pas de bouton « + », clic tuile = détail lecture seule sans Modifier/Supprimer.
- **i18n** : bascule FR/EN sur tous les libellés (modale, boutons, messages d’erreur).
- **RLS** : en tant qu’athlète A, ne pas pouvoir modifier/supprimer les slots d’un athlète B ; en tant que coach, ne pas pouvoir insérer/update/delete des slots.

---

## 7. Résumé

- **BDD** : une table `athlete_availability_slots` (une ligne par créneau par jour ; récurrence dépliée à la création).
- **RLS** : athlète = tout sur ses lignes ; coach = SELECT uniquement sur ses athlètes.
- **Fichiers** : migration 052, type dans `types/database.ts`, validation dédiée, actions availability (get/create/update/delete), AvailabilityModal, AvailabilityDetailModal, évolution CalendarView + CalendarViewWithNavigation + pages calendrier, i18n.
- **Style tuile** : option D (bordure fine uniquement, pas de border-l-4).
