# Spec technique – Résultat d’objectif (goal result)

**Mode :** Architecte  
**Date :** 3 mars 2026  
**Référence :** `docs/design-goal-result/DESIGN.md` (user stories US1–US4)

---

## 1. Architecture et flux

### 1.1 Flux principaux

1. **Saisie / modification du résultat (athlète, page Mes objectifs)**  
   - Page `/[locale]/dashboard/objectifs` → `ObjectifsTable` reçoit la liste des goals (déjà en `select('*')`).  
   - Pour chaque objectif passé : affichage du résumé résultat si présent + bouton « Saisir le résultat » ou « Modifier le résultat ».  
   - Clic → ouverture d’une **modale** (titre = `goal.race_name`), formulaire : Temps (3 champs H/min/s), Place, Note.  
   - Soumission → **server action** `saveGoalResult(goalId, formData)` → `UPDATE goals SET result_* WHERE id = goalId AND athlete_id = auth.uid()` → revalidate paths → retour success/error.  
   - Modale se ferme, tuile affiche le nouveau résumé (temps formaté + place si présent).

2. **Ajout d’un objectif avec date passée (US4)**  
   - Formulaire « Ajouter un objectif » (toujours sur la page objectifs) : **retrait de la contrainte** `min={today}` sur le champ date (côté client).  
   - Côté serveur : **suppression** du bloc `if (date < today) return { error: t('cannotSetInPast') }` dans `addGoal`.  
   - Après création, l’objectif apparaît en liste (passé) ; l’athlète peut cliquer sur « Saisir le résultat ».

3. **Lecture côté coach**  
   - Vue « Objectifs de l’athlète » : `CoachAthleteCalendarPage` (sidebar liste des objectifs) et modale détail objectif dans `CalendarView`.  
   - Données : même table `goals` avec `select('*')` → les nouveaux champs résultat sont lus.  
   - **Aucun bouton** « Saisir / Modifier le résultat » pour le coach.  
   - Affichage : dans la liste objectifs (sidebar coach) et dans la modale détail objectif (calendrier), afficher temps formaté + place + note si présents (lecture seule).

### 1.2 Schéma des appels

```
[ObjectifsTable]
  → addGoal(formData)           [existant, modifié : accepter date passée]
  → deleteGoal(goalId)          [existant]
  → saveGoalResult(goalId, formData)  [nouveau]

[GoalResultModal]
  → saveGoalResult(goalId, formData)  [useActionState]
  → onSuccess → onClose + router.refresh()
```

---

## 2. Modèle de données

### 2.1 Table `goals` – colonnes ajoutées

| Colonne | Type | Nullable | Description |
|--------|------|----------|-------------|
| `result_time_hours` | INTEGER | Oui | Heures (0–99). NULL = pas de résultat. |
| `result_time_minutes` | INTEGER | Oui | Minutes (0–59). |
| `result_time_seconds` | INTEGER | Oui | Secondes (0–59). |
| `result_place` | INTEGER | Oui | Place à l’arrivée (ex. 42). |
| `result_note` | TEXT | Oui | Note libre ; limite 500 caractères (contrôle applicatif). |

**Règle métier :** Un objectif « a un résultat » si et seulement si les trois champs temps sont renseignés (non NULL). Dans ce cas, la sauvegarde exige que les trois soient présents et valides (heures 0–99, minutes 0–59, secondes 0–59). `result_place` et `result_note` restent optionnels.

**Affichage résumé :** Temps formaté (ex. `3h42` ou `1h05min30s`) + si `result_place` présent, afficher « · 24e » (ordinal selon locale).

### 2.2 Migration

- **Fichier :** `supabase/migrations/053_goals_result.sql`
- **Contenu :** `ALTER TABLE public.goals` ajout des 5 colonnes ci‑dessus, sans contrainte CHECK (validation côté application).

---

## 3. RLS (Row Level Security)

- **Aucune modification des politiques existantes.**
- La politique `goals_update_athlete` autorise déjà `UPDATE` sur les lignes où `athlete_id = auth.uid()` ; les nouvelles colonnes sont donc modifiables par l’athlète.
- Le coach n’a que `goals_select_coach` (SELECT) ; il ne peut pas modifier les résultats.

---

## 4. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `supabase/migrations/053_goals_result.sql` | Ajout colonnes résultat sur `goals` | **Créer** |
| `types/database.ts` | Type `Goal` : ajout champs optionnels `result_time_hours`, `result_time_minutes`, `result_time_seconds`, `result_place`, `result_note` | **Modifier** |
| `app/[locale]/dashboard/objectifs/actions.ts` | `addGoal` : accepter date passée ; ajout `saveGoalResult(goalId, formData)` avec validation temps (3 champs requis, 0–99 / 0–59 / 0–59), place optionnel, note optionnelle (max 500 car.), vérification `goal.date < today` et `athlete_id = user.id` | **Modifier** |
| `lib/goalResultUtils.ts` | `formatGoalResultTime(goal): string` (ex. "3h42", "1h05min30s") ; `hasGoalResult(goal): boolean` | **Créer** |
| `app/[locale]/dashboard/objectifs/ObjectifsTable.tsx` | Pour objectifs passés : bouton « Saisir le résultat » / « Modifier le résultat » ; affichage résumé (temps + place) ; retrait `min={today}` et retrait `setCustomValidity` date passée sur le formulaire d’ajout ; ouverture modale résultat | **Modifier** |
| `app/[locale]/dashboard/objectifs/GoalResultModal.tsx` | Modale client : titre = `goal.race_name`, formulaire (Temps H/min/s, Place, Note), `useActionState(saveGoalResult)`, pattern bouton Enregistrer (PATTERN_SAVE_BUTTON), Annuler / Enregistrer | **Créer** |
| `components/CalendarView.tsx` | Dans la modale détail objectif (createPortal goal) : ajout d’une section « Résultat » (temps formaté, place, note) si `hasGoalResult(selectedGoal)` | **Modifier** |
| `components/CoachAthleteCalendarPage.tsx` | Dans la liste des objectifs (sidebar) : pour chaque objectif passé avec résultat, afficher le résumé (temps + place) sous la ligne distance (comme dans le mockup tuile) | **Modifier** |
| `messages/fr.json` | Clés `goals.result.*` (titre modale implicite = race_name), labels Temps, Place, Note, boutons Saisir/Modifier le résultat, messages validation | **Modifier** |
| `messages/en.json` | Idem (traductions EN) | **Modifier** |

---

## 5. Logique métier (détail)

### 5.1 `saveGoalResult(goalId, formData)`

- **Auth :** `requireRole(supabase, 'athlete')`.
- **Input :** `goal_id`, `result_time_hours`, `result_time_minutes`, `result_time_seconds` (requis), `result_place` (optionnel), `result_note` (optionnel, max 500 car.), `_locale`.
- **Vérifications :**
  1. Récupérer la ligne `goals` pour `id = goalId` et `athlete_id = user.id` (sinon 403 / erreur).
  2. Vérifier `goal.date < today` (sinon erreur « Résultat possible uniquement pour un objectif passé »).
  3. Valider heures (0–99), minutes (0–59), secondes (0–59) ; si invalide → message d’erreur i18n.
  4. Si `result_note` fourni et `length > 500` → erreur.
- **Update :** `UPDATE goals SET result_time_hours, result_time_minutes, result_time_seconds, result_place, result_note WHERE id = goalId AND athlete_id = user.id`.
- **Retour :** `GoalFormState` (success / error) ; `revalidatePath('/dashboard/objectifs')` et `revalidatePath('/dashboard/calendar')`.

### 5.2 `addGoal` (modification US4)

- Supprimer le bloc :
  ```ts
  if (date < today) return { error: t('cannotSetInPast') }
  ```
- Le formulaire client ne doit plus imposer `min={today}` sur le champ date ; retirer aussi le `useEffect` qui fait `setCustomValidity` pour une date passée (ou l’adapter pour ne plus bloquer).

### 5.3 Affichage « a un résultat »

- **Condition :** `goal.result_time_hours != null && goal.result_time_minutes != null && goal.result_time_seconds != null` (ou helper `hasGoalResult(goal)`).
- **Résumé tuile :** `formatGoalResultTime(goal)` + si `result_place` : ` · ${place}e` (ordinal, i18n si besoin).

---

## 6. Cas limites et contraintes

| Cas | Comportement |
|-----|--------------|
| Objectif futur | Pas de bouton « Saisir le résultat » ; si appel direct à `saveGoalResult` pour un goal avec `date >= today`, retour erreur. |
| Temps partiel (ex. seulement minutes) | Refusé : les trois champs temps sont requis pour enregistrer un résultat. |
| Minutes ou secondes > 59 | Erreur de validation côté serveur (message i18n). |
| Note > 500 caractères | Erreur de validation côté serveur. |
| Coach tente UPDATE goals | RLS : aucune politique UPDATE pour le coach → refus DB. |
| Objectif supprimé pendant que la modale est ouverte | Après submit : l’update ne trouve pas la ligne (ou plus les droits) → gérer l’erreur et afficher un message générique. |

---

## 7. Tests manuels recommandés

1. **Athlète – Mes objectifs**  
   - Objectif passé sans résultat : bouton « Saisir le résultat » → modale avec titre = nom de la course → remplir H/min/s, place, note → Enregistrer → tuile affiche le résumé, bouton devient « Modifier le résultat ».  
   - Modifier le résultat : réouverture modale, champs pré-remplis, changement puis Enregistrer.  
   - Objectif futur : pas de bouton « Saisir le résultat ».

2. **Athlète – Ajout objectif date passée**  
   - Formulaire « Ajouter un objectif » : choisir une date passée, nom, distance, priorité → Enregistrer → objectif créé et visible en liste (passé) → « Saisir le résultat » fonctionne.

3. **Validation**  
   - Temps : minutes 60 ou secondes 60 → message d’erreur.  
   - Temps vides → message d’erreur.  
   - Note > 500 caractères → message d’erreur.

4. **Coach – Calendrier athlète**  
   - Ouvrir un athlète ayant des objectifs passés avec résultat : dans la sidebar « Objectifs de l’athlète », les tuiles affichent le résumé (temps, place) ; pas de bouton « Saisir le résultat ».  
   - Clic sur un objectif (détail) : modale avec section Résultat (temps, place, note) en lecture seule.

5. **i18n**  
   - Basculer FR/EN : libellés modale, boutons, messages d’erreur et format ordinal (24e / 24th) cohérents.

---

## 8. Points à trancher en implémentation

- **Format d’affichage du temps :** choix exact dans `formatGoalResultTime` (ex. "3h42" vs "3h 42min" vs "1h05min30s" selon que secondes = 0 ou non). À aligner avec le design system / préférence produit.
- **Ordinal (place) :** affichage "24e" (FR) vs "24th" (EN) — utiliser une lib ou snippet i18n si disponible.
- **Modale objectif (CalendarView) :** le titre actuel est "Détails de l’objectif" (goalDetails) ; le design dit que la modale de **saisie** a pour titre le nom de la course. La modale de **détail** (calendrier) peut garder un titre générique ou afficher `race_name` en titre + section Résultat en dessous — à valider visuellement.

---

## 9. Checklist avant livraison spec

- [x] Migrations définies (colonnes ajoutées, pas de changement RLS)
- [x] RLS justifiées (aucune modification)
- [x] Table des fichiers (Créer / Modifier) complète
- [x] Cas limites listés (futur, validation, coach, note longue)
- [x] Tests manuels recommandés décrits
- [x] Points à trancher en implémentation indiqués
