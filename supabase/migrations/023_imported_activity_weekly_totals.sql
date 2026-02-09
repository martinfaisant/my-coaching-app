-- Vue : totaux par semaine et par sport des activités importées (temps, distance, D+).
-- Utilisée pour afficher la partie "fait" (réalisé) dans le calendrier.
-- raw_data contient moving_time (secondes), distance (mètres), total_elevation_gain (mètres).

-- week_start = lundi de la semaine (ISO week)
CREATE OR REPLACE VIEW public.v_imported_activity_weekly_totals AS
SELECT
  athlete_id,
  date_trunc('week', (date || ' 12:00:00')::timestamp)::date AS week_start,
  sport_type,
  COALESCE(SUM((raw_data->>'moving_time')::bigint), 0)::bigint AS total_moving_time_seconds,
  COALESCE(SUM((raw_data->>'distance')::double precision), 0)::double precision AS total_distance_m,
  COALESCE(SUM((raw_data->>'total_elevation_gain')::double precision), 0)::double precision AS total_elevation_m
FROM public.imported_activities
WHERE raw_data IS NOT NULL
GROUP BY athlete_id, date_trunc('week', (date || ' 12:00:00')::timestamp)::date, sport_type;

COMMENT ON VIEW public.v_imported_activity_weekly_totals IS 'Somme temps (s), distance (m), D+ (m) par athlète, semaine (lundi) et sport, depuis imported_activities.raw_data';

-- RLS : même règle que imported_activities (athlète voit uniquement ses lignes)
ALTER VIEW public.v_imported_activity_weekly_totals SET (security_invoker = on);

GRANT SELECT ON public.v_imported_activity_weekly_totals TO authenticated;
