-- Miroir Stripe : fin programmée (cancel_at_period_end / cancel_at) pour la tuile Mon abonnement.

ALTER TABLE public.coach_platform_subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.coach_platform_subscriptions.cancel_at_period_end IS
  'TRUE si le coach a demandé l''arrêt au prochain renouvellement (Stripe cancel_at_period_end).';
COMMENT ON COLUMN public.coach_platform_subscriptions.cancel_at IS
  'Date effective de fin d''abonnement programmée (Stripe cancel_at), si présente.';
