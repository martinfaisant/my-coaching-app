-- Notation du coach par l'athlète : une seule note par athlète par coach (modifiable)
CREATE TABLE IF NOT EXISTS public.coach_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(athlete_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_ratings_coach ON public.coach_ratings(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_ratings_athlete ON public.coach_ratings(athlete_id);

ALTER TABLE public.coach_ratings ENABLE ROW LEVEL SECURITY;

-- Athlète : voir et modifier sa propre note pour son coach
CREATE POLICY "coach_ratings_select_athlete"
  ON public.coach_ratings FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "coach_ratings_insert_athlete"
  ON public.coach_ratings FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "coach_ratings_update_athlete"
  ON public.coach_ratings FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Coach : voir les notes reçues (pour affichage moyenne / avis)
CREATE POLICY "coach_ratings_select_coach"
  ON public.coach_ratings FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

-- Mettre à jour updated_at à chaque modification
CREATE OR REPLACE FUNCTION public.set_coach_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_ratings_updated_at ON public.coach_ratings;
CREATE TRIGGER coach_ratings_updated_at
  BEFORE UPDATE ON public.coach_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_coach_ratings_updated_at();
