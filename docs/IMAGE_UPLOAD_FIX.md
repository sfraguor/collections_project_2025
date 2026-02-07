# Image Upload Fix - January 2026

## Problem Summary

**Issue:** Collection images were not being saved to Supabase Storage when creating or editing collections. Images appeared to work initially but disappeared after app reinstallation.

**Root Cause:** The `uploadImage` function was failing silently due to incorrect base64 to binary conversion, causing images to be stored as local `file://` URIs instead of being uploaded to Supabase Storage.

## What Was Wrong

### Before Fix
1. **Images stored as local URIs**: Collections were saving local file paths like:
   - `file:///data/user/0/com.sfrag.coleccionesapp/cache/ImagePicker/...`
   
2. **Upload silently failing**: The `uploadImage` function in `imageUpload.js` was:
   - Using `decode` from `base-64` package
   - Creating Uint8Array incorrectly
   - Failing to upload but not throwing visible errors
   - Returning `null` without proper error handling

3. **Images disappeared after reinstall**: Local cache files were deleted when uninstalling the app

4. **Storage completely empty**: No images were actually stored in Supabase Storage bucket

## The Solution

### 1. Fixed `imageUpload.js`

**Key Changes:**
- ✅ Replaced `decode` from `base-64` package with native `atob()` function
- ✅ Improved base64 to binary conversion using proper `atob()` method
- ✅ Created proper Blob object for upload
- ✅ Added detailed logging at each step
- ✅ Enhanced error reporting

**New Implementation:**
```javascript
// Convert base64 to ArrayBuffer using atob (available in React Native)
const binaryString = atob(base64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}

// Create a Blob for upload
const blob = new Blob([bytes], { type: contentType });

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('collection-images')
  .upload(fileName, blob, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });
```

### 2. Cleaned Up Database

Removed all invalid local file URIs from existing collections:
```sql
UPDATE collections SET image = NULL WHERE image LIKE 'file://%'
```

### 3. Verified Infrastructure

✅ **Storage Bucket**: `collection-images` bucket exists and is public  
✅ **Storage Policies**: All policies correctly configured:
- `Users can upload images` - INSERT policy for authenticated users
- `Anyone can view images` - SELECT policy for public access
- `Users can delete their own images` - DELETE policy
- `Users can update their own images` - UPDATE policy

## How Images Work Now

### Upload Flow
1. User selects image from gallery or camera
2. Image is temporarily stored locally (`file://...`)
3. When saving collection:
   - `uploadImage()` reads the local file as base64
   - Converts to proper binary format
   - Creates Blob with correct content type
   - Uploads to Supabase Storage bucket `collection-images`
   - Returns public URL (e.g., `https://owzvwfikattbpktqnfxi.supabase.co/storage/v1/object/public/collection-images/...`)
4. Public URL is stored in database
5. Image persists even after app reinstallation

### File Structure in Storage
```
collection-images/
  ├── {userId}/
  │   ├── collection/
  │   │   ├── 1704672000000.jpeg
  │   │   ├── 1704672100000.png
  │   │   └── ...
  │   └── item/
  │       ├── 1704672200000.jpeg
  │       └── ...
```

## Testing the Fix

### For Developers
1. Build and install the app
2. Create a new collection with an image
3. Check logs - should see:
   ```
   📤 Starting image upload for: file://...
   ✅ Base64 read, length: XXXXX
   ✅ Byte array created, length: XXXXX
   ✅ Blob created, size: XXXXX type: image/jpeg
   ⬆️ Uploading to Supabase...
   ✅ Upload successful, path: ...
   🎉 Image uploaded successfully: https://...
   ```
4. Verify in Supabase Storage dashboard that image appears
5. Uninstall and reinstall app
6. Image should still be visible

### Using MCP to Verify
```javascript
// Check storage objects
await supabase.execute_sql({
  project_id: "owzvwfikattbpktqnfxi",
  query: "SELECT name, bucket_id, created_at FROM storage.objects WHERE bucket_id = 'collection-images' ORDER BY created_at DESC LIMIT 10"
});

// Check collections with images
await supabase.execute_sql({
  project_id: "owzvwfikattbpktqnfxi", 
  query: "SELECT id, name, image FROM collections WHERE image IS NOT NULL"
});
```

## What Users Need to Know

⚠️ **Important Notice for Existing Users:**
- Collections created before this fix will have no images
- Users need to re-add images to their existing collections
- Images will now persist across app reinstalls

## Files Modified

1. **`src/utils/imageUpload.js`** - Fixed base64 conversion and upload logic
2. **`scripts/fix-collection-images.js`** - Cleanup script for invalid URIs
3. **Database** - Cleared invalid file:// URIs from collections

## Prevention

To prevent similar issues in the future:

1. ✅ Always use `atob()` for base64 decoding in React Native
2. ✅ Create proper Blob objects for file uploads
3. ✅ Add comprehensive logging for debugging
4. ✅ Test image persistence across app reinstalls
5. ✅ Monitor Supabase Storage dashboard for actual uploads
6. ✅ Never store local file:// URIs in cloud database

## Additional Notes

- The `base-64` package is still in dependencies but not used by imageUpload
- Native `atob()` is more reliable in React Native environment
- Storage bucket is public, so images are accessible without authentication
- RLS policies still protect who can upload/delete images

---
**Fixed:** January 8, 2026  
**Status:** ✅ Resolved and tested  
**Next Steps:** Users should re-upload their collection images
