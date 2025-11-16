-- Add community features to the collections app
-- Run this in the Supabase SQL editor after the initial migration

-- First, add missing columns to existing collections table
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cover TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  collections_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on username for faster searches
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON user_profiles(username);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user profiles (users can see public profiles and their own)
DROP POLICY IF EXISTS user_profiles_policy ON user_profiles;
CREATE POLICY user_profiles_policy ON user_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

-- Create policy for updating own profile
DROP POLICY IF EXISTS user_profiles_update_policy ON user_profiles;
CREATE POLICY user_profiles_update_policy ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for inserting own profile
DROP POLICY IF EXISTS user_profiles_insert_policy ON user_profiles;
CREATE POLICY user_profiles_insert_policy ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create collection likes table
CREATE TABLE IF NOT EXISTS collection_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, collection_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS collection_likes_user_id_idx ON collection_likes(user_id);
CREATE INDEX IF NOT EXISTS collection_likes_collection_id_idx ON collection_likes(collection_id);

-- Enable Row Level Security
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;

-- Create policy for collection likes
DROP POLICY IF EXISTS collection_likes_policy ON collection_likes;
CREATE POLICY collection_likes_policy ON collection_likes
  USING (auth.uid() = user_id);

-- Create collection comments table
CREATE TABLE IF NOT EXISTS collection_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS collection_comments_collection_id_idx ON collection_comments(collection_id);
CREATE INDEX IF NOT EXISTS collection_comments_user_id_idx ON collection_comments(user_id);

-- Enable Row Level Security
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for collection comments (users can see comments on public collections)
DROP POLICY IF EXISTS collection_comments_select_policy ON collection_comments;
CREATE POLICY collection_comments_select_policy ON collection_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_comments.collection_id 
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

-- Create policy for inserting comments
DROP POLICY IF EXISTS collection_comments_insert_policy ON collection_comments;
CREATE POLICY collection_comments_insert_policy ON collection_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for updating own comments
DROP POLICY IF EXISTS collection_comments_update_policy ON collection_comments;
CREATE POLICY collection_comments_update_policy ON collection_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for deleting own comments
DROP POLICY IF EXISTS collection_comments_delete_policy ON collection_comments;
CREATE POLICY collection_comments_delete_policy ON collection_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create user follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_follows_follower_id_idx ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_id_idx ON user_follows(following_id);

-- Enable Row Level Security
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Create policy for user follows
DROP POLICY IF EXISTS user_follows_policy ON user_follows;
CREATE POLICY user_follows_policy ON user_follows
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Update collections policy to allow viewing public collections
DROP POLICY IF EXISTS collections_policy ON collections;
CREATE POLICY collections_policy ON collections
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Create policy for updating own collections
DROP POLICY IF EXISTS collections_update_policy ON collections;
CREATE POLICY collections_update_policy ON collections
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for inserting own collections
DROP POLICY IF EXISTS collections_insert_policy ON collections;
CREATE POLICY collections_insert_policy ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting own collections
DROP POLICY IF EXISTS collections_delete_policy ON collections;
CREATE POLICY collections_delete_policy ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update likes count when a like is added/removed
CREATE OR REPLACE FUNCTION update_collection_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for likes count
DROP TRIGGER IF EXISTS collection_likes_count_trigger ON collection_likes;
CREATE TRIGGER collection_likes_count_trigger
  AFTER INSERT OR DELETE ON collection_likes
  FOR EACH ROW EXECUTE FUNCTION update_collection_likes_count();

-- Create function to update followers/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the user being followed
    UPDATE user_profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- Increment following count for the user doing the following
    UPDATE user_profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the user being unfollowed
    UPDATE user_profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    -- Decrement following count for the user doing the unfollowing
    UPDATE user_profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for follow counts
DROP TRIGGER IF EXISTS user_follows_count_trigger ON user_follows;
CREATE TRIGGER user_follows_count_trigger
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Create function to update collections count in user profile
CREATE OR REPLACE FUNCTION update_user_collections_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles 
    SET collections_count = collections_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET collections_count = collections_count - 1 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for collections count
DROP TRIGGER IF EXISTS user_collections_count_trigger ON collections;
CREATE TRIGGER user_collections_count_trigger
  AFTER INSERT OR DELETE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_user_collections_count();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_collection_views(collection_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE collections 
  SET views_count = views_count + 1 
  WHERE id = collection_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get public collections with user info
CREATE OR REPLACE FUNCTION get_public_collections(limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image TEXT,
  cover TEXT,
  color TEXT,
  icon TEXT,
  likes_count INTEGER,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.image,
    c.cover,
    c.color,
    c.icon,
    c.likes_count,
    c.views_count,
    c.created_at,
    c.updated_at,
    c.user_id,
    up.username,
    up.display_name,
    up.avatar_url
  FROM collections c
  LEFT JOIN user_profiles up ON c.user_id = up.id
  WHERE c.is_public = true AND c.is_deleted = false
  ORDER BY c.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trending collections (most liked in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_collections(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image TEXT,
  cover TEXT,
  color TEXT,
  icon TEXT,
  likes_count INTEGER,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.image,
    c.cover,
    c.color,
    c.icon,
    c.likes_count,
    c.views_count,
    c.created_at,
    c.updated_at,
    c.user_id,
    up.username,
    up.display_name,
    up.avatar_url
  FROM collections c
  LEFT JOIN user_profiles up ON c.user_id = up.id
  WHERE c.is_public = true 
    AND c.is_deleted = false 
    AND c.created_at > NOW() - INTERVAL '7 days'
  ORDER BY c.likes_count DESC, c.views_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at timestamp on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_modtime ON user_profiles;
CREATE TRIGGER update_user_profiles_modtime
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add trigger to update updated_at timestamp on collection_comments
DROP TRIGGER IF EXISTS update_collection_comments_modtime ON collection_comments;
CREATE TRIGGER update_collection_comments_modtime
BEFORE UPDATE ON collection_comments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
