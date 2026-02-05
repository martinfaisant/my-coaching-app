-- Connexions des athlètes aux services externes (ex: Strava)
CREATE TABLE IF NOT EXISTS public.athlete_connected_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('strava')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  strava_athlete_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_athlete_connected_services_user ON public.athlete_connected_services(user_id);

-- RLS : l'athlète ne voit que ses propres connexions
ALTER TABLE public.athlete_connected_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete_connected_services_select_own"
  ON public.athlete_connected_services FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "athlete_connected_services_insert_own"
  ON public.athlete_connected_services FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athlete_connected_services_update_own"
  ON public.athlete_connected_services FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athlete_connected_services_delete_own"
  ON public.athlete_connected_services FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Activités importées depuis des services (Strava, etc.) — affichées dans le calendrier
CREATE TABLE IF NOT EXISTS public.imported_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('strava')),
  external_id TEXT NOT NULL,
  date DATE NOT NULL,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('course', 'musculation', 'natation', 'velo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_imported_activities_athlete_date ON public.imported_activities(athlete_id, date);

ALTER TABLE public.imported_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imported_activities_select_own"
  ON public.imported_activities FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "imported_activities_insert_own"
  ON public.imported_activities FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "imported_activities_update_own"
  ON public.imported_activities FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "imported_activities_delete_own"
  ON public.imported_activities FOR DELETE TO authenticated
  USING (athlete_id = auth.uid());

-- Les activités importées (source externe : Strava, etc.) sont visibles uniquement par l'athlète.
-- Le coach ne peut pas les voir (données personnelles / plateforme externe).
