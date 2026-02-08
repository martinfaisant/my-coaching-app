-- Sport(s) pratiqué(s) par l'athlète (course, velo, natation, musculation)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS practiced_sports TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.practiced_sports IS 'Sports pratiqués par l''athlète: course, velo, natation, musculation';
