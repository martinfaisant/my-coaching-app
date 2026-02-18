-- Langue d'affichage préférée de l'utilisateur (utilisée sur tout le site quand il est connecté).
-- Initialisée à la création du compte selon la langue de la page d'inscription ; NULL = URL / navigateur.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_locale TEXT
  CHECK (preferred_locale IS NULL OR preferred_locale IN ('fr', 'en'));

COMMENT ON COLUMN public.profiles.preferred_locale IS 'Locale préférée pour l''affichage du site (fr/en). Si définie, l''utilisateur est redirigé vers cette langue sur les pages protégées.';
