-- Permettre prix et récurrence vides pour les brouillons (pas de valeur par défaut à l'enregistrement)
ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_price_type_check;

ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_price_type_check
  CHECK (price_type IS NULL OR price_type IN ('one_time', 'monthly', 'free'));

ALTER TABLE public.coach_offers
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN price_type DROP NOT NULL;

ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_price_check;

ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_price_check
  CHECK (price IS NULL OR price >= 0);

COMMENT ON COLUMN public.coach_offers.price IS 'Prix (NULL = non renseigné en brouillon)';
COMMENT ON COLUMN public.coach_offers.price_type IS 'Récurrence: one_time, monthly, free (NULL = non renseigné en brouillon)';
