-- Verificar y corregir las políticas RLS para colecciones e items

-- 1. Verificar que RLS está habilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('collections', 'items', 'user_profiles')
ORDER BY tablename;

-- 2. Ver las políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('collections', 'items', 'user_profiles')
ORDER BY tablename, policyname;

-- 3. Eliminar políticas existentes y crear nuevas más restrictivas
-- COLLECTIONS
DROP POLICY IF EXISTS collections_policy ON collections;

-- Política para SELECT: solo el dueño o colecciones públicas
CREATE POLICY collections_select_policy ON collections
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (is_public = true AND is_deleted = false)
  );

-- Política para INSERT: solo usuarios autenticados pueden crear sus propias colecciones
CREATE POLICY collections_insert_policy ON collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: solo el dueño puede actualizar
CREATE POLICY collections_update_policy ON collections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: solo el dueño puede eliminar (soft delete)
CREATE POLICY collections_delete_policy ON collections
  FOR DELETE
  USING (auth.uid() = user_id);

-- ITEMS
DROP POLICY IF EXISTS items_policy ON items;

-- Política para SELECT: solo el dueño o items de colecciones públicas
CREATE POLICY items_select_policy ON items
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = items.collection_id
      AND collections.is_public = true
      AND collections.is_deleted = false
    )
  );

-- Política para INSERT: solo usuarios autenticados pueden crear sus propios items
CREATE POLICY items_insert_policy ON items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: solo el dueño puede actualizar
CREATE POLICY items_update_policy ON items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: solo el dueño puede eliminar
CREATE POLICY items_delete_policy ON items
  FOR DELETE
  USING (auth.uid() = user_id);

-- USER_PROFILES
-- Las políticas de user_profiles deben permitir leer perfiles públicos
-- pero solo actualizar el propio

-- Primero eliminamos políticas existentes si las hay
DROP POLICY IF EXISTS user_profiles_select_policy ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_policy ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_policy ON user_profiles;
DROP POLICY IF EXISTS user_profiles_delete_policy ON user_profiles;

-- SELECT: todos pueden ver todos los perfiles
CREATE POLICY user_profiles_select_policy ON user_profiles
  FOR SELECT
  USING (true);

-- INSERT: solo puede insertar su propio perfil
CREATE POLICY user_profiles_insert_policy ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: solo puede actualizar su propio perfil
CREATE POLICY user_profiles_update_policy ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: solo puede eliminar su propio perfil
CREATE POLICY user_profiles_delete_policy ON user_profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Verificar que las políticas se crearon correctamente
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('collections', 'items', 'user_profiles')
ORDER BY tablename, policyname;
