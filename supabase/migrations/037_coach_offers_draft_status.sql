-- Statut draft pour les offres : nouvelles offres en brouillon

ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_status_check;

ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_status_check
  CHECK (status IN ('draft', 'published', 'archived'));

COMMENT ON COLUMN public.coach_offers.status IS 'draft = brouillon côté coach ; published = visibles dans les 3 slots et par les athlètes ; archived = liste en bas côté coach uniquement';
