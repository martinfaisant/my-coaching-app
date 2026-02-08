-- Agrégats de notation par coach (moyenne + nombre d'avis) pour affichage public sur les cartes coach.
-- SECURITY DEFINER permet à tout utilisateur authentifié de voir les stats sans voir les notes individuelles.
CREATE OR REPLACE FUNCTION public.get_coach_rating_stats()
RETURNS TABLE (coach_id uuid, avg_rating numeric, review_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coach_id, round(avg(rating)::numeric, 1), count(*)::bigint
  FROM public.coach_ratings
  GROUP BY coach_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_coach_rating_stats() TO authenticated;
