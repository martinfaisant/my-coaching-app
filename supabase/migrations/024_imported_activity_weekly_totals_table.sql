-- Table des totaux hebdomadaires par sport (sommes des activités importées).
-- Permet au coach de voir les totaux "fait" sans accéder aux activités Strava.
-- Alimentée par un trigger sur imported_activities.

DROP VIEW IF EXISTS public.v_imported_activity_weekly_totals;

CREATE TABLE IF NOT EXISTS public.imported_activity_weekly_totals (
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('course', 'musculation', 'natation', 'velo')),
  total_moving_time_seconds BIGINT NOT NULL DEFAULT 0,
  total_distance_m NUMERIC NOT NULL DEFAULT 0,
  total_elevation_m NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (athlete_id, week_start, sport_type)
);

COMMENT ON TABLE public.imported_activity_weekly_totals IS 'Somme temps (s), distance (m), D+ (m) par athlète, semaine (lundi) et sport. Alimentée par trigger depuis imported_activities. Visible par le coach pour ses athlètes.';

CREATE INDEX IF NOT EXISTS idx_imported_activity_weekly_totals_athlete_week
  ON public.imported_activity_weekly_totals(athlete_id, week_start);

-- Fonction trigger : recalcule les totaux pour (athlete_id, week_start) après changement sur imported_activities.
CREATE OR REPLACE FUNCTION public.sync_imported_activity_weekly_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_athlete_id UUID;
  v_week_start DATE;
  r RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    r := OLD;
  ELSE
    r := NEW;
  END IF;
  v_athlete_id := r.athlete_id;
  v_week_start := date_trunc('week', (r.date || ' 12:00:00')::timestamp)::date;

  DELETE FROM public.imported_activity_weekly_totals
  WHERE imported_activity_weekly_totals.athlete_id = v_athlete_id
    AND imported_activity_weekly_totals.week_start = v_week_start;

  INSERT INTO public.imported_activity_weekly_totals (
    athlete_id,
    week_start,
    sport_type,
    total_moving_time_seconds,
    total_distance_m,
    total_elevation_m,
    updated_at
  )
  SELECT
    ia.athlete_id,
    date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date AS week_start,
    ia.sport_type,
    COALESCE(SUM((ia.raw_data->>'moving_time')::bigint), 0)::bigint,
    COALESCE(SUM((ia.raw_data->>'distance')::double precision), 0)::numeric,
    COALESCE(SUM((ia.raw_data->>'total_elevation_gain')::double precision), 0)::numeric,
    NOW()
  FROM public.imported_activities ia
  WHERE ia.athlete_id = v_athlete_id
    AND date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date = v_week_start
    AND ia.raw_data IS NOT NULL
  GROUP BY ia.athlete_id, date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date, ia.sport_type;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_sync_imported_activity_weekly_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.imported_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_imported_activity_weekly_totals();

-- RLS : athlète voit ses totaux ; coach voit les totaux de ses athlètes.
ALTER TABLE public.imported_activity_weekly_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imported_activity_weekly_totals_select_own"
  ON public.imported_activity_weekly_totals FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "imported_activity_weekly_totals_select_coach_athletes"
  ON public.imported_activity_weekly_totals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = imported_activity_weekly_totals.athlete_id
        AND p.coach_id = auth.uid()
    )
  );

-- Seul le trigger écrit dans cette table (pas d'INSERT/UPDATE/DELETE depuis l'app).
GRANT SELECT ON public.imported_activity_weekly_totals TO authenticated;

-- Remplissage initial à partir des activités existantes.
INSERT INTO public.imported_activity_weekly_totals (
  athlete_id,
  week_start,
  sport_type,
  total_moving_time_seconds,
  total_distance_m,
  total_elevation_m,
  updated_at
)
SELECT
  ia.athlete_id,
  date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date AS week_start,
  ia.sport_type,
  COALESCE(SUM((ia.raw_data->>'moving_time')::bigint), 0)::bigint,
  COALESCE(SUM((ia.raw_data->>'distance')::double precision), 0)::numeric,
  COALESCE(SUM((ia.raw_data->>'total_elevation_gain')::double precision), 0)::numeric,
  NOW()
FROM public.imported_activities ia
WHERE ia.raw_data IS NOT NULL
GROUP BY ia.athlete_id, date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date, ia.sport_type
ON CONFLICT (athlete_id, week_start, sport_type) DO UPDATE SET
  total_moving_time_seconds = EXCLUDED.total_moving_time_seconds,
  total_distance_m = EXCLUDED.total_distance_m,
  total_elevation_m = EXCLUDED.total_elevation_m,
  updated_at = NOW();
