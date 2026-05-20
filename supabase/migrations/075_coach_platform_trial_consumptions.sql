-- Essais plateforme coach consommés, par campagne (une ligne par coach × campagne).
-- Écriture : service role (webhooks Stripe). Lecture : coach own row (RLS).

CREATE TABLE IF NOT EXISTS public.coach_platform_trial_consumptions (
  coach_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  trial_campaign_id TEXT NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_subscription_id TEXT,
  PRIMARY KEY (coach_id, trial_campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_platform_trial_consumptions_campaign
  ON public.coach_platform_trial_consumptions(trial_campaign_id);

COMMENT ON TABLE public.coach_platform_trial_consumptions IS
  'Essais plateforme coach consommés, par campagne (une ligne par coach × campagne).';

ALTER TABLE public.coach_platform_trial_consumptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_platform_trial_consumptions_select_own"
  ON public.coach_platform_trial_consumptions FOR SELECT TO authenticated
  USING (coach_id = auth.uid());
