-- Allow coach/athlete to update conversation.request_id so that when a new
-- writable request exists (e.g. new pending request after a declined one),
-- the app can point the conversation to it and allow sending messages.
-- RLS was blocking UPDATE (no policy = deny), so the request_id never changed
-- and chat_messages_insert then failed because is_chat_request_writable(old_id) was false.

CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE TO authenticated
  USING (coach_id = auth.uid() OR athlete_id = auth.uid())
  WITH CHECK (
    (coach_id = auth.uid() OR athlete_id = auth.uid())
    AND (
      request_id IS NULL
      OR public.is_chat_request_writable(request_id, coach_id, athlete_id)
    )
  );

COMMENT ON POLICY "conversations_update_participant" ON public.conversations IS
  'Participant can update conversation; request_id can only be set to a writable request (pending or accepted+active sub).';
