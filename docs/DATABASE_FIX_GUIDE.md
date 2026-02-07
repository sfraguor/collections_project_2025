# Database Fix Guide - Community Features

## 🚨 Issue: "column c.cover does not exist" Error

You're getting this error because the community features migration hasn't been run yet, or your existing collections table is missing some columns.

## 🔧 Quick Fix Steps

### Step 1: Run the Database Migration (REQUIRED)
**⚠️ IMPORTANT: The Discovery screen will show empty results until you run this migration!**

1. Open your **Supabase Dashboard** (https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Create a new query
5. Copy and paste the **entire contents** of `supabase/migrations/20250922_add_community_features.sql`
6. Click **Run** to execute the migration
7. You should see "Success. No rows returned" - this is normal!

### Step 2: Verify the Migration Worked
Check that these new tables were created:
- `user_profiles` - User information
- `collection_likes` - Like system
- `collection_comments` - Comments
- `user_follows` - Following system

And these columns were added to `collections`:
- `cover` (TEXT) - For collection cover images
- `is_public` (BOOLEAN) - To mark collections as public/private
- `likes_count` (INTEGER) - Count of likes
- `views_count` (INTEGER) - Count of views

### Step 3: Test the Discovery Feature
1. Restart your app: `npm start`
2. Login to your account
3. Click the **"Discover"** button on the home screen
4. The screen should load without errors (but will be empty until you make collections public)

## 📋 What the Migration Does

The updated migration file now includes:
```sql
-- Add missing columns to existing collections table
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cover TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
```

Plus it creates all the community features:
- ✅ User profiles table
- ✅ Collection likes system
- ✅ Comments system
- ✅ User following system
- ✅ Database functions for public collections
- ✅ Row Level Security policies

## 🧪 Testing Your Collections

To test the community features properly:

### 1. Make a Collection Public
Since collections are private by default, you need to make some public:

**Option A: Manual Database Update**
```sql
UPDATE collections 
SET is_public = true 
WHERE user_id = 'your-user-id';
```

**Option B: Add Toggle to Edit Screen** (Future enhancement)
- We can add a "Make Public" toggle to the EditCollectionScreen

### 2. Create Test Data
1. **Register multiple accounts** - Create 2-3 test users
2. **Create collections** - Add some collections with different users
3. **Make them public** - Use the SQL command above
4. **Test interactions** - Like, clone, and browse collections

## 🔍 Troubleshooting

### If you still get errors:

**Error: "relation user_profiles does not exist"**
- The migration didn't run completely
- Re-run the entire migration file

**Error: "function get_public_collections does not exist"**
- The database functions weren't created
- Re-run the migration file

**No collections showing in Discovery**
- No public collections exist yet
- Make some collections public using the SQL command above

### Fallback Query
The community API now includes a fallback query that works even if the RPC functions fail:
```javascript
// If RPC fails, it automatically falls back to a direct query
const { data } = await supabase
  .from('collections')
  .select('*, user_profiles(*)')
  .eq('is_public', true)
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Discovery screen loads without errors
- ✅ You can switch between Recent/Trending/Users tabs
- ✅ Collections appear in the Recent tab (if any are public)
- ✅ Like buttons work (heart icon toggles)
- ✅ Clone functionality works

## 🎯 Next Steps After Fix

1. **Test the Discovery screen** - Make sure it loads
2. **Create public collections** - Make some collections public
3. **Test social features** - Try liking and cloning
4. **Add more users** - Create multiple accounts for testing
5. **Enhance UI** - Add public/private toggle to collection editing

The community features are now ready to use! 🎉
