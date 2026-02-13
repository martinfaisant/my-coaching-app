-- Fix: S'assurer que la politique pour les commentaires d'athlètes existe et fonctionne
-- Cette migration corrige un bug où les athlètes ne peuvent pas sauvegarder leurs commentaires

-- 1. Supprimer l'ancienne politique si elle existe (au cas où elle soit mal configurée)
DROP POLICY IF EXISTS "workouts_update_athlete_comment" ON public.workouts;

-- 2. Recréer la politique avec les bonnes permissions
-- L'athlète peut UPDATE les champs athlete_comment et athlete_comment_at de ses propres workouts
CREATE POLICY "workouts_update_athlete_comment"
  ON public.workouts 
  FOR UPDATE 
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- 3. S'assurer que les colonnes existent (au cas où la migration 003 n'aurait pas été appliquée)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workouts' 
    AND column_name = 'athlete_comment'
  ) THEN
    ALTER TABLE public.workouts ADD COLUMN athlete_comment TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workouts' 
    AND column_name = 'athlete_comment_at'
  ) THEN
    ALTER TABLE public.workouts ADD COLUMN athlete_comment_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Vérification : Cette requête devrait retourner la politique si elle existe
-- SELECT * FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'workouts_update_athlete_comment';
