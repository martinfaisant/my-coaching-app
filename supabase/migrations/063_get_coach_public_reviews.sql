-- Liste des avis publics pour un coach (recherche athlète).
-- Sans athlete_id : les identités des noteurs ne sont pas exposées.
-- SECURITY DEFINER : même principe que get_coach_rating_stats (RLS ne permet pas aux athlètes de lire les lignes des autres).
CREATE OR REPLACE FUNCTION public.get_coach_public_reviews(p_coach_id uuid)
RETURNS TABLE (
  id uuid,
  rating integer,
  comment text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT cr.id, cr.rating, cr.comment, cr.created_at
  FROM public.coach_ratings cr
  WHERE cr.coach_id = p_coach_id
  ORDER BY cr.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_coach_public_reviews(uuid) TO authenticated;
