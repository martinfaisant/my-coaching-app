-- Script de diagnostic pour le bug des commentaires d'athlètes
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- PARTIE 1 : VÉRIFIER LES POLITIQUES RLS
-- ============================================

-- 1.1 Lister TOUTES les politiques UPDATE sur la table workouts
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies 
WHERE tablename = 'workouts' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Résultat attendu :
-- - workouts_update_coach (pour les coaches)
-- - workouts_update_athlete_comment (pour les athlètes)


-- 1.2 Vérifier que les colonnes existent
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'workouts' 
  AND column_name IN ('athlete_comment', 'athlete_comment_at')
ORDER BY column_name;

-- Résultat attendu :
-- athlete_comment    | text                        | YES
-- athlete_comment_at | timestamp with time zone    | YES


-- ============================================
-- PARTIE 2 : TESTER L'UPDATE AVEC UN CAS RÉEL
-- ============================================

-- 2.1 Trouver un workout existant (remplacez les valeurs selon votre DB)
-- Récupérer un workout d'un athlète
SELECT 
  w.id AS workout_id,
  w.athlete_id,
  w.title,
  w.date,
  w.athlete_comment,
  w.athlete_comment_at,
  p.email AS athlete_email,
  p.full_name AS athlete_name
FROM workouts w
JOIN profiles p ON p.user_id = w.athlete_id
WHERE p.role = 'athlete'
LIMIT 5;

-- COPIEZ un workout_id et un athlete_id depuis les résultats ci-dessus


-- 2.2 Tester l'UPDATE directement (en tant qu'athlète simulé)
-- ⚠️ REMPLACEZ '<athlete_user_id>' par un vrai user_id d'athlète
-- ⚠️ REMPLACEZ '<workout_id>' par un vrai workout_id

-- Simuler l'authentification en tant qu'athlète
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '<athlete_user_id>'; -- ⚠️ REMPLACER ICI

-- Tenter l'UPDATE du commentaire
UPDATE public.workouts 
SET 
  athlete_comment = 'Test commentaire de diagnostic',
  athlete_comment_at = NOW()
WHERE id = '<workout_id>' -- ⚠️ REMPLACER ICI
  AND athlete_id = '<athlete_user_id>'; -- ⚠️ REMPLACER ICI

-- Si cette commande retourne "UPDATE 1", la politique RLS fonctionne ✅
-- Si elle retourne "UPDATE 0" ou une erreur de permission, la politique RLS est mal configurée ❌


-- 2.3 Vérifier que la mise à jour a bien été appliquée
SELECT 
  id,
  title,
  athlete_comment,
  athlete_comment_at
FROM workouts
WHERE id = '<workout_id>'; -- ⚠️ REMPLACER ICI


-- 2.4 Réinitialiser pour revenir en mode admin
RESET ROLE;


-- ============================================
-- PARTIE 3 : DIAGNOSTIQUER LES CONFLITS
-- ============================================

-- 3.1 Vérifier s'il y a des triggers qui pourraient interférer
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workouts'
ORDER BY trigger_name;


-- 3.2 Vérifier les contraintes CHECK qui pourraient bloquer
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'workouts'
ORDER BY tc.constraint_name;


-- ============================================
-- PARTIE 4 : LOGS ET HISTORIQUE
-- ============================================

-- 4.1 Voir les derniers commentaires sauvegardés (pour vérifier si ça a déjà marché)
SELECT 
  w.id,
  w.date,
  w.title,
  w.athlete_comment,
  w.athlete_comment_at,
  w.updated_at,
  p.email AS athlete_email
FROM workouts w
JOIN profiles p ON p.user_id = w.athlete_id
WHERE w.athlete_comment IS NOT NULL
  AND w.athlete_comment != ''
ORDER BY w.athlete_comment_at DESC
LIMIT 10;

-- Si cette requête retourne des lignes avec athlete_comment_at récent, 
-- cela signifie que la sauvegarde a déjà fonctionné pour d'autres workouts


-- ============================================
-- PARTIE 5 : TEST DE LA POLITIQUE ISOLÉE
-- ============================================

-- 5.1 Tester si la politique workouts_update_athlete_comment existe vraiment
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'workouts' 
      AND policyname = 'workouts_update_athlete_comment'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE '✅ La politique workouts_update_athlete_comment existe';
  ELSE
    RAISE NOTICE '❌ La politique workouts_update_athlete_comment N''EXISTE PAS !';
  END IF;
END $$;


-- ============================================
-- RÉSUMÉ DES CHECKS
-- ============================================

-- Pour que la sauvegarde fonctionne, vous devez avoir :
-- ✅ Politique "workouts_update_athlete_comment" visible dans PARTIE 1.1
-- ✅ Colonnes athlete_comment et athlete_comment_at présentes dans PARTIE 1.2
-- ✅ UPDATE réussi (retourne "UPDATE 1") dans PARTIE 2.2
-- ✅ Commentaire visible après UPDATE dans PARTIE 2.3

-- Si l'un de ces checks échoue, notez lequel et partagez le résultat.
