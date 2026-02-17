-- Empêcher les coaches de supprimer des offres (archivage uniquement)
DROP POLICY IF EXISTS "coach_offers_delete_own" ON public.coach_offers;
