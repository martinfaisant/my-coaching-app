-- Objectifs et volume par sport (athlète) : temps à allouer global + volume par sport/semaine
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_target_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weekly_volume_by_sport JSONB DEFAULT '{}';

COMMENT ON COLUMN public.profiles.weekly_target_hours IS 'Temps à allouer par semaine (global), en heures, pour l''athlète.';
COMMENT ON COLUMN public.profiles.weekly_volume_by_sport IS 'Volume actuel par sport et par semaine (km, m ou h selon sport). Clés = sport (course, velo, natation, musculation, ...).';
