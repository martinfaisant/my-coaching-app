-- Statut explicite « En résiliation » (cancellation_scheduled) + cron pour passage à cancelled
-- Référence : docs/archive/subscription-view-end/SUBSCRIPTION_CANCELLATION_SCHEDULED_DESIGN.md
--
-- Contrat applicatif après cette migration :
-- - Résiliation mensuelle (mettre fin) : UPDATE subscriptions SET status = 'cancellation_scheduled', end_date = <prochain cycle> (au lieu de garder status = 'active').
-- - Annulation de la résiliation : UPDATE subscriptions SET status = 'active', end_date = NULL WHERE status = 'cancellation_scheduled'.
-- - Affichage « En résiliation » : status = 'cancellation_scheduled' (ou status IN ('active','cancellation_scheduled') ET end_date IS NOT NULL pour couvrir le cas end_date passée non encore traitée par le cron).

-- 1. Étendre le CHECK sur status pour accepter 'cancellation_scheduled'
--    (nom de contrainte par défaut en PostgreSQL : subscriptions_status_check)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'cancelled', 'cancellation_scheduled'));

COMMENT ON COLUMN public.subscriptions.status IS 'active = en cours ; cancellation_scheduled = en résiliation (end_date future) ; cancelled = terminée';

-- 2. Migrer les lignes déjà « en résiliation » (active + end_date future) vers le nouveau statut
UPDATE public.subscriptions
SET status = 'cancellation_scheduled'
WHERE status = 'active'
  AND end_date IS NOT NULL
  AND end_date > NOW();

-- 3. Fonction appelée par le cron : passer en cancelled les souscriptions dont end_date est dépassée,
--    et remettre coach_id à null pour ces athlètes.
--    S'exécute avec les droits du propriétaire (SECURITY DEFINER) pour contourner les RLS.
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
    WHERE s.status = 'cancellation_scheduled'
      AND s.end_date IS NOT NULL
      AND s.end_date <= NOW()
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
  'Passe en cancelled les souscriptions en résiliation dont end_date est dépassée et met à jour profiles.coach_id pour ces athlètes. Appelé par pg_cron quotidiennement.';

-- 4. Planifier l'exécution quotidienne (2h00 UTC) si pg_cron est disponible.
--    Activer pg_cron dans le dashboard Supabase (Database > Extensions) si besoin.
--    Si pg_cron n'est pas disponible, planifier public.process_expired_subscription_cancellations()
--    via le dashboard Supabase Cron ou un cron externe (Edge Function, Vercel, etc.).
DO $$
BEGIN
  PERFORM cron.schedule(
    'process_expired_subscription_cancellations',
    '0 2 * * *',
    'SELECT public.process_expired_subscription_cancellations()'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron non disponible : planifier process_expired_subscription_cancellations() via le dashboard Supabase Cron ou un cron externe.';
END
$$;
