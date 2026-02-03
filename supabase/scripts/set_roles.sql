-- À exécuter dans Supabase : Dashboard > SQL Editor
-- Attribue les rôles aux trois comptes existants.

UPDATE public.profiles SET role = 'athlete' WHERE email = 'sara.peregord@gmail.com';
UPDATE public.profiles SET role = 'coach'   WHERE email = 'astrid.peregord@gmail.com';
UPDATE public.profiles SET role = 'admin'   WHERE email = 'martinfaisant@gmail.com';
