-- Demandes de contact : référence MSA-YYYY-NNNNNN, persistance et RPC réservée au service_role.

CREATE TABLE public.contact_submission_counters (
  year INT PRIMARY KEY,
  last_seq BIGINT NOT NULL
);

CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  locale TEXT NOT NULL CHECK (locale IN ('fr', 'en')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  reason_key TEXT NOT NULL,
  message TEXT NOT NULL,
  email_delivered_at TIMESTAMPTZ
);

CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions (created_at DESC);

ALTER TABLE public.contact_submission_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Aucune policy : accès uniquement via service_role (contourne RLS).

CREATE OR REPLACE FUNCTION public.insert_contact_submission(
  p_user_id UUID,
  p_locale TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_reason_key TEXT,
  p_message TEXT
)
RETURNS TABLE (id UUID, reference TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y INT;
  seq BIGINT;
  ref TEXT;
  new_id UUID;
BEGIN
  IF p_locale IS NULL OR p_locale NOT IN ('fr', 'en') THEN
    RAISE EXCEPTION 'invalid locale';
  END IF;

  y := (EXTRACT(YEAR FROM (timezone('utc', now()))))::INT;

  INSERT INTO public.contact_submission_counters AS c (year, last_seq)
  VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE
  SET last_seq = contact_submission_counters.last_seq + 1
  RETURNING last_seq INTO seq;

  ref := 'MSA-' || y::TEXT || '-' || lpad(seq::TEXT, 6, '0');

  INSERT INTO public.contact_submissions (
    reference,
    user_id,
    locale,
    first_name,
    last_name,
    email,
    phone,
    reason_key,
    message
  )
  VALUES (
    ref,
    p_user_id,
    p_locale,
    p_first_name,
    p_last_name,
    p_email,
    NULLIF(p_phone, ''),
    p_reason_key,
    p_message
  )
  RETURNING contact_submissions.id INTO new_id;

  RETURN QUERY
  SELECT new_id, ref;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_contact_submission(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.insert_contact_submission(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;

COMMENT ON TABLE public.contact_submissions IS 'Messages du formulaire contact public ; écriture via service_role uniquement.';
