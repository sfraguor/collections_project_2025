-- Auto-create user profile when a new user signs up
-- This trigger ensures every user in auth.users has a corresponding profile in user_profiles

-- First, create profiles for any existing users that don't have one
INSERT INTO user_profiles (id, username, display_name, is_public, created_at)
SELECT 
  auth.users.id,
  SPLIT_PART(auth.users.email, '@', 1) as username, -- Use email prefix as default username
  COALESCE(auth.users.raw_user_meta_data->>'full_name', SPLIT_PART(auth.users.email, '@', 1)) as display_name,
  true as is_public,
  auth.users.created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.users.id
);

-- Create a function that will be triggered on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, is_public, created_at)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1), -- Use email prefix as default username
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    true,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger that calls the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
