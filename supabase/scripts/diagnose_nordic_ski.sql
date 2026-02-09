-- Script de diagnostic pour vérifier les activités nordic ski

-- 1. Vérifier si la migration a été appliquée (contrainte CHECK doit inclure nordic_ski)
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.imported_activities'::regclass
  AND conname LIKE '%sport_type%';

-- 2. Vérifier la contrainte sur imported_activity_weekly_totals
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.imported_activity_weekly_totals'::regclass
  AND conname LIKE '%sport_type%';

-- 3. Vérifier les activités Strava qui pourraient être du type nordic_ski
SELECT 
  id,
  athlete_id,
  date,
  sport_type,
  activity_type,
  raw_data->>'type' AS raw_type,
  raw_data->>'sport_type' AS raw_sport_type,
  title
FROM public.imported_activities
WHERE source = 'strava'
  AND (
    LOWER(COALESCE(activity_type, '')) LIKE '%nordic%' 
    OR LOWER(COALESCE(activity_type, '')) LIKE '%ski%'
    OR LOWER(COALESCE(raw_data->>'type', '')) LIKE '%nordic%'
    OR LOWER(COALESCE(raw_data->>'type', '')) LIKE '%ski%'
    OR LOWER(COALESCE(raw_data->>'sport_type', '')) LIKE '%nordic%'
    OR LOWER(COALESCE(raw_data->>'sport_type', '')) LIKE '%ski%'
  )
ORDER BY date DESC;

-- 4. Vérifier les totaux hebdomadaires pour nordic_ski
SELECT 
  athlete_id,
  week_start,
  sport_type,
  total_moving_time_seconds,
  total_distance_m,
  total_elevation_m
FROM public.imported_activity_weekly_totals
WHERE sport_type = 'nordic_ski'
ORDER BY week_start DESC;

-- 5. Vérifier les totaux pour "course" pour voir si l'activité nordic_ski y est comptée par erreur
SELECT 
  athlete_id,
  week_start,
  sport_type,
  total_moving_time_seconds,
  total_distance_m,
  total_elevation_m
FROM public.imported_activity_weekly_totals
WHERE sport_type = 'course'
ORDER BY week_start DESC
LIMIT 10;
