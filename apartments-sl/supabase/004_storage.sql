-- Create the apartment-images storage bucket
-- Run this in your Supabase SQL editor or via the Supabase dashboard

-- Create the bucket (public so images can be served without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apartment-images',
  'apartment-images',
  true,
  10485760, -- 10 MB max per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view images in the public bucket
CREATE POLICY "Public read apartment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apartment-images');

-- RLS: Authenticated landlords can upload images
CREATE POLICY "Landlords can upload apartment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'apartment-images'
  AND auth.uid() IS NOT NULL
);

-- RLS: Landlords can delete their own images
CREATE POLICY "Landlords can delete own apartment images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'apartment-images'
  AND owner = auth.uid()
);
