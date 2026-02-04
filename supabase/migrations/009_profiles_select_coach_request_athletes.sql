-- Permettre au coach de voir le profil (nom, email) des athlètes qui lui ont envoyé une demande en attente
CREATE POLICY "profiles_select_coach_request_athletes"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT athlete_id FROM public.coach_requests
      WHERE coach_id = auth.uid() AND status = 'pending'
    )
  );
