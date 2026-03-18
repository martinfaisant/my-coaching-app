-- Volumes hebdomadaires : volume actuel (heures/sem.) pour l'athlète
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_current_hours NUMERIC(5,2);

COMMENT ON COLUMN public.profiles.weekly_current_hours IS 'Volume horaire actuel par semaine (heures), pour l''athlète (affichage « Volume actuel »).';
