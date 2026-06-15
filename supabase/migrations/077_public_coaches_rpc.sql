-- Lecture publique des coachs éligibles (annuaire + fiches SEO) via RPC SECURITY DEFINER.
-- Aucune policy RLS anon sur profiles/coach_offers : exposition limitée aux colonnes ci-dessous.

CREATE OR REPLACE FUNCTION public.is_coach_publicly_listable(p_coach_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = p_coach_id
      AND p.role = 'coach'
      AND trim(concat_ws(' ', nullif(trim(p.first_name), ''), nullif(trim(p.last_name), ''))) <> ''
      AND coalesce(array_length(p.coached_sports, 1), 0) > 0
      AND coalesce(array_length(p.languages, 1), 0) > 0
      AND (
        nullif(trim(coalesce(p.presentation_fr, '')), '') IS NOT NULL
        OR nullif(trim(coalesce(p.presentation_en, '')), '') IS NOT NULL
      )
      AND EXISTS (
        SELECT 1
        FROM public.coach_offers o
        WHERE o.coach_id = p.user_id
          AND o.status = 'published'
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_public_coaches()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  coached_sports text[],
  languages text[],
  presentation_fr text,
  presentation_en text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.first_name,
    p.last_name,
    p.coached_sports,
    p.languages,
    p.presentation_fr,
    p.presentation_en,
    p.avatar_url
  FROM public.profiles p
  WHERE public.is_coach_publicly_listable(p.user_id)
  ORDER BY p.last_name NULLS LAST, p.first_name NULLS LAST, p.user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_coach_offers()
RETURNS TABLE (
  id uuid,
  coach_id uuid,
  title text,
  description text,
  title_fr text,
  title_en text,
  description_fr text,
  description_en text,
  price numeric,
  price_type text,
  is_featured boolean,
  display_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.id,
    o.coach_id,
    o.title,
    o.description,
    o.title_fr,
    o.title_en,
    o.description_fr,
    o.description_en,
    o.price,
    o.price_type,
    o.is_featured,
    o.display_order
  FROM public.coach_offers o
  WHERE o.status = 'published'
    AND public.is_coach_publicly_listable(o.coach_id)
  ORDER BY o.coach_id, o.display_order;
$$;

CREATE OR REPLACE FUNCTION public.get_public_coach_profile(p_coach_id uuid)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  coached_sports text[],
  languages text[],
  presentation_fr text,
  presentation_en text,
  avatar_url text,
  offers jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.first_name,
    p.last_name,
    p.coached_sports,
    p.languages,
    p.presentation_fr,
    p.presentation_en,
    p.avatar_url,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', o.id,
            'title', o.title,
            'description', o.description,
            'title_fr', o.title_fr,
            'title_en', o.title_en,
            'description_fr', o.description_fr,
            'description_en', o.description_en,
            'price', o.price,
            'price_type', o.price_type,
            'is_featured', o.is_featured,
            'display_order', o.display_order
          )
          ORDER BY o.display_order
        )
        FROM public.coach_offers o
        WHERE o.coach_id = p.user_id
          AND o.status = 'published'
      ),
      '[]'::jsonb
    ) AS offers
  FROM public.profiles p
  WHERE p.user_id = p_coach_id
    AND public.is_coach_publicly_listable(p.user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_public_coach_sitemap_entries()
RETURNS TABLE (
  coach_id uuid,
  last_modified timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id AS coach_id,
    GREATEST(
      p.updated_at,
      COALESCE(
        (
          SELECT MAX(o.updated_at)
          FROM public.coach_offers o
          WHERE o.coach_id = p.user_id
            AND o.status = 'published'
        ),
        p.updated_at
      )
    ) AS last_modified
  FROM public.profiles p
  WHERE public.is_coach_publicly_listable(p.user_id)
  ORDER BY p.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_coach_publicly_listable(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_coaches() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_coach_offers() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_coach_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_coach_sitemap_entries() TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_coach_rating_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_coach_public_reviews(uuid) TO anon;
