-- Ajouter le type de prix "free" (gratuit) aux offres des coaches
ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_price_type_check;

ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_price_type_check
  CHECK (price_type IN ('one_time', 'monthly', 'free'));

-- Mettre à jour les offres existantes avec price = 0 pour qu'elles soient de type 'free'
UPDATE public.coach_offers
SET price_type = 'free', price = 0
WHERE price = 0 AND price_type IN ('one_time', 'monthly');
