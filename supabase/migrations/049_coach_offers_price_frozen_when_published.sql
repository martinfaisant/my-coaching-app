-- Bloquer la modification de price et price_type lorsque l'offre est publiée
-- (règle métier : prix figé après publication, cohérent avec frozen_* sur coach_requests/subscriptions)

CREATE OR REPLACE FUNCTION public.coach_offers_prevent_price_change_when_published()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'published' THEN
    IF NEW.price IS DISTINCT FROM OLD.price OR NEW.price_type IS DISTINCT FROM OLD.price_type THEN
      RAISE EXCEPTION 'coach_offers_price_frozen_when_published'
        USING HINT = 'price and price_type cannot be changed when offer status is published';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS coach_offers_prevent_price_change_when_published ON public.coach_offers;
CREATE TRIGGER coach_offers_prevent_price_change_when_published
  BEFORE UPDATE ON public.coach_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.coach_offers_prevent_price_change_when_published();

COMMENT ON FUNCTION public.coach_offers_prevent_price_change_when_published() IS
  'Refuse toute modification de price/price_type sur coach_offers lorsque status = published (prix figé après publication).';
