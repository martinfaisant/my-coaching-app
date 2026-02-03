-- Commentaire de l'athlète sur un entraînement (visible par le coach)
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS athlete_comment TEXT,
  ADD COLUMN IF NOT EXISTS athlete_comment_at TIMESTAMPTZ;

-- L'athlète peut mettre à jour uniquement le commentaire de ses entraînements
CREATE POLICY "workouts_update_athlete_comment"
  ON public.workouts FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());
