-- Freeze titre et description en FR et EN (demande + souscription)

-- A. coach_requests : 4 colonnes i18n
ALTER TABLE public.coach_requests
  ADD COLUMN IF NOT EXISTS frozen_title_fr TEXT,
  ADD COLUMN IF NOT EXISTS frozen_title_en TEXT,
  ADD COLUMN IF NOT EXISTS frozen_description_fr TEXT,
  ADD COLUMN IF NOT EXISTS frozen_description_en TEXT;

COMMENT ON COLUMN public.coach_requests.frozen_title_fr IS 'Titre figé de l''offre en français au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_title_en IS 'Titre figé de l''offre en anglais au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_description_fr IS 'Description figée de l''offre en français au moment de la demande';
COMMENT ON COLUMN public.coach_requests.frozen_description_en IS 'Description figée de l''offre en anglais au moment de la demande';

-- B. subscriptions : 4 colonnes i18n
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS frozen_title_fr TEXT,
  ADD COLUMN IF NOT EXISTS frozen_title_en TEXT,
  ADD COLUMN IF NOT EXISTS frozen_description_fr TEXT,
  ADD COLUMN IF NOT EXISTS frozen_description_en TEXT;

COMMENT ON COLUMN public.subscriptions.frozen_title_fr IS 'Titre figé en français (copie depuis coach_requests à l''acceptation)';
COMMENT ON COLUMN public.subscriptions.frozen_title_en IS 'Titre figé en anglais (copie depuis coach_requests à l''acceptation)';
COMMENT ON COLUMN public.subscriptions.frozen_description_fr IS 'Description figée en français (copie depuis coach_requests à l''acceptation)';
COMMENT ON COLUMN public.subscriptions.frozen_description_en IS 'Description figée en anglais (copie depuis coach_requests à l''acceptation)';

-- C. Backfill : lignes existantes sans _fr/_en → copier frozen_title / frozen_description dans les deux langues
UPDATE public.coach_requests
SET
  frozen_title_fr = COALESCE(frozen_title_fr, frozen_title),
  frozen_title_en = COALESCE(frozen_title_en, frozen_title),
  frozen_description_fr = COALESCE(frozen_description_fr, frozen_description),
  frozen_description_en = COALESCE(frozen_description_en, frozen_description)
WHERE frozen_title IS NOT NULL OR frozen_description IS NOT NULL;

UPDATE public.subscriptions
SET
  frozen_title_fr = COALESCE(frozen_title_fr, frozen_title),
  frozen_title_en = COALESCE(frozen_title_en, frozen_title),
  frozen_description_fr = COALESCE(frozen_description_fr, frozen_description),
  frozen_description_en = COALESCE(frozen_description_en, frozen_description)
WHERE frozen_title IS NOT NULL OR frozen_description IS NOT NULL;
