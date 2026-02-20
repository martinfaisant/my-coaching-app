-- Enregistrer qui a demandé la résiliation (cancellation_scheduled).
-- Seule cette personne peut annuler la résiliation (remettre active).
-- Référence : demande utilisateur « qui a fait la demande de cancellation ».

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_requested_by_user_id UUID NULL;

COMMENT ON COLUMN public.subscriptions.cancellation_requested_by_user_id IS
  'User id (athlete or coach) who requested the cancellation. Only this user can cancel the cancellation (revert to active). NULL when status is not cancellation_scheduled or after revert.';
