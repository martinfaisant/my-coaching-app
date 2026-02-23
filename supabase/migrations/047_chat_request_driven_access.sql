-- Chat: lier chaque conversation à une coach_request et distinguer lecture/écriture
-- Règles:
-- - Lecture: toujours autorisée aux participants de la conversation
-- - Écriture: autorisée seulement si:
--   * request.status = 'pending'
--   * OU request.status = 'accepted' ET subscription liée active/en résiliation

-- 1) Ajouter le lien conversation -> request
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS request_id UUID NULL
  REFERENCES public.coach_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_request_id ON public.conversations(request_id);

COMMENT ON COLUMN public.conversations.request_id IS
  'Request source qui pilote les droits d''écriture du chat (pending ou accepted + subscription active).';

-- 2) Backfill des conversations existantes
-- 2a) Priorité à la request liée à la dernière souscription du couple
UPDATE public.conversations c
SET request_id = (
  SELECT s.request_id
  FROM public.subscriptions s
  WHERE s.coach_id = c.coach_id
    AND s.athlete_id = c.athlete_id
  ORDER BY s.created_at DESC
  LIMIT 1
)
WHERE c.request_id IS NULL;

-- 2b) Sinon, prendre la request la plus récente du couple
UPDATE public.conversations c
SET request_id = (
  SELECT cr.id
  FROM public.coach_requests cr
  WHERE cr.coach_id = c.coach_id
    AND cr.athlete_id = c.athlete_id
  ORDER BY cr.created_at DESC
  LIMIT 1
)
WHERE c.request_id IS NULL;

-- 3) Helpers droits chat
CREATE OR REPLACE FUNCTION public.is_chat_request_writable(
  p_request_id UUID,
  p_coach_id UUID,
  p_athlete_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  req_status TEXT;
BEGIN
  IF p_request_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT status
  INTO req_status
  FROM public.coach_requests
  WHERE id = p_request_id
    AND coach_id = p_coach_id
    AND athlete_id = p_athlete_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF req_status = 'pending' THEN
    RETURN TRUE;
  END IF;

  IF req_status = 'accepted' THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.request_id = p_request_id
        AND s.status IN ('active', 'cancellation_scheduled')
    );
  END IF;

  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION public.is_chat_request_writable(UUID, UUID, UUID) IS
  'TRUE si la request liée permet l''envoi de messages (pending, ou accepted + subscription active/cancellation_scheduled).';

-- 4) RLS conversations: lecture conservée, insert conditionné par request writable
DROP POLICY IF EXISTS "conversations_insert_athlete" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_coach" ON public.conversations;

CREATE POLICY "conversations_insert_athlete"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    AND request_id IS NOT NULL
    AND public.is_chat_request_writable(request_id, coach_id, athlete_id)
  );

CREATE POLICY "conversations_insert_coach"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
    AND request_id IS NOT NULL
    AND public.is_chat_request_writable(request_id, coach_id, athlete_id)
  );

-- 5) RLS messages: lecture inchangée, écriture conditionnée par request writable
DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT c.id
      FROM public.conversations c
      WHERE (c.coach_id = auth.uid() OR c.athlete_id = auth.uid())
        AND public.is_chat_request_writable(c.request_id, c.coach_id, c.athlete_id)
    )
  );
