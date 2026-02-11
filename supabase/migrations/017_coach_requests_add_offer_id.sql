-- Ajouter le champ offer_id pour lier une demande à une offre spécifique
ALTER TABLE public.coach_requests
  ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.coach_offers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_coach_requests_offer_id ON public.coach_requests(offer_id);
