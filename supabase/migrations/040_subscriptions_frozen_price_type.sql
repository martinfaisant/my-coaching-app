-- frozen_price_type sur coach_requests et subscriptions (snapshot / affichage et logique de résiliation)

-- A. coach_requests
ALTER TABLE public.coach_requests
  ADD COLUMN IF NOT EXISTS frozen_price_type TEXT
  CHECK (frozen_price_type IS NULL OR frozen_price_type IN ('free', 'one_time', 'monthly'));

COMMENT ON COLUMN public.coach_requests.frozen_price_type IS 'Type de tarification figé (snapshot) au moment de la demande ; copié dans subscriptions à l''acceptation.';

-- B. subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS frozen_price_type TEXT
  CHECK (frozen_price_type IS NULL OR frozen_price_type IN ('free', 'one_time', 'monthly'));

COMMENT ON COLUMN public.subscriptions.frozen_price_type IS 'Type de tarification (free / one_time / monthly) pour affichage et règle de résiliation (immédiate vs fin de cycle).';
