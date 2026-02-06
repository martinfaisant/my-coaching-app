-- Ajout du champ code postal pour les profils
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

COMMENT ON COLUMN public.profiles.postal_code IS 'Code postal du coach (ex: 75001)';
