-- Permettre au coach de mettre à jour le coach_id d'un athlète lorsqu'il accepte sa demande
CREATE POLICY "profiles_update_coach_accept_request"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT athlete_id FROM public.coach_requests
      WHERE coach_id = auth.uid() AND status = 'pending'
    )
  )
  WITH CHECK (coach_id = auth.uid());
