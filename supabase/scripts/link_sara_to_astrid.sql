-- À exécuter dans Supabase : Dashboard > SQL Editor
-- Lie sara.peregord@gmail.com (athlète) à astrid.peregord@gmail.com (coach).

UPDATE public.profiles
SET coach_id = (SELECT user_id FROM public.profiles WHERE email = 'astrid.peregord@gmail.com')
WHERE email = 'sara.peregord@gmail.com';
