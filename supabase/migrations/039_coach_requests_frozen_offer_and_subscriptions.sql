-- Snapshot de l'offre dans coach_requests + table subscriptions (souscriptions actives)

-- A. Colonnes snapshot sur coach_requests
ALTER TABLE public.coach_requests
  ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.coach_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS frozen_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS frozen_title TEXT,
  ADD COLUMN IF NOT EXISTS frozen_description TEXT;

CREATE INDEX IF NOT EXISTS idx_coach_requests_offer_id ON public.coach_requests(offer_id);

COMMENT ON COLUMN public.coach_requests.offer_id IS 'Offre choisie par l''athlète au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_price IS 'Prix figé (snapshot) de l''offre au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_title IS 'Titre figé de l''offre au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_description IS 'Description figée de l''offre au moment de la demande';

-- B. Table subscriptions (une souscription par demande acceptée)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.coach_requests(id) ON DELETE CASCADE,
  frozen_price NUMERIC(10, 2),
  frozen_title TEXT,
  frozen_description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_athlete ON public.subscriptions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_coach ON public.subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

COMMENT ON TABLE public.subscriptions IS 'Souscriptions actives ou annulées ; données figées depuis coach_requests (frozen_*) à l''acceptation';

-- RLS sur subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Athlète : voir ses propres souscriptions
CREATE POLICY "subscriptions_select_athlete"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

-- Coach : voir les souscriptions de ses athlètes
CREATE POLICY "subscriptions_select_coach"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

-- Coach : insérer une souscription (à l'acceptation d'une demande)
CREATE POLICY "subscriptions_insert_coach"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (coach_id = auth.uid());

-- Coach : mettre à jour (ex. status cancelled, end_date)
CREATE POLICY "subscriptions_update_coach"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());
