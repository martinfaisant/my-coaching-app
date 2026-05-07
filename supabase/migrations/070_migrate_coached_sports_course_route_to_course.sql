-- Migration data: remplacer 'course_route' par 'course' dans profiles.coached_sports.

UPDATE public.profiles
SET coached_sports = (
  SELECT array_agg(DISTINCT CASE WHEN s = 'course_route' THEN 'course' ELSE s END ORDER BY CASE WHEN s = 'course_route' THEN 'course' ELSE s END)
  FROM unnest(coalesce(public.profiles.coached_sports, '{}'::text[])) AS s
)
WHERE coached_sports IS NOT NULL
  AND coached_sports @> ARRAY['course_route']::text[];

