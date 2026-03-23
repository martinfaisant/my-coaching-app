-- Unité obligatoire (temps vs distance) pour les séances planifiées par sport — profil coach uniquement.
-- Clés : course, velo, natation — valeurs : "time" | "distance" (JSON texte).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workout_primary_metric_by_sport JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.workout_primary_metric_by_sport IS 'Pour coach : métrique obligatoire par sport (course, velo, natation). Valeurs time ou distance. Musculation = temps implicite.';
