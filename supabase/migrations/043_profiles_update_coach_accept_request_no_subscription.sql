-- RLS : éviter le conflit entre "accept request" et "unset coach_id" (résiliation)
--
-- Problème : quand le coach met à jour profiles (coach_id = null) pour résilier,
-- si l'athlète matche aussi la policy profiles_update_coach_accept_request (demande en attente),
-- la nouvelle ligne doit passer les WITH CHECK des deux policies. Or "accept" impose
-- WITH CHECK (coach_id = auth.uid()), donc coach_id = null est rejeté → "new row violates RLS".
--
-- Solution : restreindre "accept request" aux athlètes qui n'ont pas déjà une souscription
-- active avec ce coach. Ainsi, pour un athlète avec souscription (résiliation), seule
-- la policy profiles_update_coach_unset_athlete_coach (041) s'applique.

DROP POLICY IF EXISTS "profiles_update_coach_accept_request" ON public.profiles;

CREATE POLICY "profiles_update_coach_accept_request"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT cr.athlete_id FROM public.coach_requests cr
      WHERE cr.coach_id = auth.uid() AND cr.status = 'pending'
      AND NOT EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.athlete_id = cr.athlete_id AND s.coach_id = auth.uid() AND s.status = 'active'
      )
    )
  )
  WITH CHECK (coach_id = auth.uid());

COMMENT ON POLICY "profiles_update_coach_accept_request" ON public.profiles IS
  'Permet au coach de mettre coach_id sur le profil de l''athlète à l''acceptation d''une demande (pending), uniquement si l''athlète n''a pas déjà une souscription active avec ce coach.';
