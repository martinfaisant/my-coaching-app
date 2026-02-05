-- ============================================================
-- Script pour créer le bucket 'avatars' dans Supabase Storage
-- À exécuter dans Supabase : Dashboard > SQL Editor (New query)
-- Colle tout le contenu ci-dessous et clique sur Run.
-- ============================================================

-- Créer le bucket 'avatars' pour les photos de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  102400,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supprimer les politiques existantes avant de les recréer
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_delete" ON storage.objects;

-- Politique : lecture publique des avatars
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Politique : upload uniquement dans son propre dossier (user_id/avatar.jpg)
CREATE POLICY "avatars_authenticated_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Politique : mise à jour uniquement de ses propres fichiers
CREATE POLICY "avatars_authenticated_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Politique : suppression uniquement de ses propres fichiers
CREATE POLICY "avatars_authenticated_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Vérification : afficher les buckets créés
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'avatars';
