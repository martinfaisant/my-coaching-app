-- Table des offres archivées (copie avant suppression de coach_offers)
CREATE TABLE IF NOT EXISTS public.coach_offers_archived (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  title_fr TEXT,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  price_type TEXT NOT NULL CHECK (price_type IN ('one_time', 'monthly', 'free')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coach_offers_archived_coach_id ON public.coach_offers_archived(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_offers_archived_original_id ON public.coach_offers_archived(original_id);

COMMENT ON TABLE public.coach_offers_archived IS 'Copie des offres au moment de l''archivage (avant suppression de coach_offers)';
COMMENT ON COLUMN public.coach_offers_archived.original_id IS 'Id de l''offre dans coach_offers avant suppression';

-- RLS
ALTER TABLE public.coach_offers_archived ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_offers_archived_select_own"
  ON public.coach_offers_archived FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "coach_offers_archived_insert_own"
  ON public.coach_offers_archived FOR INSERT TO authenticated
  WITH CHECK (coach_id = auth.uid());
