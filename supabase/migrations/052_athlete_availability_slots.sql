-- Table des créneaux disponibilité / indisponibilité (athlète)
-- Une ligne = un jour ; la récurrence est dépliée à la création (plusieurs lignes).
CREATE TABLE IF NOT EXISTS public.athlete_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('available', 'unavailable')),
  start_time TIME,
  end_time TIME,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_availability_slots_athlete_date
  ON public.athlete_availability_slots(athlete_id, date);

-- RLS
ALTER TABLE public.athlete_availability_slots ENABLE ROW LEVEL SECURITY;

-- Athlète : tout sur ses propres créneaux
CREATE POLICY "athlete_availability_slots_select_athlete"
  ON public.athlete_availability_slots FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "athlete_availability_slots_insert_athlete"
  ON public.athlete_availability_slots FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "athlete_availability_slots_update_athlete"
  ON public.athlete_availability_slots FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "athlete_availability_slots_delete_athlete"
  ON public.athlete_availability_slots FOR DELETE TO authenticated
  USING (athlete_id = auth.uid());

-- Coach : lecture seule des créneaux de ses athlètes
CREATE POLICY "athlete_availability_slots_select_coach"
  ON public.athlete_availability_slots FOR SELECT TO authenticated
  USING (
    athlete_id IN (SELECT user_id FROM public.profiles WHERE coach_id = auth.uid())
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_athlete_availability_slots_updated_at()
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

DROP TRIGGER IF EXISTS athlete_availability_slots_updated_at ON public.athlete_availability_slots;
CREATE TRIGGER athlete_availability_slots_updated_at
  BEFORE UPDATE ON public.athlete_availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.set_athlete_availability_slots_updated_at();
