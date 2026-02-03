-- Objectifs de l'athlète (courses, etc.) — visibles par le coach en lecture seule
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  race_name TEXT NOT NULL,
  distance TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_athlete ON public.goals(athlete_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Athlète : tout sur ses objectifs
CREATE POLICY "goals_select_athlete"
  ON public.goals FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "goals_insert_athlete"
  ON public.goals FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "goals_update_athlete"
  ON public.goals FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "goals_delete_athlete"
  ON public.goals FOR DELETE TO authenticated
  USING (athlete_id = auth.uid());

-- Coach : lecture seule des objectifs de ses athlètes
CREATE POLICY "goals_select_coach"
  ON public.goals FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );
