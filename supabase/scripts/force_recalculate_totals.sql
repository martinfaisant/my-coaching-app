-- Script pour forcer le recalcul de tous les totaux hebdomadaires après mise à jour des activités
-- À exécuter après avoir mis à jour les activités avec update_nordic_ski_activities.sql

-- Supprimer tous les totaux existants et les recalculer depuis les activités
DELETE FROM public.imported_activity_weekly_totals;

-- Recalculer tous les totaux depuis les activités importées
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
GROUP BY ia.athlete_id, date_trunc('week', (ia.date || ' 12:00:00')::timestamp)::date, ia.sport_type;

-- Vérifier les résultats
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
