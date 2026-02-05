-- L'athlète peut supprimer (annuler) sa propre demande en attente
CREATE POLICY "coach_requests_delete_athlete"
  ON public.coach_requests FOR DELETE TO authenticated
  USING (
    athlete_id = auth.uid()
    AND status = 'pending'
  );
