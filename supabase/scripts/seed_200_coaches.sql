-- ============================================================
-- Script de seed : 201 coachs (coach@ + coach1@ à coach200@) avec profils variés
-- À exécuter dans Supabase : Dashboard > SQL Editor
-- OU en local : psql ... -f supabase/scripts/seed_200_coaches.sql
--
-- Mots de passe : tous les coachs ont le mot de passe "CoachDev2025!"
-- Emails : coach@dev.local, coach1@dev.local ... coach200@dev.local
--
-- Note : Exécuter en tant qu'admin/postgres pour contourner les RLS.
--        Pour ré-exécuter : supprimer d'abord les coachs existants.
-- ============================================================

-- Supprimer les coachs seed existants (permet de ré-exécuter le script)
-- L'ordre respecte les FK : coach_offers → profiles → auth.identities → auth.users
DELETE FROM public.coach_offers WHERE coach_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'coach%@dev.local');
DELETE FROM public.profiles WHERE email LIKE 'coach%@dev.local';
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'coach%@dev.local');
DELETE FROM auth.users WHERE email LIKE 'coach%@dev.local';

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  i INT;
  v_user_id UUID;
  v_email TEXT;
  v_full_name TEXT;
  v_coached_sports TEXT[];
  v_languages TEXT[];
  v_presentation TEXT;
  v_postal_code TEXT;
  v_first_names TEXT[] := ARRAY[
    'Marie','Jean','Pierre','Sophie','Thomas','Julie','Nicolas','Camille','Lucas','Emma',
    'Hugo','Léa','Louis','Chloé','Arthur','Manon','Nathan','Sarah','Raphaël','Laura',
    'Jules','Pauline','Gabriel','Marie','Léon','Clara','Adam','Lucie','Lucas','Jade',
    'Ethan','Zoé','Noah','Lola','Enzo','Anna','Théo','Alice','Antoine','Charlotte'
  ];
  v_last_names TEXT[] := ARRAY[
    'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
    'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier',
    'Morel','Girard','Bonnet','Dupont','Lambert','Fontaine','Rousseau','Blanc','Garnier','Faure',
    'Mercier','Robin','Clement','Morin','Gauthier','Perrin','Dumont','Lemaire','Renaud','Chevalier'
  ];
  v_sport_combo_idx INT;
  v_lang_combo_idx INT;
  v_postal_codes TEXT[] := ARRAY[
    '75001','75008','69001','13001','33000','31000','59000','44000','67000','06000',
    '35000','29200','64000','51000','21000','72000','35000','37000','45000','80000'
  ];
  v_presentations_short TEXT[] := ARRAY[
    'Coach passionné, accompagnement personnalisé.',
    'Spécialiste trail et course en nature.',
    'Triathlète, préparation complète.',
    'Vélo route et VTT.',
    'Objectifs clairs, résultats mesurables.',
    'Expérience en ultra-trail.',
    'Débutants bienvenus.'
  ];
  v_presentations_long TEXT[] := ARRAY[
    'Coach sportif depuis 10 ans, j''accompagne des athlètes de tous niveaux vers leurs objectifs. Que ce soit une première course ou un marathon, je m''adapte à votre profil.',
    'Spécialisé en trail et course en montagne, je propose des plans adaptés au dénivelé et à vos capacités. Préparation complète incluant renforcement.',
    'Triathlète professionnel passé à la coaching, je conçois des plans équilibrés pour les 3 disciplines. Suivi régulier et ajustements en fonction de vos progrès.',
    'Ancien cycliste, je coach en vélo route et VTT. Sorties hebdomadaires et plans structurés pour progresser efficacement.',
    'Mon approche : écoute, personnalisation et progression durable. Pas de recette miracle, du travail adapté à votre vie.'
  ];
BEGIN
  -- coach@dev.local : compte principal dev, varié comme les autres (sport combo 9, lang combo 2)
  v_user_id := gen_random_uuid();
  v_email := 'coach@dev.local';
  v_full_name := v_first_names[1] || ' ' || v_last_names[1];
  v_coached_sports := ARRAY['course_route','trail','velo'];
  v_languages := ARRAY['fr','en'];
  v_presentation := v_presentations_long[1];
  v_postal_code := v_postal_codes[1];
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', v_email, crypt('CoachDev2025!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', v_full_name), NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', v_email), 'email', NOW(), NOW(), NOW());
  INSERT INTO public.profiles (user_id, email, full_name, role, coach_id, coached_sports, languages, presentation, postal_code, created_at, updated_at)
  VALUES (v_user_id, v_email, v_full_name, 'coach', NULL, v_coached_sports, v_languages, v_presentation, v_postal_code, NOW(), NOW());

  FOR i IN 1..200 LOOP
    v_user_id := gen_random_uuid();
    v_email := 'coach' || i || '@dev.local';
    v_full_name := v_first_names[1 + (i-1) % array_length(v_first_names, 1)] || ' ' || v_last_names[1 + (i-1) % array_length(v_last_names, 1)];
    v_sport_combo_idx := 1 + (i-1) % 12;
    v_lang_combo_idx := 1 + (i-1) % 10;
    CASE v_sport_combo_idx
      WHEN 1 THEN v_coached_sports := ARRAY['course_route'];
      WHEN 2 THEN v_coached_sports := ARRAY['velo'];
      WHEN 3 THEN v_coached_sports := ARRAY['course_route','trail'];
      WHEN 4 THEN v_coached_sports := ARRAY['course_route','velo'];
      WHEN 5 THEN v_coached_sports := ARRAY['trail'];
      WHEN 6 THEN v_coached_sports := ARRAY['triathlon'];
      WHEN 7 THEN v_coached_sports := ARRAY['course_route','triathlon'];
      WHEN 8 THEN v_coached_sports := ARRAY['velo','triathlon'];
      WHEN 9 THEN v_coached_sports := ARRAY['course_route','trail','velo'];
      WHEN 10 THEN v_coached_sports := ARRAY['course_route','trail','triathlon'];
      WHEN 11 THEN v_coached_sports := ARRAY['velo','trail'];
      ELSE v_coached_sports := ARRAY['course_route','velo','triathlon'];
    END CASE;
    CASE v_lang_combo_idx
      WHEN 1 THEN v_languages := ARRAY['fr'];
      WHEN 2 THEN v_languages := ARRAY['fr','en'];
      WHEN 3 THEN v_languages := ARRAY['fr','en','es'];
      WHEN 4 THEN v_languages := ARRAY['en'];
      WHEN 5 THEN v_languages := ARRAY['fr','es'];
      WHEN 6 THEN v_languages := ARRAY['fr','en','de'];
      WHEN 7 THEN v_languages := ARRAY['fr','en','it'];
      WHEN 8 THEN v_languages := ARRAY['fr','en','es','de'];
      WHEN 9 THEN v_languages := ARRAY['fr','pt'];
      ELSE v_languages := ARRAY['en','es'];
    END CASE;
    v_postal_code := v_postal_codes[1 + (i-1) % array_length(v_postal_codes, 1)];

    IF (i % 3) = 0 THEN
      v_presentation := v_presentations_long[1 + (i-1) % array_length(v_presentations_long, 1)];
    ELSE
      v_presentation := v_presentations_short[1 + (i-1) % array_length(v_presentations_short, 1)];
    END IF;

    -- 1. auth.users
    -- Les colonnes confirmation_token, email_change, email_change_token_new, recovery_token
    -- doivent être '' (pas NULL) pour que la connexion fonctionne (cf. supabase/auth#1940)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt('CoachDev2025!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', v_full_name),
      NOW(),
      NOW(),
      '', '', '', ''
    );

    -- 2. auth.identities
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    -- 3. public.profiles (coached_sports et languages pour chaque coach)
    INSERT INTO public.profiles (
      user_id, email, full_name, role, coach_id, coached_sports, languages, presentation, postal_code, created_at, updated_at
    ) VALUES (
      v_user_id,
      v_email,
      v_full_name,
      'coach',
      NULL,
      v_coached_sports,
      v_languages,
      v_presentation,
      v_postal_code,
      NOW(),
      NOW()
    );
  END LOOP;

  RAISE NOTICE '201 coachs créés (coach@ + coach1-200). Mot de passe : CoachDev2025!';
END $$;

-- Optionnel : ajouter des offres pour 100 coachs (1 offre chacun)
INSERT INTO public.coach_offers (coach_id, title, description, price, price_type, display_order, is_featured, created_at, updated_at)
SELECT
  p.user_id,
  CASE (p.rn - 1) % 5
    WHEN 0 THEN 'Accompagnement Premium'
    WHEN 1 THEN 'Suivi mensuel'
    WHEN 2 THEN 'Plan personnalisé'
    WHEN 3 THEN 'Préparation objectif'
    ELSE 'Première consultation'
  END,
  'Plan adapté à vos objectifs et votre niveau.',
  CASE (p.rn - 1) % 4 WHEN 0 THEN 0 WHEN 1 THEN 49 WHEN 2 THEN 79 ELSE 99 END,
  CASE (p.rn - 1) % 4 WHEN 0 THEN 'free'::TEXT WHEN 1 THEN 'monthly' ELSE 'one_time' END,
  0,
  p.rn <= 20,
  NOW(),
  NOW()
FROM (
  SELECT user_id, row_number() OVER (ORDER BY email) AS rn
  FROM public.profiles
  WHERE role = 'coach' AND email LIKE 'coach%@dev.local'
  LIMIT 100
) p;
