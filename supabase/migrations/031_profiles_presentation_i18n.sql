-- Description du coach en français et en anglais (alignée sur la langue d'affichage)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS presentation_fr TEXT,
  ADD COLUMN IF NOT EXISTS presentation_en TEXT;

COMMENT ON COLUMN public.profiles.presentation_fr IS 'Présentation du coach en français';
COMMENT ON COLUMN public.profiles.presentation_en IS 'Présentation du coach en anglais';

-- Migrer l'existant : l'ancienne colonne presentation devient presentation_fr
UPDATE public.profiles
SET presentation_fr = presentation
WHERE role = 'coach' AND presentation IS NOT NULL AND presentation <> '' AND (presentation_fr IS NULL OR presentation_fr = '');
