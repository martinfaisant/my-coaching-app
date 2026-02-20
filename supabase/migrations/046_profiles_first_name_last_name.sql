-- Remplacer full_name par first_name et last_name dans public.profiles

-- 1. Ajouter les colonnes
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Migrer les données : premier mot -> first_name, reste -> last_name
UPDATE public.profiles
SET
  first_name = CASE
    WHEN full_name IS NULL OR trim(full_name) = '' THEN NULL
    WHEN position(' ' in trim(full_name)) = 0 THEN trim(full_name)
    ELSE split_part(trim(full_name), ' ', 1)
  END,
  last_name = CASE
    WHEN full_name IS NULL OR trim(full_name) = '' THEN NULL
    WHEN position(' ' in trim(full_name)) = 0 THEN NULL
    ELSE trim(substring(trim(full_name) from position(' ' in trim(full_name)) + 1))
  END
WHERE full_name IS NOT NULL AND trim(full_name) <> '';

-- 3. Supprimer l'ancienne colonne
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
