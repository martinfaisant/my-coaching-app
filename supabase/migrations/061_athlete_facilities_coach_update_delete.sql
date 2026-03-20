-- Coach : mise à jour / suppression des installations des athlètes (aligné sur la lecture :
-- souscription active | en résiliation OU profil avec coach_id = auth.uid()).

CREATE POLICY "athlete_facilities_update_coach"
  ON public.athlete_facilities FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.athlete_id = athlete_facilities.athlete_id
        AND s.coach_id = auth.uid()
        AND s.status IN ('active', 'cancellation_scheduled')
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = athlete_facilities.athlete_id
        AND p.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.athlete_id = athlete_facilities.athlete_id
        AND s.coach_id = auth.uid()
        AND s.status IN ('active', 'cancellation_scheduled')
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = athlete_facilities.athlete_id
        AND p.coach_id = auth.uid()
    )
  );

CREATE POLICY "athlete_facilities_delete_coach"
  ON public.athlete_facilities FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.athlete_id = athlete_facilities.athlete_id
        AND s.coach_id = auth.uid()
        AND s.status IN ('active', 'cancellation_scheduled')
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = athlete_facilities.athlete_id
        AND p.coach_id = auth.uid()
    )
  );

COMMENT ON POLICY "athlete_facilities_update_coach" ON public.athlete_facilities IS
  'Coach : mise à jour des installations (même périmètre que SELECT coach).';

COMMENT ON POLICY "athlete_facilities_delete_coach" ON public.athlete_facilities IS
  'Coach : suppression des installations (même périmètre que SELECT coach).';
