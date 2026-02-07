-- Configurar políticas de Storage para collection-images bucket
-- Este bucket almacena imágenes de colecciones e items

-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'collection-images');

-- Permitir que usuarios autenticados lean todas las imágenes (públicas)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'collection-images');

-- Permitir que usuarios eliminen sus propias imágenes
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'collection-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuarios actualicen sus propias imágenes
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'collection-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
