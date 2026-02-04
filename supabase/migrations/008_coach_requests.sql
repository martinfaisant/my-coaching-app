-- Demandes de coaching : l'athlète envoie une demande au coach, le coach accepte ou refuse
CREATE TABLE IF NOT EXISTS public.coach_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_practiced TEXT NOT NULL,
  coaching_need TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coach_requests_coach ON public.coach_requests(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_requests_athlete ON public.coach_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_requests_status ON public.coach_requests(coach_id, status);

ALTER TABLE public.coach_requests ENABLE ROW LEVEL SECURITY;

-- Athlète : créer une demande (vers un coach), voir ses propres demandes
CREATE POLICY "coach_requests_insert_athlete"
  ON public.coach_requests FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    AND coach_id IN (SELECT user_id FROM public.profiles WHERE role = 'coach')
  );

CREATE POLICY "coach_requests_select_athlete"
  ON public.coach_requests FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

-- Coach : voir les demandes qui lui sont adressées, mettre à jour le statut (accepter/refuser)
CREATE POLICY "coach_requests_select_coach"
  ON public.coach_requests FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "coach_requests_update_coach"
  ON public.coach_requests FOR UPDATE TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());
