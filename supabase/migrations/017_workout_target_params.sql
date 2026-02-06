-- Paramètres cible des entraînements (définis par le coach)
-- Course / Vélo : temps OU distance + dénivelé (facultatif)
-- Musculation : temps uniquement
-- Natation : temps OU distance

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS target_distance_km NUMERIC(8, 2) NULL,
  ADD COLUMN IF NOT EXISTS target_elevation_m INTEGER NULL;

COMMENT ON COLUMN public.workouts.target_duration_minutes IS 'Objectif en minutes (temps). Utilisé selon le sport.';
COMMENT ON COLUMN public.workouts.target_distance_km IS 'Objectif en km (distance). Course, vélo, natation.';
COMMENT ON COLUMN public.workouts.target_elevation_m IS 'Dénivelé en mètres (facultatif). Course et vélo uniquement.';
