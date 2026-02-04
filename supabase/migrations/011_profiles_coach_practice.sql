-- Champs "Ma pratique" pour les coachs (sports coachés, langues, présentation)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coached_sports TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS presentation TEXT;

COMMENT ON COLUMN public.profiles.coached_sports IS 'Sports coachés: course_route, trail, triathlon, velo';
COMMENT ON COLUMN public.profiles.languages IS 'Codes langue (fr, en, es, ...)';
COMMENT ON COLUMN public.profiles.presentation IS 'Texte libre de présentation du coach';
