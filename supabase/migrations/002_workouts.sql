-- À exécuter dans Supabase : Dashboard > SQL Editor (après 001_profiles_roles.sql).
-- Table des entraînements (créés par le coach pour un athlète)
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('course', 'musculation', 'natation', 'velo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_athlete_date ON public.workouts(athlete_id, date);

-- RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Coach : lecture / écriture pour les entraînements de ses athlètes (coach_id = auth.uid())
CREATE POLICY "workouts_select_coach"
  ON public.workouts FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

CREATE POLICY "workouts_insert_coach"
  ON public.workouts FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

CREATE POLICY "workouts_update_coach"
  ON public.workouts FOR UPDATE TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  )
  WITH CHECK (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

CREATE POLICY "workouts_delete_coach"
  ON public.workouts FOR DELETE TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

-- Athlète : lecture uniquement de ses propres entraînements
CREATE POLICY "workouts_select_athlete"
  ON public.workouts FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

-- Admin : lecture de tout (optionnel, pour support)
CREATE POLICY "workouts_select_admin"
  ON public.workouts FOR SELECT TO authenticated
  USING (public.is_admin());
