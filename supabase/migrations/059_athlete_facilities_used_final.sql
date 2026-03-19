-- Athlète : installations utilisées (piscine / salle / stade / autre)
-- Version "etat final" : 1 seule colonne `address` (fusion street+number)
-- RLS : CRUD athlète sur ses lignes ; coach lecture via subscriptions actives/en résiliation
-- Référence i18n/validation côté app : lib/facilityHoursUtils.ts + messages facilities.validation

CREATE TABLE IF NOT EXISTS public.athlete_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  facility_type TEXT NOT NULL CHECK (facility_type IN ('piscine', 'salle', 'stade', 'autre')),
  facility_name TEXT NOT NULL,

  -- Adresse en une seule chaîne (ex: "Rue ... 12")
  address TEXT NOT NULL,
  address_postal_code TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_country TEXT NOT NULL,
  address_complement TEXT,

  -- Structuré pour l'UI heures d'ouverture (7 jours + ouvert/fermé + plages)
  opening_hours JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_facilities_athlete_created_at
  ON public.athlete_facilities(athlete_id, created_at);

-- RLS
ALTER TABLE public.athlete_facilities ENABLE ROW LEVEL SECURITY;

-- Athlète : CRUD sur ses lignes
CREATE POLICY "athlete_facilities_select_own"
  ON public.athlete_facilities FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "athlete_facilities_insert_own"
  ON public.athlete_facilities FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "athlete_facilities_update_own"
  ON public.athlete_facilities FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "athlete_facilities_delete_own"
  ON public.athlete_facilities FOR DELETE TO authenticated
  USING (athlete_id = auth.uid());

-- Coach : lecture des installations de ses athlètes via subscriptions actives / en résiliation
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
  );

-- Admin : lecture complète
CREATE POLICY "athlete_facilities_select_admin"
  ON public.athlete_facilities FOR SELECT TO authenticated
  USING (public.is_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_athlete_facilities_updated_at()
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

DROP TRIGGER IF EXISTS athlete_facilities_updated_at ON public.athlete_facilities;
CREATE TRIGGER athlete_facilities_updated_at
  BEFORE UPDATE ON public.athlete_facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_athlete_facilities_updated_at();

