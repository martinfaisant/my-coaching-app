-- Amélioration du trigger sync_workout_weekly_totals pour gérer le changement de date lors d'un UPDATE.
-- Si la date change, il faut mettre à jour les totaux de l'ancienne semaine ET de la nouvelle semaine.

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
  -- En cas de DELETE, utiliser OLD
  IF TG_OP = 'DELETE' THEN
    v_athlete_id := OLD.athlete_id;
    v_week_start := public.get_week_monday(OLD.date::DATE);
    v_old_week_start := NULL; -- Pas d'ancienne semaine en DELETE
  -- En cas de UPDATE, vérifier si la date a changé
  ELSIF TG_OP = 'UPDATE' THEN
    v_athlete_id := NEW.athlete_id;
    v_week_start := public.get_week_monday(NEW.date::DATE);
    v_old_week_start := public.get_week_monday(OLD.date::DATE);
    -- Si la date (et donc la semaine) a changé, il faut aussi mettre à jour l'ancienne semaine
    IF v_old_week_start IS NOT NULL AND v_old_week_start != v_week_start THEN
      -- Recalculer les totaux pour l'ancienne semaine
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
      GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type;

      -- Calculer les pourcentages pour l'ancienne semaine
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

      -- Mettre à jour aussi les pourcentages de la semaine suivante de l'ancienne semaine
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
  -- En cas de INSERT, utiliser NEW
  ELSE
    v_athlete_id := NEW.athlete_id;
    v_week_start := public.get_week_monday(NEW.date::DATE);
    v_old_week_start := NULL;
  END IF;
  
  -- Recalculer les totaux pour la nouvelle semaine (ou la semaine actuelle si pas de changement)
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
  GROUP BY w.athlete_id, public.get_week_monday(w.date::DATE), w.sport_type;

  -- Calculer les pourcentages par rapport à la semaine précédente pour chaque sport de la nouvelle semaine
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

  -- Mettre à jour aussi les pourcentages de la semaine suivante si elle existe
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

COMMENT ON FUNCTION public.sync_workout_weekly_totals() IS 'Recalcule les totaux hebdomadaires après INSERT/UPDATE/DELETE sur workouts. Gère le changement de date lors d''un UPDATE en mettant à jour les deux semaines concernées.';
