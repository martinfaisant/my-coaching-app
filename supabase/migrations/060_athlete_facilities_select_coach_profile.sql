-- Aligner la lecture coach sur athlete_facilities avec workouts (002_workouts.sql) :
-- le coach accède aux entraînements via profiles.coach_id = auth.uid(), pas uniquement via subscriptions.
-- Sans cette policy, un coach avec athlète assigné (coach_id) mais sans ligne subscriptions active
-- voyait 0 ligne athlete_facilities (bandeau horaires vide dans la modale workout).

CREATE POLICY "athlete_facilities_select_coach_profile"
  ON public.athlete_facilities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = athlete_facilities.athlete_id
        AND p.coach_id = auth.uid()
    )
  );

COMMENT ON POLICY "athlete_facilities_select_coach_profile" ON public.athlete_facilities IS
  'Coach : lecture des installations des athlètes dont le profil référence ce coach (même règle que workouts_select_coach).';
