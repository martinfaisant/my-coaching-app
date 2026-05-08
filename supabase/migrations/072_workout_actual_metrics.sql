-- Métriques "réalisé" saisies par l'athlète (séparées des objectifs coach `target_*`).
-- Règle produit : si `target_*` est NULL => champ "réalisé" non autorisé ; si `target_*` non NULL (même 0) => champ "réalisé" requis en status=completed.
-- Les objectifs coach doivent être conservés : l'athlète ne modifie jamais `target_*`.

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS actual_duration_minutes INTEGER NULL,
  ADD COLUMN IF NOT EXISTS actual_distance_km NUMERIC(8, 2) NULL,
  ADD COLUMN IF NOT EXISTS actual_elevation_m INTEGER NULL;

COMMENT ON COLUMN public.workouts.actual_duration_minutes IS 'Temps réellement réalisé (minutes), saisi par l''athlète. Null si non applicable.';
COMMENT ON COLUMN public.workouts.actual_distance_km IS 'Distance réellement réalisée (km), saisie par l''athlète. Null si non applicable.';
COMMENT ON COLUMN public.workouts.actual_elevation_m IS 'Dénivelé réellement réalisé (m), saisi par l''athlète. Null si non applicable.';

-- Backfill (compatibilité historique) :
-- Les séances déjà marquées "completed" avant l'ajout de ces colonnes n'ont pas de `actual_*`.
-- Pour permettre l'ajout de la contrainte "target non NULL => actual non NULL", on initialise `actual_*` à partir des `target_*`.
UPDATE public.workouts
SET
  actual_duration_minutes = CASE
    WHEN status = 'completed'
      AND target_duration_minutes IS NOT NULL
      AND actual_duration_minutes IS NULL
    THEN target_duration_minutes
    ELSE actual_duration_minutes
  END,
  actual_distance_km = CASE
    WHEN status = 'completed'
      AND target_distance_km IS NOT NULL
      AND actual_distance_km IS NULL
    THEN target_distance_km
    ELSE actual_distance_km
  END,
  actual_elevation_m = CASE
    WHEN status = 'completed'
      AND target_elevation_m IS NOT NULL
      AND actual_elevation_m IS NULL
    THEN target_elevation_m
    ELSE actual_elevation_m
  END;

-- Valeurs non négatives (0 autorisé car certains objectifs peuvent être 0).
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_actual_duration_non_negative;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_actual_duration_non_negative
  CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0);

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_actual_distance_non_negative;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_actual_distance_non_negative
  CHECK (actual_distance_km IS NULL OR actual_distance_km >= 0);

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_actual_elevation_non_negative;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_actual_elevation_non_negative
  CHECK (actual_elevation_m IS NULL OR actual_elevation_m >= 0);

-- Obligation conditionnelle : si status=completed ET target_* non NULL => actual_* non NULL.
-- (target=0 compte comme "renseigné" donc requis)
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_actual_required_if_target_completed;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_actual_required_if_target_completed
  CHECK (
    status <> 'completed'
    OR (
      (target_duration_minutes IS NULL OR actual_duration_minutes IS NOT NULL)
      AND (target_distance_km IS NULL OR actual_distance_km IS NOT NULL)
      AND (target_elevation_m IS NULL OR actual_elevation_m IS NOT NULL)
    )
  );

