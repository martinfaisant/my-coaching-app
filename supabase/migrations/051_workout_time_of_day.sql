-- Moment de la journée (Matin / Midi / Soir) pour structurer l'affichage calendrier par sections.
-- Référence : docs/design-workout-time-of-day/DESIGN.md, SPEC_TIME_OF_DAY.md

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS time_of_day TEXT;

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_time_of_day_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_time_of_day_check
  CHECK (time_of_day IS NULL OR time_of_day IN ('morning', 'noon', 'evening'));

COMMENT ON COLUMN public.workouts.time_of_day IS 'Moment de la journée (affichage calendrier par sections). NULL = non précisé ; morning = Matin, noon = Midi, evening = Soir.';
