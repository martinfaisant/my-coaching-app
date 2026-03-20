-- Notes privées coach sur un athlète : auteur seul (coach_id) ; pas d'accès athlète.
-- Périmètre athlète aligné sur athlete_facilities (souscription active/en résiliation OU profiles.coach_id).

CREATE TABLE IF NOT EXISTS public.coach_athlete_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_athlete_notes_list
  ON public.coach_athlete_notes (athlete_id, coach_id, updated_at DESC);

COMMENT ON TABLE public.coach_athlete_notes IS
  'Notes privées : seul le coach auteur (coach_id) accède à ses lignes ; l''athlète n''a aucune policy.';

-- Immuabilité athlete_id / coach_id après insert
CREATE OR REPLACE FUNCTION public.enforce_coach_athlete_notes_immutable_keys ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.athlete_id IS DISTINCT FROM OLD.athlete_id OR NEW.coach_id IS DISTINCT FROM OLD.coach_id THEN
      RAISE EXCEPTION 'coach_athlete_notes: athlete_id et coach_id sont immuables';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS coach_athlete_notes_immutable_keys ON public.coach_athlete_notes;
CREATE TRIGGER coach_athlete_notes_immutable_keys
  BEFORE UPDATE ON public.coach_athlete_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_coach_athlete_notes_immutable_keys ();

CREATE OR REPLACE FUNCTION public.set_coach_athlete_notes_updated_at ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS coach_athlete_notes_updated_at ON public.coach_athlete_notes;
CREATE TRIGGER coach_athlete_notes_updated_at
  BEFORE UPDATE ON public.coach_athlete_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_coach_athlete_notes_updated_at ();

ALTER TABLE public.coach_athlete_notes ENABLE ROW LEVEL SECURITY;

-- Pas de policy SELECT pour l'athlète : pas d'accès.

-- Coach : uniquement ses propres notes + périmètre athlète (même EXISTS que athlete_facilities coach)
CREATE POLICY "coach_athlete_notes_select_coach"
  ON public.coach_athlete_notes
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid()
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

CREATE POLICY "coach_athlete_notes_insert_coach"
  ON public.coach_athlete_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = auth.uid()
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

CREATE POLICY "coach_athlete_notes_update_coach"
  ON public.coach_athlete_notes
  FOR UPDATE
  TO authenticated
  USING (
    coach_id = auth.uid()
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

CREATE POLICY "coach_athlete_notes_delete_coach"
  ON public.coach_athlete_notes
  FOR DELETE
  TO authenticated
  USING (
    coach_id = auth.uid()
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

CREATE POLICY "coach_athlete_notes_select_admin"
  ON public.coach_athlete_notes
  FOR SELECT
  TO authenticated
  USING (public.is_admin ());

COMMENT ON POLICY "coach_athlete_notes_select_coach" ON public.coach_athlete_notes IS
  'Coach auteur : lecture de ses notes sur un athlète dans son périmètre (souscription ou profil.coach_id).';
