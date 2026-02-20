-- ============================================================
-- À exécuter dans Supabase : Dashboard > SQL Editor (New query)
-- Colle tout le contenu ci-dessous et clique sur Run.
-- ============================================================

-- 1. Création de la table et des objets (migration)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'admin')),
  coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON public.profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (public.get_my_role() = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seul un administrateur peut modifier le rôle.';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_check_role_update ON public.profiles;
CREATE TRIGGER profiles_check_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_role_update();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_coach_athletes" ON public.profiles;
CREATE POLICY "profiles_select_coach_athletes"
  ON public.profiles FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (true);

-- 2. Création / mise à jour des profils pour les 3 comptes existants
-- ------------------------------------------------------------------
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email,
  CASE email
    WHEN 'sara.peregord@gmail.com' THEN 'athlete'
    WHEN 'astrid.peregord@gmail.com' THEN 'coach'
    WHEN 'martinfaisant@gmail.com' THEN 'admin'
    ELSE 'athlete'
  END
FROM auth.users
WHERE email IN ('sara.peregord@gmail.com', 'astrid.peregord@gmail.com', 'martinfaisant@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email;
