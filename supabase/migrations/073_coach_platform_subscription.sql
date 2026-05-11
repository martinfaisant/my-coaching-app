-- Abonnement plateforme coach (Stripe) : état en base + fonction d'accès (tolérance 3 jours past_due/unpaid).
-- Garde RLS : les policies coach vers données athlètes exigent coach_platform_access_granted(auth.uid()).

CREATE TABLE IF NOT EXISTS public.coach_platform_subscriptions (
  coach_id UUID PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_platform_subscriptions_stripe_sub
  ON public.coach_platform_subscriptions(stripe_subscription_id);

COMMENT ON TABLE public.coach_platform_subscriptions IS
  'Abonnement Stripe coach → plateforme. Mise à jour par webhooks (service role). Statuts alignés sur Stripe (active, trialing, past_due, canceled, unpaid, …).';

ALTER TABLE public.coach_platform_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_platform_subscriptions_select_own"
  ON public.coach_platform_subscriptions FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

-- Fonction : true si le coach peut consulter les données athlètes / chatter.
-- Tolérance 3 jours après current_period_end (ou updated_at) pour past_due / unpaid.
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
      WHEN s.status IN ('past_due', 'unpaid')
        AND now() < coalesce(s.current_period_end, s.updated_at) + interval '3 days'
        THEN TRUE
      ELSE FALSE
    END
  INTO v_granted
  FROM public.coach_platform_subscriptions s
  WHERE s.coach_id = p_coach_id;

  RETURN coalesce(v_granted, FALSE);
END;
$$;

COMMENT ON FUNCTION public.coach_platform_access_granted(uuid) IS
  'TRUE si abonnement plateforme actif ou en tolérance (3 jours) pour past_due/unpaid. Réservé à p_coach_id = auth.uid() (ou admin).';

GRANT EXECUTE ON FUNCTION public.coach_platform_access_granted(uuid) TO authenticated;

-- Chat : le coach doit avoir un abonnement plateforme pour envoyer (y compris demande pending).
CREATE OR REPLACE FUNCTION public.is_chat_message_send_allowed(
  p_request_id uuid,
  p_coach_id uuid,
  p_athlete_id uuid,
  p_sender_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF p_sender_id = p_coach_id THEN
    IF NOT public.coach_platform_access_granted(p_coach_id) THEN
      RETURN FALSE;
    END IF;
  END IF;
  RETURN public.is_chat_request_writable(p_request_id, p_coach_id, p_athlete_id);
END;
$$;

COMMENT ON FUNCTION public.is_chat_message_send_allowed(uuid, uuid, uuid, uuid) IS
  'TRUE si l''envoyeur peut écrire : coach exige abonnement plateforme + is_chat_request_writable ; athlète inchangé.';

-- --- Policies coach existantes : ajout AND coach_platform_access_granted(auth.uid()) ---

DROP POLICY IF EXISTS "workouts_select_coach" ON public.workouts;
CREATE POLICY "workouts_select_coach"
  ON public.workouts FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "workouts_insert_coach" ON public.workouts;
CREATE POLICY "workouts_insert_coach"
  ON public.workouts FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "workouts_update_coach" ON public.workouts;
CREATE POLICY "workouts_update_coach"
  ON public.workouts FOR UPDATE TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  )
  WITH CHECK (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "workouts_delete_coach" ON public.workouts;
CREATE POLICY "workouts_delete_coach"
  ON public.workouts FOR DELETE TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "goals_select_coach" ON public.goals;
CREATE POLICY "goals_select_coach"
  ON public.goals FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

-- Lecture objectifs « demande en attente » : sans abonnement plateforme (refus éclairé).
DROP POLICY IF EXISTS "goals_select_coach_pending" ON public.goals;
CREATE POLICY "goals_select_coach_pending"
  ON public.goals FOR SELECT TO authenticated
  USING (
    athlete_id IN (
      SELECT cr.athlete_id
      FROM public.coach_requests cr
      WHERE cr.coach_id = auth.uid()
        AND cr.status = 'pending'
    )
  );

DROP POLICY IF EXISTS "athlete_availability_slots_select_coach" ON public.athlete_availability_slots;
CREATE POLICY "athlete_availability_slots_select_coach"
  ON public.athlete_availability_slots FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "imported_activity_weekly_totals_select_coach_athletes" ON public.imported_activity_weekly_totals;
CREATE POLICY "imported_activity_weekly_totals_select_coach_athletes"
  ON public.imported_activity_weekly_totals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = imported_activity_weekly_totals.athlete_id
        AND p.coach_id = auth.uid()
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "workout_weekly_totals_select_coach_athletes" ON public.workout_weekly_totals;
CREATE POLICY "workout_weekly_totals_select_coach_athletes"
  ON public.workout_weekly_totals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = workout_weekly_totals.athlete_id
        AND p.coach_id = auth.uid()
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "athlete_facilities_select_coach_subscriptions" ON public.athlete_facilities;
CREATE POLICY "athlete_facilities_select_coach_subscriptions"
  ON public.athlete_facilities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.athlete_id = athlete_facilities.athlete_id
        AND s.coach_id = auth.uid()
        AND s.status IN ('active', 'cancellation_scheduled')
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "athlete_facilities_select_coach_profile" ON public.athlete_facilities;
CREATE POLICY "athlete_facilities_select_coach_profile"
  ON public.athlete_facilities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = athlete_facilities.athlete_id
        AND p.coach_id = auth.uid()
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "athlete_facilities_update_coach" ON public.athlete_facilities;
CREATE POLICY "athlete_facilities_update_coach"
  ON public.athlete_facilities FOR UPDATE TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = athlete_facilities.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = athlete_facilities.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
    AND public.coach_platform_access_granted(auth.uid())
  )
  WITH CHECK (
    (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = athlete_facilities.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = athlete_facilities.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "athlete_facilities_delete_coach" ON public.athlete_facilities;
CREATE POLICY "athlete_facilities_delete_coach"
  ON public.athlete_facilities FOR DELETE TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = athlete_facilities.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = athlete_facilities.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "coach_athlete_notes_select_coach" ON public.coach_athlete_notes;
CREATE POLICY "coach_athlete_notes_select_coach"
  ON public.coach_athlete_notes FOR SELECT TO authenticated
  USING (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
    AND (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = coach_athlete_notes.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = coach_athlete_notes.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "coach_athlete_notes_insert_coach" ON public.coach_athlete_notes;
CREATE POLICY "coach_athlete_notes_insert_coach"
  ON public.coach_athlete_notes FOR INSERT TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
    AND (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = coach_athlete_notes.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = coach_athlete_notes.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "coach_athlete_notes_update_coach" ON public.coach_athlete_notes;
CREATE POLICY "coach_athlete_notes_update_coach"
  ON public.coach_athlete_notes FOR UPDATE TO authenticated
  USING (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
    AND (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = coach_athlete_notes.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = coach_athlete_notes.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
    AND (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = coach_athlete_notes.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = coach_athlete_notes.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "coach_athlete_notes_delete_coach" ON public.coach_athlete_notes;
CREATE POLICY "coach_athlete_notes_delete_coach"
  ON public.coach_athlete_notes FOR DELETE TO authenticated
  USING (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
    AND (
      EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.athlete_id = coach_athlete_notes.athlete_id
          AND s.coach_id = auth.uid()
          AND s.status IN ('active', 'cancellation_scheduled')
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = coach_athlete_notes.athlete_id
          AND p.coach_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "subscriptions_select_coach" ON public.subscriptions;
CREATE POLICY "subscriptions_select_coach"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "conversations_select_coach" ON public.conversations;
CREATE POLICY "conversations_select_coach"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    coach_id = auth.uid()
    AND public.coach_platform_access_granted(auth.uid())
  );

DROP POLICY IF EXISTS "conversations_insert_athlete" ON public.conversations;
CREATE POLICY "conversations_insert_athlete"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    AND request_id IS NOT NULL
    AND public.is_chat_message_send_allowed(request_id, coach_id, athlete_id, auth.uid())
  );

DROP POLICY IF EXISTS "conversations_insert_coach" ON public.conversations;
CREATE POLICY "conversations_insert_coach"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
    AND request_id IS NOT NULL
    AND public.is_chat_message_send_allowed(request_id, coach_id, athlete_id, auth.uid())
  );

DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT c.id
      FROM public.conversations c
      WHERE (c.coach_id = auth.uid() OR c.athlete_id = auth.uid())
        AND public.is_chat_message_send_allowed(c.request_id, c.coach_id, c.athlete_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "conversations_update_participant" ON public.conversations;
CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE TO authenticated
  USING (coach_id = auth.uid() OR athlete_id = auth.uid())
  WITH CHECK (
    (coach_id = auth.uid() OR athlete_id = auth.uid())
    AND (
      request_id IS NULL
      OR public.is_chat_request_writable(request_id, coach_id, athlete_id)
    )
    AND (
      coach_id IS DISTINCT FROM auth.uid()
      OR public.coach_platform_access_granted(auth.uid())
    )
  );
