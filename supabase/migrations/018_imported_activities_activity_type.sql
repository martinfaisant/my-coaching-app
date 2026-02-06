-- Type d'activité source (ex: Strava "Ride", "Run") pour affichage et filtrage
ALTER TABLE public.imported_activities
  ADD COLUMN IF NOT EXISTS activity_type TEXT;

COMMENT ON COLUMN public.imported_activities.activity_type IS 'Type brut du service source (ex: Strava type "Ride", "Run", "VirtualRide").';
