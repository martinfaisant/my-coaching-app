# 🔍 Diagnostic approfondi : Bug commentaires athlètes

## Situation actuelle
- ✅ Migration 031 exécutée
- ❌ Bug toujours présent
- Besoin d'identifier la vraie cause

---

## 🎯 Causes potentielles identifiées

### 1. **Politique RLS mal appliquée ou en conflit** (PROBABLE)

**Symptôme** : UPDATE retourne 0 lignes même sans erreur

**Cause** :
- La politique `workouts_update_athlete_comment` existe mais ne s'applique pas correctement
- Conflit avec une autre politique
- La politique n'a pas les bonnes permissions

**Test** :
```sql
-- Exécuter dans Supabase SQL Editor
-- Voir supabase/scripts/debug_athlete_comment.sql PARTIE 2.2
```

**Indicateur** : Si `.select()` après `.update()` retourne un tableau vide (`data.length === 0`), c'est RLS.

**Solution potentielle** :
```sql
-- Option A : Politique trop restrictive, la réécrire
DROP POLICY IF EXISTS "workouts_update_athlete_comment" ON public.workouts;

CREATE POLICY "workouts_update_athlete_comment"
  ON public.workouts 
  FOR UPDATE 
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Option B : Conflit avec workouts_update_coach ?
-- Vérifier s'il faut DISABLE puis RE-ENABLE RLS
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
```

---

### 2. **Problème d'authentification dans l'action** (POSSIBLE)

**Symptôme** : `user.id` ne correspond pas à `athleteId`

**Cause** :
- Le cookie de session n'est pas correctement lu
- L'utilisateur est déconnecté
- Le `athleteId` passé est incorrect

**Test** :
```typescript
// Les nouveaux logs dans saveWorkoutComment vont montrer :
console.log('[saveWorkoutComment] Tentative de sauvegarde:', {
  workoutId,
  athleteId,
  userId: user.id, // ← Ces deux doivent être identiques
  commentLength: comment.length,
})
```

**Indicateur** : Si `userId !== athleteId`, on a `return { error: 'Non autorisé.' }`

**Solution** : Vérifier comment `athleteId` est passé au composant.

---

### 3. **Le workout n'existe pas ou n'appartient pas à l'athlète** (POSSIBLE)

**Symptôme** : `.eq('id', workoutId).eq('athlete_id', athleteId)` ne trouve aucune ligne

**Cause** :
- Le `workoutId` est incorrect
- Le workout a été supprimé
- Le workout appartient à un autre athlète (incohérence)

**Test** :
```sql
-- Vérifier qu'un workout spécifique existe
SELECT id, athlete_id, title, athlete_comment 
FROM workouts 
WHERE id = '<workout_id_from_logs>';
```

**Indicateur** : Les nouveaux logs montrent `dataLength: 0` même sans erreur.

**Solution** : Vérifier la cohérence des données.

---

### 4. **Cache / Revalidation ne fonctionne pas** (MOINS PROBABLE)

**Symptôme** : Données sauvegardées en DB mais pas visibles dans l'UI

**Cause** :
- `revalidatePath()` ne fonctionne pas correctement
- Le cache Next.js ne se rafraîchit pas
- Les données sont récupérées depuis un cache stale

**Test** :
1. Sauvegarder un commentaire
2. Aller directement dans Supabase Dashboard → Table Editor
3. Vérifier si `athlete_comment` est présent dans la DB

**Indicateur** : Si le commentaire est en DB mais pas dans l'UI → c'est le cache.

**Solution** :
```typescript
// Forcer un refresh plus agressif
revalidatePath(pathToRevalidate, 'page')
revalidatePath('/dashboard/calendar', 'page')
```

---

### 5. **Problème de client Supabase (serveur vs client)** (PEU PROBABLE)

**Symptôme** : Utilisation du mauvais client

**Cause** :
- L'action utilise `createClient()` qui est le client server (correct)
- Mais peut-être que le contexte Next.js ne passe pas les cookies

**Test** :
```typescript
// Dans saveWorkoutComment, vérifier que getUser() retourne bien un user
const { data: { user }, error: authError } = await supabase.auth.getUser()
console.log('Auth check:', { user: !!user, authError })
```

**Indicateur** : Si `user` est `null`, c'est un problème d'auth.

**Solution** : Vérifier la configuration SSR de Supabase.

---

### 6. **Trigger/Constraint bloque l'UPDATE** (TRÈS RARE)

**Symptôme** : Erreur PostgreSQL lors de l'UPDATE

**Cause** :
- Le trigger `workouts_updated_at` a un bug
- Une contrainte CHECK échoue
- Un trigger BEFORE UPDATE retourne NULL

**Test** :
```sql
-- Voir supabase/scripts/debug_athlete_comment.sql PARTIE 3
-- Lister tous les triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workouts';
```

**Indicateur** : `error.message` contient "constraint" ou "trigger".

**Solution** : Désactiver temporairement les triggers pour tester.

---

### 7. **Frontend ne recharge pas les données** (POSSIBLE)

**Symptôme** : Données sauvegardées mais l'UI ne se met pas à jour

**Cause** :
- `WorkoutModal` ne recharge pas `workout` après sauvegarde
- Le `workout` prop vient d'un cache côté client
- Il manque un `onWorkoutSaved` callback

**Test** :
1. Sauvegarder un commentaire
2. Fermer la modale
3. **Rafraîchir la page entière (F5)**
4. Rouvrir le workout

**Indicateur** : Si le commentaire apparaît après F5 → c'est le frontend.

**Solution** :
```typescript
// Dans WorkoutModal, après sauvegarde réussie
if (result.success) {
  // Forcer un refetch du workout
  router.refresh()
}
```

---

## 🧪 Plan de diagnostic étape par étape

### Étape 1 : Vérifier les logs serveur (NOUVEAU)
1. Ouvrir la console serveur Next.js (terminal où vous avez lancé `npm run dev`)
2. Ouvrir un workout en tant qu'athlète
3. Écrire un commentaire
4. **Observer les logs `[saveWorkoutComment]`** :
   ```
   [saveWorkoutComment] Tentative de sauvegarde: { ... }
   [saveWorkoutComment] Résultat: { success: true/false, ... }
   ```

**Que chercher** :
- ✅ `success: true, dataLength: 1` → L'UPDATE a marché !
- ❌ `success: true, dataLength: 0` → **RLS bloque (Cause #1)**
- ❌ `error: "..."` → Lire le message d'erreur
- ❌ `userId !== athleteId` → **Problème d'auth (Cause #2)**

---

### Étape 2 : Vérifier dans la base de données
1. Aller sur **Supabase Dashboard** → **Table Editor**
2. Ouvrir la table `workouts`
3. Chercher le workout concerné (filtre par `id` ou `athlete_id`)
4. **Regarder la colonne `athlete_comment`**

**Que chercher** :
- ✅ Le commentaire est là → **Problème de cache (Cause #4)** ou **frontend (Cause #7)**
- ❌ Le commentaire n'est pas là → **Problème serveur (Causes #1, #2, #3)**

---

### Étape 3 : Exécuter le script SQL de diagnostic
1. Copier tout le contenu de `supabase/scripts/debug_athlete_comment.sql`
2. Aller sur **Supabase Dashboard** → **SQL Editor**
3. Coller et exécuter **PARTIE 1 et 2**
4. Remplacer les valeurs `<athlete_user_id>` et `<workout_id>` réelles
5. Observer si `UPDATE 1` ou `UPDATE 0`

**Que chercher** :
- ✅ `UPDATE 1` → La politique RLS fonctionne ! Problème ailleurs
- ❌ `UPDATE 0` → **La politique RLS est le problème (Cause #1)**
- ❌ Erreur permission → **La politique n'existe pas vraiment**

---

### Étape 4 : Test du workflow complet
1. En tant qu'**athlète** (pas coach)
2. Ouvrir un workout **planifié par le coach**
3. Écrire "Test diagnostic 123"
4. Attendre "Commentaire enregistré"
5. **Fermer la modale**
6. **Rouvrir le même workout**
7. Observer si le commentaire est là

**Ensuite** :
8. **Rafraîchir la page (F5)**
9. **Rouvrir le workout**
10. Observer si le commentaire est là

**Que chercher** :
- ✅ Commentaire présent à l'étape 7 → Tout fonctionne !
- ❌ Commentaire absent à l'étape 7, présent à l'étape 10 → **Problème de revalidation (Cause #4)**
- ❌ Commentaire absent à l'étape 10 → **Problème serveur (Causes #1-3)**

---

## 📊 Tableau de diagnostic rapide

| Symptôme | Cause probable | Test rapide |
|----------|---------------|-------------|
| Logs montrent `dataLength: 0` | RLS bloque (#1) | Script SQL PARTIE 2.2 |
| Logs montrent erreur Supabase | Constraint/Trigger (#6) | Lire error.message |
| Commentaire en DB mais pas UI | Cache/Frontend (#4 ou #7) | F5 résout ? |
| `userId !== athleteId` dans logs | Auth incorrecte (#2) | Vérifier session |
| Aucun log serveur visible | Action pas appelée | Vérifier frontend |

---

## 🔧 Corrections à tester (dans l'ordre)

### Correction A : Recréer toutes les politiques UPDATE
```sql
-- 1. Supprimer toutes les politiques UPDATE existantes
DROP POLICY IF EXISTS "workouts_update_coach" ON public.workouts;
DROP POLICY IF EXISTS "workouts_update_athlete_comment" ON public.workouts;

-- 2. Recréer la politique coach
CREATE POLICY "workouts_update_coach"
  ON public.workouts FOR UPDATE TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  )
  WITH CHECK (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

-- 3. Recréer la politique athlète (PRIORITAIRE)
CREATE POLICY "workouts_update_athlete"
  ON public.workouts FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());
```

**Note** : J'ai renommé en `workouts_update_athlete` (sans `_comment`) car l'athlète devrait pouvoir modifier **tous** les champs de ses workouts, pas seulement le commentaire.

---

### Correction B : Ajouter .select() pour détecter RLS
✅ **Déjà fait** dans le code mis à jour ci-dessus.

---

### Correction C : Forcer la revalidation
```typescript
// Dans saveWorkoutComment, après success
revalidatePath(pathToRevalidate, 'page')
revalidatePath('/dashboard', 'layout')
```

---

### Correction D : Vérifier les colonnes (redondant mais sûr)
```sql
-- S'assurer que les colonnes existent
ALTER TABLE public.workouts 
  ADD COLUMN IF NOT EXISTS athlete_comment TEXT,
  ADD COLUMN IF NOT EXISTS athlete_comment_at TIMESTAMPTZ;
```

---

## 📝 Checklist de vérification

Avant de dire "c'est corrigé", vérifier :

- [ ] Les logs serveur montrent `success: true, dataLength: 1`
- [ ] Le commentaire est visible dans Supabase Table Editor
- [ ] Le commentaire persiste après fermeture/réouverture de la modale
- [ ] Le commentaire persiste après refresh de la page (F5)
- [ ] Le coach peut voir le commentaire de l'athlète
- [ ] Pas d'erreur dans la console browser
- [ ] Pas d'erreur dans les logs serveur

---

## 🚀 Action immédiate recommandée

1. **Exécuter le script SQL** `debug_athlete_comment.sql` (PARTIE 1 et 2)
2. **Observer les logs serveur** après avoir testé de sauvegarder un commentaire
3. **Reporter les résultats** : 
   - Que disent les logs `[saveWorkoutComment]` ?
   - Est-ce que `UPDATE 1` ou `UPDATE 0` dans le test SQL ?
   - Le commentaire est-il en DB (Table Editor) ?

Avec ces 3 infos, on pourra identifier LA vraie cause et appliquer la correction précise.

---

**Date** : 13 février 2026  
**Status** : 🔍 En cours de diagnostic
