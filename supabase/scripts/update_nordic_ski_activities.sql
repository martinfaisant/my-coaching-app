-- Script pour mettre à jour les activités Strava existantes qui devraient être du type nordic_ski
-- À exécuter après avoir appliqué la migration 027_add_nordic_ski_sport_type.sql

-- Mettre à jour les activités importées qui ont un type Strava contenant "nordic" ou "ski" (mais pas "alpine" ou "backcountry")
-- Le trigger recalcule automatiquement les totaux après la mise à jour
UPDATE public.imported_activities
SET sport_type = 'nordic_ski'
WHERE source = 'strava'
  AND (
    LOWER(COALESCE(activity_type, '')) LIKE '%nordic%' 
    OR (LOWER(COALESCE(activity_type, '')) LIKE '%ski%' AND LOWER(COALESCE(activity_type, '')) NOT LIKE '%alpine%' AND LOWER(COALESCE(activity_type, '')) NOT LIKE '%backcountry%' AND LOWER(COALESCE(activity_type, '')) NOT LIKE '%roller%')
    OR (raw_data->>'type' IS NOT NULL AND (LOWER(raw_data->>'type') LIKE '%nordic%' OR (LOWER(raw_data->>'type') LIKE '%ski%' AND LOWER(raw_data->>'type') NOT LIKE '%alpine%' AND LOWER(raw_data->>'type') NOT LIKE '%backcountry%' AND LOWER(raw_data->>'type') NOT LIKE '%roller%')))
    OR (raw_data->>'sport_type' IS NOT NULL AND (LOWER(raw_data->>'sport_type') LIKE '%nordic%' OR (LOWER(raw_data->>'sport_type') LIKE '%ski%' AND LOWER(raw_data->>'sport_type') NOT LIKE '%alpine%' AND LOWER(raw_data->>'sport_type') NOT LIKE '%backcountry%' AND LOWER(raw_data->>'sport_type') NOT LIKE '%roller%')))
  )
  AND sport_type != 'nordic_ski';

-- Le trigger sync_imported_activity_weekly_totals recalcule automatiquement les totaux
-- mais on peut forcer un recalcul complet pour toutes les semaines affectées si nécessaire

-- Recalculer les totaux hebdomadaires pour toutes les semaines affectées
-- Le trigger devrait le faire automatiquement, mais on peut forcer le recalcul si nécessaire
DO $$
DECLARE
  affected_weeks DATE[];
  week_date DATE;
BEGIN
  -- Récupérer toutes les semaines uniques qui ont des activités nordic_ski
  SELECT ARRAY_AGG(DISTINCT date_trunc('week', (date || ' 12:00:00')::timestamp)::date)
  INTO affected_weeks
  FROM public.imported_activities
  WHERE sport_type = 'nordic_ski';
  
  -- Recalculer les totaux pour chaque semaine
  IF affected_weeks IS NOT NULL THEN
    FOREACH week_date IN ARRAY affected_weeks
    LOOP
      -- Supprimer les anciens totaux pour cette semaine
      DELETE FROM public.imported_activity_weekly_totals
      WHERE week_start = week_date;
      
      -- Recalculer les totaux pour cette semaine
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
      WHERE date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date = week_date
        AND ia.raw_data IS NOT NULL
      GROUP BY ia.athlete_id, date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date, ia.sport_type
      ON CONFLICT (athlete_id, week_start, sport_type) DO UPDATE SET
        total_moving_time_seconds = EXCLUDED.total_moving_time_seconds,
        total_distance_m = EXCLUDED.total_distance_m,
        total_elevation_m = EXCLUDED.total_elevation_m,
        updated_at = NOW();
    END LOOP;
  END IF;
END $$;
