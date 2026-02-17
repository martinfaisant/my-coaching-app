-- Statut published/archived dans coach_offers : une seule table pour toutes les offres

-- 1. Colonnes status et archived_at
ALTER TABLE public.coach_offers
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_status_check
  CHECK (status IN ('published', 'archived'));

COMMENT ON COLUMN public.coach_offers.status IS 'published = visibles dans les 3 slots et par les athlètes ; archived = liste en bas côté coach uniquement';
COMMENT ON COLUMN public.coach_offers.archived_at IS 'Date d''archivage (rempli quand status = archived)';

-- 2. Les lignes existantes ont déjà status = 'published' et archived_at = NULL (DEFAULT)

-- 3. Supprimer l'ancienne contrainte unique (coach_id, display_order) et le check display_order 0..2
ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_coach_id_display_order_key;

ALTER TABLE public.coach_offers
  DROP CONSTRAINT IF EXISTS coach_offers_display_order_check;

-- 4. Contrainte : pour published, display_order entre 0 et 2
ALTER TABLE public.coach_offers
  ADD CONSTRAINT coach_offers_published_display_order_check
  CHECK (status <> 'published' OR (display_order >= 0 AND display_order <= 2));

-- 5. Index unique partiel : au plus 3 offres published par coach (display_order 0,1,2)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_offers_published_display_order
  ON public.coach_offers(coach_id, display_order)
  WHERE status = 'published';

-- 6. RLS : empêcher les coaches de supprimer des offres (archivage uniquement)
DROP POLICY IF EXISTS "coach_offers_delete_own" ON public.coach_offers;

-- 7. RLS : athlètes ne voient que les offres published
DROP POLICY IF EXISTS "coach_offers_select_public" ON public.coach_offers;

CREATE POLICY "coach_offers_select_public"
  ON public.coach_offers FOR SELECT TO authenticated
  USING (
    coach_id IN (
      SELECT user_id FROM public.profiles WHERE role = 'coach'
    )
    AND status = 'published'
  );

-- 8. Migrer coach_offers_archived vers coach_offers (status = archived)
INSERT INTO public.coach_offers (
  id, coach_id, title, description,
  title_fr, title_en, description_fr, description_en,
  price, price_type, display_order, is_featured,
  created_at, updated_at, status, archived_at
)
SELECT
  id, coach_id, title, description,
  title_fr, title_en, description_fr, description_en,
  price, price_type, display_order, false,
  created_at, updated_at, 'archived'::TEXT, archived_at
FROM public.coach_offers_archived
ON CONFLICT (id) DO NOTHING;

-- 9. Supprimer la table des offres archivées (policies supprimées avec la table en CASCADE si besoin)
DROP POLICY IF EXISTS "coach_offers_archived_select_own" ON public.coach_offers_archived;
DROP POLICY IF EXISTS "coach_offers_archived_insert_own" ON public.coach_offers_archived;
DROP TABLE IF EXISTS public.coach_offers_archived;
