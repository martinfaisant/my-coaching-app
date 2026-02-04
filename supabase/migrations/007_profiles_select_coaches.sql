-- Permettre à tout utilisateur connecté de voir les profils des coachs (pour "trouver un coach")
CREATE POLICY "profiles_select_coaches"
  ON public.profiles FOR SELECT TO authenticated
  USING (role = 'coach');
