-- Coach : notification e-mail à chaque nouvelle demande de coaching (défaut activé).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notify_coaching_request BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.email_notify_coaching_request IS
  'Coach uniquement : envoyer un e-mail à chaque nouvelle demande de coaching (coach_requests pending). Défaut true.';
