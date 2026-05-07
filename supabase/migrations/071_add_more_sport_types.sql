/*
  Ajout de nouveaux sport_type (workouts + activités importées + totaux hebdo).
  Aligné avec le pattern des migrations 068/069.
*/

-- public.workouts
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_sport_type_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_sport_type_check
  CHECK (sport_type IN (
    'course',
    'trail',
    'musculation',
    'natation',
    'velo',
    'nordic_ski',
    'backcountry_ski',
    'ice_skating',
    'randonnee',
    'triathlon',
    'escalade',
    'meditation',
    'canot',
    'surf',
    'golf',
    'yoga'
  ));

-- public.imported_activities
ALTER TABLE public.imported_activities
  DROP CONSTRAINT IF EXISTS imported_activities_sport_type_check;

ALTER TABLE public.imported_activities
  ADD CONSTRAINT imported_activities_sport_type_check
  CHECK (sport_type IN (
    'course',
    'trail',
    'musculation',
    'natation',
    'velo',
    'nordic_ski',
    'backcountry_ski',
    'ice_skating',
    'randonnee',
    'triathlon',
    'escalade',
    'meditation',
    'canot',
    'surf',
    'golf',
    'yoga'
  ));

-- public.imported_activity_weekly_totals
ALTER TABLE public.imported_activity_weekly_totals
  DROP CONSTRAINT IF EXISTS imported_activity_weekly_totals_sport_type_check;

ALTER TABLE public.imported_activity_weekly_totals
  ADD CONSTRAINT imported_activity_weekly_totals_sport_type_check
  CHECK (sport_type IN (
    'course',
    'trail',
    'musculation',
    'natation',
    'velo',
    'nordic_ski',
    'backcountry_ski',
    'ice_skating',
    'randonnee',
    'triathlon',
    'escalade',
    'meditation',
    'canot',
    'surf',
    'golf',
    'yoga'
  ));

-- public.workout_weekly_totals
ALTER TABLE public.workout_weekly_totals
  DROP CONSTRAINT IF EXISTS workout_weekly_totals_sport_type_check;

ALTER TABLE public.workout_weekly_totals
  ADD CONSTRAINT workout_weekly_totals_sport_type_check
  CHECK (sport_type IN (
    'course',
    'trail',
    'musculation',
    'natation',
    'velo',
    'nordic_ski',
    'backcountry_ski',
    'ice_skating',
    'randonnee',
    'triathlon',
    'escalade',
    'meditation',
    'canot',
    'surf',
    'golf',
    'yoga'
  ));

