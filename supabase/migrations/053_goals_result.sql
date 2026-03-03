-- Résultat pour un objectif passé (temps, place, note)
-- US: athlète saisit résultat (3 champs temps, place optionnelle, note optionnelle)
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS result_time_hours INTEGER NULL,
  ADD COLUMN IF NOT EXISTS result_time_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS result_time_seconds INTEGER NULL,
  ADD COLUMN IF NOT EXISTS result_place INTEGER NULL,
  ADD COLUMN IF NOT EXISTS result_note TEXT NULL;

COMMENT ON COLUMN public.goals.result_time_hours IS 'Heures du résultat (0-99), NULL = pas de résultat';
COMMENT ON COLUMN public.goals.result_time_minutes IS 'Minutes du résultat (0-59)';
COMMENT ON COLUMN public.goals.result_time_seconds IS 'Secondes du résultat (0-59)';
COMMENT ON COLUMN public.goals.result_place IS 'Place à l''arrivée (ex. 42)';
COMMENT ON COLUMN public.goals.result_note IS 'Note libre (max 500 car. côté app)';
