-- Titre et description des offres en français et anglais (alignés sur la langue d'affichage)
ALTER TABLE public.coach_offers
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

COMMENT ON COLUMN public.coach_offers.title_fr IS 'Titre de l''offre en français';
COMMENT ON COLUMN public.coach_offers.title_en IS 'Titre de l''offre en anglais';
COMMENT ON COLUMN public.coach_offers.description_fr IS 'Description et avantages en français';
COMMENT ON COLUMN public.coach_offers.description_en IS 'Description et avantages en anglais';

-- Migrer l'existant vers les colonnes FR
UPDATE public.coach_offers
SET
  title_fr = COALESCE(NULLIF(TRIM(title), ''), title_fr),
  description_fr = COALESCE(NULLIF(TRIM(description), ''), description_fr)
WHERE title IS NOT NULL OR description IS NOT NULL;
