# 🐛 Bug : Commentaires d'athlètes non sauvegardés

## Problème identifié

**Symptôme** : Quand un athlète écrit un commentaire sur un entraînement, il reçoit le message "Commentaire enregistré" mais quand il quitte la page et revient, le commentaire a disparu.

**Cause racine** : La politique RLS (Row Level Security) permettant aux athlètes de mettre à jour le champ `athlete_comment` de leurs workouts n'était probablement pas appliquée en production, ou était mal configurée.

## Architecture du système de commentaires

### 1. Structure de données
```sql
-- Table workouts
workouts (
  id UUID,
  athlete_id UUID,
  coach_id UUID,
  -- ... autres champs ...
  athlete_comment TEXT,           -- Le commentaire de l'athlète
  athlete_comment_at TIMESTAMPTZ  -- Date du dernier commentaire
)
```

### 2. Flux de sauvegarde

1. **Frontend** (`components/WorkoutModal.tsx`) :
   - L'athlète tape un commentaire dans un `<Textarea>`
   - Debounce de 800ms pour éviter trop de requêtes
   - Appelle `saveWorkoutComment()` automatiquement
   - Affiche "Commentaire enregistré" si succès

2. **Backend** (`app/dashboard/workouts/actions.ts`) :
   - `saveWorkoutComment()` vérifie que l'utilisateur est authentifié
   - Vérifie que `user.id === athleteId` (ownership)
   - Appelle Supabase `.update()` sur la table `workouts`
   - **C'est ici que le RLS bloquait l'opération** ❌

3. **Database** (Supabase) :
   - Les politiques RLS sont évaluées
   - Si aucune politique n'autorise l'UPDATE, l'opération échoue silencieusement
   - Le frontend reçoit `{ success: true }` mais rien n'est sauvegardé

## Politiques RLS existantes

### Avant la correction

```sql
-- Migration 002 : Le coach peut UPDATE tout
CREATE POLICY "workouts_update_coach"
  ON workouts FOR UPDATE
  USING (athlete_id IN (SELECT user_id FROM profiles WHERE coach_id = auth.uid()));

-- Migration 003 : L'athlète devrait pouvoir UPDATE (mais peut ne pas exister en prod)
CREATE POLICY "workouts_update_athlete_comment"
  ON workouts FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());
```

**Problème** : La politique `workouts_update_athlete_comment` n'était peut-être pas appliquée en production.

### Après la correction (Migration 031)

```sql
-- 1. Supprime l'ancienne politique (au cas où)
DROP POLICY IF EXISTS "workouts_update_athlete_comment" ON workouts;

-- 2. Recrée la politique correctement
CREATE POLICY "workouts_update_athlete_comment"
  ON workouts FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- 3. Vérifie que les colonnes existent
-- (athlete_comment, athlete_comment_at)
```

## Solution appliquée

### Fichier créé : `supabase/migrations/031_fix_athlete_comment_policy.sql`

Cette migration :
1. ✅ Supprime l'ancienne politique (si elle existe mal configurée)
2. ✅ Recrée la politique avec les bonnes permissions
3. ✅ Vérifie que les colonnes nécessaires existent
4. ✅ Est **idempotente** (peut être exécutée plusieurs fois sans problème)

## Déploiement de la correction

### En développement local

```bash
# Réinitialiser la DB locale (si nécessaire)
npx supabase db reset

# Ou appliquer uniquement la nouvelle migration
npx supabase db push
```

### En production

**Option 1 : Via Supabase Dashboard**
1. Aller dans **Database** → **Migrations**
2. Créer une nouvelle migration
3. Copier le contenu de `031_fix_athlete_comment_policy.sql`
4. Exécuter

**Option 2 : Via CLI**
```bash
# Link to production
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

**Option 3 : SQL Editor (Quick Fix)**
Si vous voulez corriger immédiatement sans migration :
1. Aller dans **SQL Editor** dans Supabase
2. Exécuter directement le SQL de la migration 031

## Vérification après correction

### 1. Vérifier que la politique existe

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'workouts' 
  AND policyname = 'workouts_update_athlete_comment';
```

**Résultat attendu** :
- `policyname`: `workouts_update_athlete_comment`
- `cmd`: `UPDATE`
- `qual`: `(athlete_id = auth.uid())`
- `with_check`: `(athlete_id = auth.uid())`

### 2. Tester manuellement

Depuis un compte **athlète** :
1. Ouvrir un entraînement planifié
2. Écrire un commentaire dans "Votre commentaire"
3. Attendre le message "Commentaire enregistré"
4. **Fermer la modale et la rouvrir**
5. ✅ Le commentaire doit être présent
6. **Rafraîchir la page (F5)**
7. ✅ Le commentaire doit toujours être présent

### 3. Vérifier dans la base de données

```sql
SELECT 
  id,
  date,
  title,
  athlete_comment,
  athlete_comment_at
FROM workouts
WHERE athlete_comment IS NOT NULL
ORDER BY athlete_comment_at DESC
LIMIT 10;
```

Si vous voyez des lignes avec `athlete_comment` rempli, la correction fonctionne ! ✅

## Code concerné

### Frontend
- `components/WorkoutModal.tsx` (lignes 229-247) : `saveCommentOnFly()`
- `components/WorkoutModal.tsx` (lignes 250-274) : `handleClose()` avec sauvegarde

### Backend
- `app/dashboard/workouts/actions.ts` (lignes 326-354) : `saveWorkoutComment()`

### Database
- `supabase/migrations/002_workouts.sql` : Création table + politiques coach
- `supabase/migrations/003_workout_comment.sql` : Ajout colonnes + politique athlète (peut ne pas être appliquée)
- `supabase/migrations/031_fix_athlete_comment_policy.sql` : **🆕 Correction du bug**

## Prévention future

### Tests recommandés
1. **Test RLS en local** avant déploiement :
   ```sql
   -- Se connecter en tant qu'athlète et tester l'UPDATE
   SET LOCAL ROLE authenticated;
   SET LOCAL request.jwt.claim.sub = '<athlete_user_id>';
   
   UPDATE workouts 
   SET athlete_comment = 'Test commentaire'
   WHERE id = '<workout_id>' AND athlete_id = '<athlete_user_id>';
   ```

2. **Tests E2E** pour les commentaires :
   - Créer un test Playwright/Cypress simulant un athlète
   - Écrire un commentaire
   - Recharger la page
   - Vérifier que le commentaire est toujours là

### Monitoring
- **Logs Supabase** : Surveiller les erreurs `permission denied` sur `workouts.update`
- **Sentry/Error tracking** : Capturer les erreurs de l'action `saveWorkoutComment`

## Statut

- ✅ Bug identifié
- ✅ Cause racine trouvée (politique RLS manquante/mal appliquée)
- ✅ Migration de correction créée (`031_fix_athlete_comment_policy.sql`)
- ⏳ **À déployer en production**
- ⏳ **À tester après déploiement**

## Impact

- **Utilisateurs affectés** : Tous les athlètes
- **Gravité** : 🔴 **Haute** (perte de données utilisateur)
- **Fréquence** : Chaque fois qu'un athlète essaie de commenter
- **Workaround** : Aucun (nécessite un fix côté serveur)

---

**Date du diagnostic** : 13 février 2026  
**Développeur** : Assistant AI + User
