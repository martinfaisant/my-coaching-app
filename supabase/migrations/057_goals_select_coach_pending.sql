-- Coach : lecture des objectifs des athlètes qui ont une demande en attente chez lui
-- (avant acceptation, l'athlète n'a pas encore coach_id ; la policy goals_select_coach ne suffit pas)
CREATE POLICY "goals_select_coach_pending"
  ON public.goals FOR SELECT TO authenticated
  USING (
    athlete_id IN (
      SELECT cr.athlete_id
      FROM public.coach_requests cr
      WHERE cr.coach_id = auth.uid()
        AND cr.status = 'pending'
    )
  );
