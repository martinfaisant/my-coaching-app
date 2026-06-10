-- Abonnement plateforme coach : fin de la tolérance 3 jours pour past_due / unpaid.
-- past_due et unpaid n'accordent plus coach_platform_access_granted (aligné produit mai 2026).

CREATE OR REPLACE FUNCTION public.coach_platform_access_granted(p_coach_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granted boolean;
BEGIN
  IF p_coach_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;

  SELECT
    CASE
      WHEN s.status IN ('active', 'trialing') THEN TRUE
      ELSE FALSE
    END
  INTO v_granted
  FROM public.coach_platform_subscriptions s
  WHERE s.coach_id = p_coach_id;

  RETURN coalesce(v_granted, FALSE);
END;
$$;

COMMENT ON FUNCTION public.coach_platform_access_granted(uuid) IS
  'TRUE si abonnement plateforme active ou trialing. past_due/unpaid : accès refusé. Réservé à p_coach_id = auth.uid() (ou admin).';
