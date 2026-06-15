-- Activités saisies par l'athlète (planned_by = 'athlete') : toujours réalisées, hors totaux « prévu ».

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS planned_by TEXT NOT NULL DEFAULT 'coach'
  CHECK (planned_by IN ('coach', 'athlete'));

COMMENT ON COLUMN public.workouts.planned_by IS
  'coach = séance planifiée par le coach ; athlete = activité saisie par l''athlète (toujours réalisée).';

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_athlete_logged_status_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_athlete_logged_status_check
  CHECK (planned_by <> 'athlete' OR status = 'completed');

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_athlete_logged_no_targets_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_athlete_logged_no_targets_check
  CHECK (
    planned_by <> 'athlete'
    OR (
      target_duration_minutes IS NULL
      AND target_distance_km IS NULL
      AND target_elevation_m IS NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_workouts_athlete_planned_by_date
  ON public.workouts(athlete_id, date)
  WHERE planned_by = 'athlete';

-- Athlète : CRUD sur ses activités perso uniquement
CREATE POLICY "workouts_insert_athlete_logged"
  ON public.workouts FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    AND planned_by = 'athlete'
    AND status = 'completed'
  );

CREATE POLICY "workouts_update_athlete_logged"
  ON public.workouts FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid() AND planned_by = 'athlete')
  WITH CHECK (athlete_id = auth.uid() AND planned_by = 'athlete');

CREATE POLICY "workouts_delete_athlete_logged"
  ON public.workouts FOR DELETE TO authenticated
  USING (athlete_id = auth.uid() AND planned_by = 'athlete');

-- Coach : ne peut plus modifier / supprimer les activités athlète
DROP POLICY IF EXISTS "workouts_update_coach" ON public.workouts;
CREATE POLICY "workouts_update_coach"
  ON public.workouts FOR UPDATE TO authenticated
  USING (
    planned_by = 'coach'
    AND athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  )
  WITH CHECK (
    planned_by = 'coach'
    AND athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "workouts_delete_coach" ON public.workouts;
CREATE POLICY "workouts_delete_coach"
  ON public.workouts FOR DELETE TO authenticated
  USING (
    planned_by = 'coach'
    AND athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

-- Totaux « prévu » : exclure les activités athlète
CREATE OR REPLACE FUNCTION public.sync_workout_weekly_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_athlete_id UUID;
  v_week_start DATE;
  v_old_week_start DATE;
  v_previous_week_start DATE;
  r RECORD;
  v_duration_minutes NUMERIC;
  v_distance_km NUMERIC;
  v_elevation_m NUMERIC;
  v_prev_duration NUMERIC;
  v_prev_distance NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_athlete_id := OLD.athlete_id;
    v_week_start := public.get_week_monday(OLD.date::DATE);
    v_old_week_start := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_athlete_id := NEW.athlete_id;
    v_week_start := public.get_week_monday(NEW.date::DATE);
    v_old_week_start := public.get_week_monday(OLD.date::DATE);
    IF v_old_week_start IS NOT NULL AND v_old_week_start != v_week_start THEN
      DELETE FROM public.workout_weekly_totals
      WHERE workout_weekly_totals.athlete_id = v_athlete_id
        AND workout_weekly_totals.week_start = v_old_week_start;

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
        NULL,
        NULL,
        NOW()
      FROM public.workouts w
      WHERE w.athlete_id = v_athlete_id
        AND public.get_week_monday(w.date::DATE) = v_old_week_start
        AND w.planned_by = 'coach'
      GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type;

      FOR r IN
        SELECT DISTINCT sport_type FROM public.workout_weekly_totals
        WHERE athlete_id = v_athlete_id AND week_start = v_old_week_start
      LOOP
        v_previous_week_start := v_old_week_start - INTERVAL '7 days';

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
          AND week_start = v_old_week_start
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
          AND week_start = v_old_week_start
          AND sport_type = r.sport_type;
      END LOOP;

      FOR r IN
        SELECT DISTINCT sport_type FROM public.workout_weekly_totals
        WHERE athlete_id = v_athlete_id AND week_start = v_old_week_start + INTERVAL '7 days'
      LOOP
        v_previous_week_start := v_old_week_start;

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
          AND week_start = v_old_week_start + INTERVAL '7 days'
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
          AND week_start = v_old_week_start + INTERVAL '7 days'
          AND sport_type = r.sport_type;
      END LOOP;
    END IF;
  ELSE
    v_athlete_id := NEW.athlete_id;
    v_week_start := public.get_week_monday(NEW.date::DATE);
    v_old_week_start := NULL;
  END IF;

  DELETE FROM public.workout_weekly_totals
  WHERE workout_weekly_totals.athlete_id = v_athlete_id
    AND workout_weekly_totals.week_start = v_week_start;

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
    NULL,
    NULL,
    NOW()
  FROM public.workouts w
  WHERE w.athlete_id = v_athlete_id
    AND public.get_week_monday(w.date::DATE) = v_week_start
    AND w.planned_by = 'coach'
  GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type;

  FOR r IN
    SELECT DISTINCT sport_type FROM public.workout_weekly_totals
    WHERE athlete_id = v_athlete_id AND week_start = v_week_start
  LOOP
    v_previous_week_start := v_week_start - INTERVAL '7 days';

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
      AND week_start = v_week_start
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
      AND week_start = v_week_start
      AND sport_type = r.sport_type;
  END LOOP;

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

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_workout_weekly_totals() IS
  'Recalcule workout_weekly_totals (séances coach planned_by=coach uniquement) après changement sur workouts.';
