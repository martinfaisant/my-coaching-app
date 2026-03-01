-- Statut de réalisation des séances (planifié / réalisé / non réalisé).
-- US1 : champ status sur workouts, modifiable par l'athlète.

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned';

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_status_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_status_check
  CHECK (status IN ('planned', 'completed', 'not_completed'));

COMMENT ON COLUMN public.workouts.status IS 'Statut de réalisation : planned (planifié), completed (réalisé), not_completed (non réalisé). Modifiable par l''athlète.';
