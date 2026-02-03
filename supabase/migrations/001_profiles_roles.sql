-- À exécuter dans le SQL Editor du projet Supabase (Dashboard > SQL Editor).
-- Table des profils avec rôles (Athlete, Coach, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'admin')),
  coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes coach -> athletes
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON public.profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Fonction : retourne le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Fonction : vrai si l'utilisateur connecté est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (public.get_my_role() = 'admin');
$$;

-- Empêcher un non-admin de modifier le champ role
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

CREATE TRIGGER profiles_check_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_role_update();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lecture : soi-même, ou ses athlètes (coach), ou tout (admin)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "profiles_select_coach_athletes"
  ON public.profiles FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- Insertion : uniquement son propre profil (user_id = auth.uid())
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Mise à jour : soi-même ou admin (le trigger bloque le changement de rôle pour les non-admins)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (true);

-- Commentaire : les admins voient toutes les lignes grâce à profiles_select_admin.
-- Un coach voit en plus les lignes où coach_id = auth.uid().
