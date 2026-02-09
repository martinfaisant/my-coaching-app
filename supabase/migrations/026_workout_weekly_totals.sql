-- Table des totaux hebdomadaires par sport (sommes des entraînements prévus).
-- Permet d'accélérer l'affichage du calendrier en précalculant les totaux.
-- Alimentée par un trigger sur workouts.

CREATE TABLE IF NOT EXISTS public.workout_weekly_totals (
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('course', 'musculation', 'natation', 'velo')),
  total_duration_minutes NUMERIC NOT NULL DEFAULT 0,
  total_distance_km NUMERIC NOT NULL DEFAULT 0,
  total_elevation_m NUMERIC NOT NULL DEFAULT 0,
  -- Pourcentage par rapport à la semaine précédente (null si pas de semaine précédente)
  duration_percent_vs_previous_week NUMERIC NULL,
  distance_percent_vs_previous_week NUMERIC NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (athlete_id, week_start, sport_type)
);

COMMENT ON TABLE public.workout_weekly_totals IS 'Somme temps (min), distance (km), D+ (m) par athlète, semaine (lundi) et sport. Alimentée par trigger depuis workouts. Inclut le % par rapport à la semaine précédente.';

CREATE INDEX IF NOT EXISTS idx_workout_weekly_totals_athlete_week
  ON public.workout_weekly_totals(athlete_id, week_start);

-- Fonction helper pour obtenir le lundi d'une semaine (ISO week)
CREATE OR REPLACE FUNCTION public.get_week_monday(date_val DATE)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT date_trunc('week', (date_val || ' 12:00:00')::timestamp)::date;
$$;

-- Fonction trigger : recalcule les totaux pour (athlete_id, week_start) après changement sur workouts.
CREATE OR REPLACE FUNCTION public.sync_workout_weekly_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_athlete_id UUID;
  v_week_start DATE;
  v_previous_week_start DATE;
  r RECORD;
  v_duration_minutes NUMERIC;
  v_distance_km NUMERIC;
  v_elevation_m NUMERIC;
  v_prev_duration NUMERIC;
  v_prev_distance NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    r := OLD;
  ELSE
    r := NEW;
  END IF;
  
  v_athlete_id := r.athlete_id;
  v_week_start := public.get_week_monday(r.date::DATE);
  
  -- Supprimer les totaux existants pour cette semaine
  DELETE FROM public.workout_weekly_totals
  WHERE workout_weekly_totals.athlete_id = v_athlete_id
    AND workout_weekly_totals.week_start = v_week_start;

  -- Recalculer les totaux pour cette semaine
  INSERT INTO public.workout_weekly_totals (
    athlete_id,
    week_start,
    sport_type,
    total_duration_minutes,
    total_distance_km,
    total_elevation_m,
    duration_percent_vs_previous_week,
    distance_percent_vs_previous_week,
    updated_at
  )
  SELECT
    w.athlete_id,
    public.get_week_monday(w.date::DATE) AS week_start,
    w.sport_type,
    COALESCE(SUM(w.target_duration_minutes), 0)::NUMERIC AS total_duration_minutes,
    COALESCE(SUM(w.target_distance_km), 0)::NUMERIC AS total_distance_km,
    COALESCE(SUM(w.target_elevation_m), 0)::NUMERIC AS total_elevation_m,
    NULL, -- Sera calculé après
    NULL, -- Sera calculé après
    NOW()
  FROM public.workouts w
  WHERE w.athlete_id = v_athlete_id
    AND public.get_week_monday(w.date::DATE) = v_week_start
  GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type;

  -- Calculer les pourcentages par rapport à la semaine précédente pour chaque sport
  FOR r IN 
    SELECT DISTINCT sport_type FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id AND week_start = v_week_start
  LOOP
    v_previous_week_start := v_week_start - INTERVAL '7 days';
    
    -- Récupérer les totaux de la semaine précédente
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_prev_duration, v_prev_distance
    FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id
      AND week_start = v_previous_week_start
      AND sport_type = r.sport_type;
    
    -- Récupérer les totaux de la semaine actuelle
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_duration_minutes, v_distance_km
    FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id
      AND week_start = v_week_start
      AND sport_type = r.sport_type;
    
    -- Calculer les pourcentages (null si pas de semaine précédente ou si les deux sont à 0)
    UPDATE public.workout_weekly_totals
    SET
      duration_percent_vs_previous_week = CASE
        WHEN v_prev_duration > 0 THEN ROUND((v_duration_minutes / v_prev_duration * 100)::NUMERIC, 2)
        ELSE NULL
      END,
      distance_percent_vs_previous_week = CASE
        WHEN v_prev_distance > 0 THEN ROUND((v_distance_km / v_prev_distance * 100)::NUMERIC, 2)
        ELSE NULL
      END
    WHERE athlete_id = v_athlete_id
      AND week_start = v_week_start
      AND sport_type = r.sport_type;
  END LOOP;

  -- Mettre à jour aussi les pourcentages de la semaine suivante si elle existe
  -- (car cette semaine devient maintenant la semaine précédente pour la suivante)
  FOR r IN 
    SELECT DISTINCT sport_type FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id AND week_start = v_week_start + INTERVAL '7 days'
  LOOP
    v_previous_week_start := v_week_start;
    
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_prev_duration, v_prev_distance
    FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id
      AND week_start = v_previous_week_start
      AND sport_type = r.sport_type;
    
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_duration_minutes, v_distance_km
    FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id
      AND week_start = v_week_start + INTERVAL '7 days'
      AND sport_type = r.sport_type;
    
    UPDATE public.workout_weekly_totals
    SET
      duration_percent_vs_previous_week = CASE
        WHEN v_prev_duration > 0 THEN ROUND((v_duration_minutes / v_prev_duration * 100)::NUMERIC, 2)
        ELSE NULL
      END,
      distance_percent_vs_previous_week = CASE
        WHEN v_prev_distance > 0 THEN ROUND((v_distance_km / v_prev_distance * 100)::NUMERIC, 2)
        ELSE NULL
      END
    WHERE athlete_id = v_athlete_id
      AND week_start = v_week_start + INTERVAL '7 days'
      AND sport_type = r.sport_type;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_sync_workout_weekly_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_workout_weekly_totals();

-- RLS : athlète voit ses totaux ; coach voit les totaux de ses athlètes.
ALTER TABLE public.workout_weekly_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_weekly_totals_select_own"
  ON public.workout_weekly_totals FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "workout_weekly_totals_select_coach_athletes"
  ON public.workout_weekly_totals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = workout_weekly_totals.athlete_id
        AND p.coach_id = auth.uid()
    )
  );

-- Seul le trigger écrit dans cette table (pas d'INSERT/UPDATE/DELETE depuis l'app).
GRANT SELECT ON public.workout_weekly_totals TO authenticated;

-- Remplissage initial à partir des entraînements existants.
-- On doit d'abord insérer toutes les semaines, puis calculer les pourcentages
INSERT INTO public.workout_weekly_totals (
  athlete_id,
  week_start,
  sport_type,
  total_duration_minutes,
  total_distance_km,
  total_elevation_m,
  duration_percent_vs_previous_week,
  distance_percent_vs_previous_week,
  updated_at
)
SELECT
  w.athlete_id,
  public.get_week_monday(w.date::DATE) AS week_start,
  w.sport_type,
  COALESCE(SUM(w.target_duration_minutes), 0)::NUMERIC AS total_duration_minutes,
  COALESCE(SUM(w.target_distance_km), 0)::NUMERIC AS total_distance_km,
  COALESCE(SUM(w.target_elevation_m), 0)::NUMERIC AS total_elevation_m,
  NULL, -- Sera calculé après
  NULL, -- Sera calculé après
  NOW()
FROM public.workouts w
GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type
ON CONFLICT (athlete_id, week_start, sport_type) DO UPDATE SET
  total_duration_minutes = EXCLUDED.total_duration_minutes,
  total_distance_km = EXCLUDED.total_distance_km,
  total_elevation_m = EXCLUDED.total_elevation_m,
  updated_at = NOW();

-- Calculer les pourcentages pour toutes les semaines
DO $$
DECLARE
  r RECORD;
  v_prev_duration NUMERIC;
  v_prev_distance NUMERIC;
  v_duration_minutes NUMERIC;
  v_distance_km NUMERIC;
BEGIN
  FOR r IN 
    SELECT DISTINCT athlete_id, week_start, sport_type
    FROM public.workout_weekly_totals
    ORDER BY athlete_id, week_start, sport_type
  LOOP
    -- Récupérer les totaux de la semaine précédente
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_prev_duration, v_prev_distance
    FROM public.workout_weekly_totals
    WHERE athlete_id = r.athlete_id
      AND week_start = r.week_start - INTERVAL '7 days'
      AND sport_type = r.sport_type;
    
    -- Récupérer les totaux de la semaine actuelle
    SELECT 
      COALESCE(total_duration_minutes, 0),
      COALESCE(total_distance_km, 0)
    INTO v_duration_minutes, v_distance_km
    FROM public.workout_weekly_totals
    WHERE athlete_id = r.athlete_id
      AND week_start = r.week_start
      AND sport_type = r.sport_type;
    
    -- Calculer les pourcentages
    UPDATE public.workout_weekly_totals
    SET
      duration_percent_vs_previous_week = CASE
        WHEN v_prev_duration > 0 THEN ROUND((v_duration_minutes / v_prev_duration * 100)::NUMERIC, 2)
        ELSE NULL
      END,
      distance_percent_vs_previous_week = CASE
        WHEN v_prev_distance > 0 THEN ROUND((v_distance_km / v_prev_distance * 100)::NUMERIC, 2)
        ELSE NULL
      END
    WHERE athlete_id = r.athlete_id
      AND week_start = r.week_start
      AND sport_type = r.sport_type;
  END LOOP;
END $$;
