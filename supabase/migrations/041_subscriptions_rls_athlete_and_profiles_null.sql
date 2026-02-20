-- RLS : UPDATE athlète sur subscriptions + policies profiles pour coach_id = null (résiliation)

-- Athlète : mettre à jour sa propre souscription (status, end_date) pour la résiliation
CREATE POLICY "subscriptions_update_athlete"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Athlète : peut mettre son propre coach_id à null (se « délier » après résiliation)
CREATE POLICY "profiles_update_athlete_unset_coach"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Coach : peut mettre coach_id à null pour un athlète qui a une souscription avec lui (résiliation côté coach)
CREATE POLICY "profiles_update_coach_unset_athlete_coach"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT athlete_id FROM public.subscriptions
      WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "profiles_update_athlete_unset_coach" ON public.profiles IS 'Permet à l''athlète de mettre son coach_id à null après résiliation.';
COMMENT ON POLICY "profiles_update_coach_unset_athlete_coach" ON public.profiles IS 'Permet au coach de mettre coach_id à null pour un de ses athlètes (résiliation).';
