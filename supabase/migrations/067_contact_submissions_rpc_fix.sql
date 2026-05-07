-- Ajustement RPC contact : RETURN QUERY avec alias explicites (alignement PostgREST / clients).

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
  ref_no TEXT;
  new_id UUID;
BEGIN
  IF p_locale IS NULL OR p_locale NOT IN ('fr', 'en') THEN
    RAISE EXCEPTION 'invalid locale';
  END IF;

  y := (EXTRACT(YEAR FROM (timezone('utc', now()))))::INT;

  INSERT INTO public.contact_submission_counters (year, last_seq)
  VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE
  SET last_seq = public.contact_submission_counters.last_seq + 1
  RETURNING last_seq INTO seq;

  ref_no := 'MSA-' || y::TEXT || '-' || lpad(seq::TEXT, 6, '0');

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
    ref_no,
    p_user_id,
    p_locale,
    p_first_name,
    p_last_name,
    p_email,
    NULLIF(TRIM(COALESCE(p_phone, '')), ''),
    p_reason_key,
    p_message
  )
  RETURNING contact_submissions.id INTO new_id;

  RETURN QUERY
  SELECT new_id AS id, ref_no AS reference;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_contact_submission(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.insert_contact_submission(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;
