-- Clôture des souscriptions à échéance : RPC invocable par service_role + prise en charge des
-- lignes encore « active » avec end_date passée (état bloqué si pg_cron n’a jamais tourné).
--
-- App : route /api/cron/process-expired-subscriptions (Vercel Cron ou appel HTTP avec CRON_SECRET).

CREATE OR REPLACE FUNCTION public.process_expired_subscription_cancellations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH to_process AS (
    SELECT s.id, s.athlete_id
    FROM public.subscriptions s
    WHERE s.end_date IS NOT NULL
      AND s.end_date <= NOW()
      AND s.status IN ('cancellation_scheduled', 'active')
  ),
  updated AS (
    UPDATE public.subscriptions s
    SET status = 'cancelled', end_date = COALESCE(s.end_date, NOW())
    FROM to_process t
    WHERE s.id = t.id
    RETURNING s.athlete_id
  )
  UPDATE public.profiles p
  SET coach_id = NULL
  FROM updated u
  WHERE p.user_id = u.athlete_id;
END;
$$;

COMMENT ON FUNCTION public.process_expired_subscription_cancellations() IS
  'Passe en cancelled les souscriptions dont end_date est dépassée (cancellation_scheduled ou active avec end_date) et met coach_id à NULL. Appelée par pg_cron et/ou par l’app (RPC service_role).';

GRANT EXECUTE ON FUNCTION public.process_expired_subscription_cancellations() TO service_role;
