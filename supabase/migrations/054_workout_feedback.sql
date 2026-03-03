-- Retour athlète après une séance : ressenti (1–5), intensité effort perçu (1–10), plaisir (1–5).
-- Spec : docs/design-workout-feedback/SPEC_ARCHITECTURE.md

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS perceived_feeling SMALLINT,
  ADD COLUMN IF NOT EXISTS perceived_intensity SMALLINT,
  ADD COLUMN IF NOT EXISTS perceived_pleasure SMALLINT;

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_perceived_feeling_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_perceived_feeling_check
  CHECK (perceived_feeling IS NULL OR (perceived_feeling >= 1 AND perceived_feeling <= 5));

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_perceived_intensity_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_perceived_intensity_check
  CHECK (perceived_intensity IS NULL OR (perceived_intensity >= 1 AND perceived_intensity <= 10));

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_perceived_pleasure_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_perceived_pleasure_check
  CHECK (perceived_pleasure IS NULL OR (perceived_pleasure >= 1 AND perceived_pleasure <= 5));

COMMENT ON COLUMN public.workouts.perceived_feeling IS 'Ressenti athlète (1 = très mal → 5 = très bien). Optionnel, modifiable par l''athlète.';
COMMENT ON COLUMN public.workouts.perceived_intensity IS 'Intensité effort perçu RPE (1–10). Optionnel, modifiable par l''athlète.';
COMMENT ON COLUMN public.workouts.perceived_pleasure IS 'Plaisir pris pendant la séance (1 = aucun → 5 = très agréable). Optionnel, modifiable par l''athlète.';
