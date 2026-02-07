-- Fix RLS Policies for Authentication
-- This migration ensures that all tables require authentication and proper user ownership

-- ============================================
-- COLLECTIONS TABLE
-- ============================================

-- Drop ALL existing policies for collections
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can create their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can create own collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;

-- Ensure RLS is enabled
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections FORCE ROW LEVEL SECURITY;

-- Create new policies for collections
-- Policy 1: Users can view their own collections (private or public)
CREATE POLICY "collections_select_own"
  ON collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can view public collections from others
CREATE POLICY "collections_select_public"
  ON collections FOR SELECT
  TO authenticated
  USING (is_public = true AND auth.uid() != user_id);

-- Policy 3: Users can create their own collections
CREATE POLICY "collections_insert_own"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own collections
CREATE POLICY "collections_update_own"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own collections
CREATE POLICY "collections_delete_own"
  ON collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- ITEMS TABLE
-- ============================================

-- Drop ALL existing policies for items
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can view items of public collections" ON items;
DROP POLICY IF EXISTS "Users can create their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Authenticated users can view public collection items" ON items;
DROP POLICY IF EXISTS "Users can create own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- Ensure RLS is enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE items FORCE ROW LEVEL SECURITY;

-- Create new policies for items
-- Policy 1: Users can view their own items
CREATE POLICY "items_select_own"
  ON items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can view items from public collections
CREATE POLICY "items_select_public_collections"
  ON items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = items.collection_id 
      AND collections.is_public = true
    )
  );

-- Policy 3: Users can create their own items
CREATE POLICY "items_insert_own"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own items
CREATE POLICY "items_update_own"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own items
CREATE POLICY "items_delete_own"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USER_PROFILES TABLE
-- ============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

-- Create new policies
-- Policy 1: All authenticated users can view profiles
CREATE POLICY "profiles_select_authenticated"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- COLLECTION_LIKES TABLE
-- ============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all likes" ON collection_likes;
DROP POLICY IF EXISTS "Users can like collections" ON collection_likes;
DROP POLICY IF EXISTS "Users can unlike collections" ON collection_likes;
DROP POLICY IF EXISTS "Authenticated users can view likes" ON collection_likes;
DROP POLICY IF EXISTS "Users can create likes" ON collection_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON collection_likes;

-- Ensure RLS is enabled
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_likes FORCE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "likes_select_authenticated"
  ON collection_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "likes_insert_own"
  ON collection_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON collection_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- COLLECTION_COMMENTS TABLE
-- ============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all comments" ON collection_comments;
DROP POLICY IF EXISTS "Users can create comments" ON collection_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON collection_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON collection_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON collection_comments;

-- Ensure RLS is enabled
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_comments FORCE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "comments_select_authenticated"
  ON collection_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comments_insert_own"
  ON collection_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON collection_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON collection_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USER_FOLLOWS TABLE
-- ============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON user_follows;
DROP POLICY IF EXISTS "Authenticated users can view follows" ON user_follows;
DROP POLICY IF EXISTS "Users can create follows" ON user_follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON user_follows;

-- Ensure RLS is enabled
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows FORCE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "follows_select_authenticated"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "follows_insert_own"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================
-- SYNC_STATE TABLE
-- ============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own sync state" ON sync_state;
DROP POLICY IF EXISTS "Users can update own sync state" ON sync_state;
DROP POLICY IF EXISTS "Users can create own sync state" ON sync_state;
DROP POLICY IF EXISTS "Users can delete own sync state" ON sync_state;

-- Ensure RLS is enabled
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state FORCE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "sync_select_own"
  ON sync_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "sync_insert_own"
  ON sync_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sync_update_own"
  ON sync_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sync_delete_own"
  ON sync_state FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
