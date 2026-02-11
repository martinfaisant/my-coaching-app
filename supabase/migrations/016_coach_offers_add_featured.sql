-- Ajouter le champ is_featured pour marquer une offre comme privilégiée
ALTER TABLE public.coach_offers
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Créer une contrainte unique pour s'assurer qu'un coach ne peut avoir qu'une seule offre privilégiée
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_offers_featured_unique
  ON public.coach_offers(coach_id)
  WHERE is_featured = true;
