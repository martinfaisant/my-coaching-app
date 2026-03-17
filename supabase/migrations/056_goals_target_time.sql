-- Objectif de temps (temps cible) facultatif pour un objectif
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS target_time_hours INTEGER NULL,
  ADD COLUMN IF NOT EXISTS target_time_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS target_time_seconds INTEGER NULL;

COMMENT ON COLUMN public.goals.target_time_hours IS 'Heures de l''objectif de temps (0-99), NULL = pas d''objectif';
COMMENT ON COLUMN public.goals.target_time_minutes IS 'Minutes de l''objectif de temps (0-59)';
COMMENT ON COLUMN public.goals.target_time_seconds IS 'Secondes de l''objectif de temps (0-59)';
