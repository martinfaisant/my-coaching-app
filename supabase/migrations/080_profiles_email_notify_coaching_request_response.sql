-- Athlète : notification e-mail quand un coach accepte ou refuse une demande (défaut activé).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notify_coaching_request_response BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.email_notify_coaching_request_response IS
  'Athlète uniquement : envoyer un e-mail quand un coach accepte ou refuse sa demande. Défaut true.';
