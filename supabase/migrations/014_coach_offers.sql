-- Table des offres des coaches
CREATE TABLE IF NOT EXISTS public.coach_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  price_type TEXT NOT NULL CHECK (price_type IN ('one_time', 'monthly')),
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0 AND display_order <= 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coach_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_coach_offers_coach_id ON public.coach_offers(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_offers_display_order ON public.coach_offers(coach_id, display_order);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_coach_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_offers_updated_at ON public.coach_offers;
CREATE TRIGGER coach_offers_updated_at
  BEFORE UPDATE ON public.coach_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coach_offers_updated_at();

-- RLS
ALTER TABLE public.coach_offers ENABLE ROW LEVEL SECURITY;

-- Le coach peut voir et gérer ses propres offres
CREATE POLICY "coach_offers_select_own"
  ON public.coach_offers FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "coach_offers_insert_own"
  ON public.coach_offers FOR INSERT TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "coach_offers_update_own"
  ON public.coach_offers FOR UPDATE TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "coach_offers_delete_own"
  ON public.coach_offers FOR DELETE TO authenticated
  USING (coach_id = auth.uid());

-- Les athlètes peuvent voir les offres des coaches
CREATE POLICY "coach_offers_select_public"
  ON public.coach_offers FOR SELECT TO authenticated
  USING (
    coach_id IN (
      SELECT user_id FROM public.profiles WHERE role = 'coach'
    )
  );
