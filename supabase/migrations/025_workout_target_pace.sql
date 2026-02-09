-- Ajout du champ vitesse (allure) pour calculer automatiquement durée ou distance
-- Course : min/km, Vélo : km/h, Natation : min/100m
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS target_pace NUMERIC(8, 2) NULL;

COMMENT ON COLUMN public.workouts.target_pace IS 'Vitesse/allure pour calcul automatique. Course: min/km, Vélo: km/h, Natation: min/100m';
