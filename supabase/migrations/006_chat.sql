-- Conversations entre coach et athlète (une par couple coach/athlète)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coach_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_coach ON public.conversations(coach_id);
CREATE INDEX IF NOT EXISTS idx_conversations_athlete ON public.conversations(athlete_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);

-- Mise à jour de updated_at sur nouvelle conversation
CREATE OR REPLACE FUNCTION public.set_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER chat_messages_updated_at
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_conversation_updated_at();

-- RLS conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Athlète : voir et créer sa conversation avec son coach
CREATE POLICY "conversations_select_athlete"
  ON public.conversations FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "conversations_insert_athlete"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()
    AND coach_id IN (SELECT coach_id FROM public.profiles WHERE user_id = auth.uid() AND coach_id IS NOT NULL)
  );

-- Coach : voir et créer les conversations avec ses athlètes
CREATE POLICY "conversations_select_coach"
  ON public.conversations FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "conversations_insert_coach"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
    AND athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

-- RLS chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Lire les messages des conversations auxquelles on participe
CREATE POLICY "chat_messages_select"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE coach_id = auth.uid() OR athlete_id = auth.uid()
    )
  );

-- Envoyer un message si on est coach ou athlète de la conversation
CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE coach_id = auth.uid() OR athlete_id = auth.uid()
    )
  );
