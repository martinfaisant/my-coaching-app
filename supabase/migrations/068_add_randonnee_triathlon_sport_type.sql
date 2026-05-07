-- Ajouter 'randonnee' et 'triathlon' aux contraintes CHECK sur sport_type (séances, Strava, totaux).

ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_sport_type_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_sport_type_check
  CHECK (sport_type IN (
    'course', 'musculation', 'natation', 'velo',
    'nordic_ski', 'backcountry_ski', 'ice_skating',
    'randonnee', 'triathlon'
  ));

ALTER TABLE public.imported_activities
  DROP CONSTRAINT IF EXISTS imported_activities_sport_type_check;

ALTER TABLE public.imported_activities
  ADD CONSTRAINT imported_activities_sport_type_check
  CHECK (sport_type IN (
    'course', 'musculation', 'natation', 'velo',
    'nordic_ski', 'backcountry_ski', 'ice_skating',
    'randonnee', 'triathlon'
  ));

ALTER TABLE public.imported_activity_weekly_totals
  DROP CONSTRAINT IF EXISTS imported_activity_weekly_totals_sport_type_check;

ALTER TABLE public.imported_activity_weekly_totals
  ADD CONSTRAINT imported_activity_weekly_totals_sport_type_check
  CHECK (sport_type IN (
    'course', 'musculation', 'natation', 'velo',
    'nordic_ski', 'backcountry_ski', 'ice_skating',
    'randonnee', 'triathlon'
  ));

ALTER TABLE public.workout_weekly_totals
  DROP CONSTRAINT IF EXISTS workout_weekly_totals_sport_type_check;

ALTER TABLE public.workout_weekly_totals
  ADD CONSTRAINT workout_weekly_totals_sport_type_check
  CHECK (sport_type IN (
    'course', 'musculation', 'natation', 'velo',
    'nordic_ski', 'backcountry_ski', 'ice_skating',
    'randonnee', 'triathlon'
  ));
