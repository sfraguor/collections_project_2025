// src/utils/communityApi.js
import { supabase } from './supabase';

/**
 * User Profile Management
 */

// Auto-create user profile if it doesn't exist
export const ensureUserProfile = async (userId, username = null, displayName = null) => {
  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return { success: true, data: existingProfile };
    }

    // Create profile if it doesn't exist
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username || `user_${userId.slice(-6)}`,
        display_name: displayName || 'User',
        is_public: true
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ User profile created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return { success: false, error };
  }
};

// Create or update user profile
export const createUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

// Search users by username
export const searchUsers = async (query, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, followers_count, collections_count')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .eq('is_public', true)
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error };
  }
};

/**
 * Collection Management
 */

// Make collection public/private
export const updateCollectionVisibility = async (collectionId, isPublic) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .update({ 
        is_public: isPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating collection visibility:', error);
    return { success: false, error };
  }
};

// Get public collections
export const getPublicCollections = async (limit = 20, offset = 0) => {
  try {
    // Use simple query without complex joins
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting collections:', error);
      return { success: true, data: [] };
    }

    if (!collections || collections.length === 0) {
      return { success: true, data: [] };
    }

    // Get user profiles separately
    const userIds = [...new Set(collections.map(c => c.user_id))];
    
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    // Merge collections with user data and clean the data
    const collectionsWithUsers = collections.map(collection => {
      const userProfile = profiles?.find(p => p.id === collection.user_id);
      
      return {
        id: collection.id,
        name: typeof collection.name === 'string' ? collection.name : 'Untitled Collection',
        description: typeof collection.description === 'string' ? collection.description : null,
        image: typeof collection.image === 'string' ? collection.image : null,
        cover: typeof collection.cover === 'string' ? collection.cover : null,
        color: typeof collection.color === 'string' ? collection.color : null,
        icon: typeof collection.icon === 'string' ? collection.icon : '📦',
        likes_count: typeof collection.likes_count === 'number' ? collection.likes_count : 0,
        views_count: typeof collection.views_count === 'number' ? collection.views_count : 0,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        user_id: collection.user_id,
        is_public: collection.is_public,
        username: typeof userProfile?.username === 'string' ? userProfile.username : 'Anonymous',
        display_name: typeof userProfile?.display_name === 'string' ? userProfile.display_name : null,
        avatar_url: typeof userProfile?.avatar_url === 'string' ? userProfile.avatar_url : null,
      };
    });
    return { success: true, data: collectionsWithUsers };
  } catch (error) {
    console.error('Error getting public collections:', error);
    return { success: true, data: [] };
  }
};

// Get trending collections
export const getTrendingCollections = async (limit = 10) => {
  try {
    // Simple query without RPC
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .eq('is_deleted', false)
      .order('likes_count', { ascending: false })
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error getting trending collections:', error);
      return { success: true, data: [] };
    }

    if (!collections || collections.length === 0) {
      return { success: true, data: [] };
    }

    // Get user profiles separately
    const userIds = [...new Set(collections.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    // Merge collections with user data and clean the data
    const collectionsWithUsers = collections.map(collection => {
      const userProfile = profiles?.find(p => p.id === collection.user_id);
      
      return {
        id: collection.id,
        name: typeof collection.name === 'string' ? collection.name : 'Untitled Collection',
        description: typeof collection.description === 'string' ? collection.description : null,
        image: typeof collection.image === 'string' ? collection.image : null,
        cover: typeof collection.cover === 'string' ? collection.cover : null,
        color: typeof collection.color === 'string' ? collection.color : null,
        icon: typeof collection.icon === 'string' ? collection.icon : '📦',
        likes_count: typeof collection.likes_count === 'number' ? collection.likes_count : 0,
        views_count: typeof collection.views_count === 'number' ? collection.views_count : 0,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        user_id: collection.user_id,
        is_public: collection.is_public,
        username: typeof userProfile?.username === 'string' ? userProfile.username : 'Anonymous',
        display_name: typeof userProfile?.display_name === 'string' ? userProfile.display_name : null,
        avatar_url: typeof userProfile?.avatar_url === 'string' ? userProfile.avatar_url : null,
      };
    });

    return { success: true, data: collectionsWithUsers };
  } catch (error) {
    console.error('Error getting trending collections:', error);
    return { success: true, data: [] };
  }
};

// Get collections by user
export const getUserCollections = async (userId, includePrivate = false) => {
  try {
    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (!includePrivate) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user collections:', error);
    return { success: false, error };
  }
};

// Increment collection views
export const incrementCollectionViews = async (collectionId) => {
  try {
    const { error } = await supabase
      .rpc('increment_collection_views', {
        collection_uuid: collectionId
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error incrementing collection views:', error);
    return { success: false, error };
  }
};

// Clone a public collection
export const cloneCollection = async (originalCollectionId, userId) => {
  try {
    // First get the original collection
    const { data: originalCollection, error: fetchError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', originalCollectionId)
      .eq('is_public', true)
      .single();

    if (fetchError) throw fetchError;

    // Create new collection with cloned data
    const clonedCollection = {
      ...originalCollection,
      id: undefined, // Let Supabase generate new ID
      user_id: userId,
      name: `${originalCollection.name} (Copy)`,
      is_public: false, // Cloned collections are private by default
      likes_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString()
    };

    const { data: newCollection, error: createError } = await supabase
      .from('collections')
      .insert(clonedCollection)
      .select()
      .single();

    if (createError) throw createError;

    // Get items from original collection
    const { data: originalItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('collection_id', originalCollectionId);

    if (itemsError) throw itemsError;

    // Clone items if they exist
    if (originalItems && originalItems.length > 0) {
      const clonedItems = originalItems.map(item => ({
        ...item,
        id: undefined, // Let Supabase generate new ID
        user_id: userId,
        collection_id: newCollection.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString()
      }));

      const { error: itemsInsertError } = await supabase
        .from('items')
        .insert(clonedItems);

      if (itemsInsertError) throw itemsInsertError;
    }

    return { success: true, data: newCollection };
  } catch (error) {
    console.error('Error cloning collection:', error);
    return { success: false, error };
  }
};

/**
 * Likes Management
 */

// Like/unlike a collection
export const toggleCollectionLike = async (collectionId, userId) => {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('collection_likes')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('collection_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
      return { success: true, liked: false };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('collection_likes')
        .insert({
          collection_id: collectionId,
          user_id: userId
        });

      if (insertError) throw insertError;
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling collection like:', error);
    return { success: false, error };
  }
};

// Check if user liked a collection
export const checkCollectionLiked = async (collectionId, userId) => {
  try {
    const { data, error } = await supabase
      .from('collection_likes')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, liked: !!data };
  } catch (error) {
    console.error('Error checking collection like:', error);
    return { success: false, error };
  }
};

// Get users who liked a collection
export const getCollectionLikes = async (collectionId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('collection_likes')
      .select(`
        created_at,
        user_profiles!collection_likes_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting collection likes:', error);
    return { success: false, error };
  }
};

/**
 * Comments Management
 */

// Add comment to collection
export const addCollectionComment = async (collectionId, userId, content) => {
  try {
    const { data, error } = await supabase
      .from('collection_comments')
      .insert({
        collection_id: collectionId,
        user_id: userId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding collection comment:', error);
    return { success: false, error };
  }
};

// Get comments for a collection
export const getCollectionComments = async (collectionId, limit = 50) => {
  try {
    // First get the comments
    const { data: comments, error: commentsError } = await supabase
      .from('collection_comments')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (commentsError) throw commentsError;

    // Then get user profiles for each comment
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not load user profiles for comments:', profilesError);
      }

      // Merge comments with profiles
      const commentsWithProfiles = comments.map(comment => ({
        ...comment,
        username: profiles?.find(p => p.id === comment.user_id)?.username || 'Anonymous',
        display_name: profiles?.find(p => p.id === comment.user_id)?.display_name || null,
        avatar_url: profiles?.find(p => p.id === comment.user_id)?.avatar_url || null,
      }));

      return { success: true, data: commentsWithProfiles };
    }

    return { success: true, data: comments || [] };
  } catch (error) {
    console.error('Error getting collection comments:', error);
    return { success: false, error };
  }
};

// Update comment
export const updateCollectionComment = async (commentId, content) => {
  try {
    const { data, error } = await supabase
      .from('collection_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        user_profiles!collection_comments_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating collection comment:', error);
    return { success: false, error };
  }
};

// Delete comment
export const deleteCollectionComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from('collection_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting collection comment:', error);
    return { success: false, error };
  }
};

/**
 * Following System
 */

// Follow/unfollow a user
export const toggleUserFollow = async (followingId, followerId) => {
  try {
    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', followingId)
      .eq('follower_id', followerId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existingFollow.id);

      if (deleteError) throw deleteError;
      return { success: true, following: false };
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('user_follows')
        .insert({
          following_id: followingId,
          follower_id: followerId
        });

      if (insertError) throw insertError;
      return { success: true, following: true };
    }
  } catch (error) {
    console.error('Error toggling user follow:', error);
    return { success: false, error };
  }
};

// Check if user is following another user
export const checkUserFollowing = async (followingId, followerId) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', followingId)
      .eq('follower_id', followerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, following: !!data };
  } catch (error) {
    console.error('Error checking user follow:', error);
    return { success: false, error };
  }
};

// Get user's followers
export const getUserFollowers = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        created_at,
        user_profiles!user_follows_follower_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          followers_count,
          collections_count
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user followers:', error);
    return { success: false, error };
  }
};

// Get users that a user is following
export const getUserFollowing = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        created_at,
        user_profiles!user_follows_following_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          followers_count,
          collections_count
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user following:', error);
    return { success: false, error };
  }
};

/**
 * Activity Feed
 */

// Get activity feed for a user (collections from people they follow)
export const getActivityFeed = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        user_profiles!collections_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .in('user_id', 
        supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId)
      )
      .eq('is_public', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting activity feed:', error);
    return { success: false, error };
  }
};

/**
 * User Following System
 */

// Follow a user
export const followUser = async (followingId, followerId) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error };
  }
};

// Unfollow a user
export const unfollowUser = async (followingId, followerId) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error };
  }
};

// Check if user is followed
export const checkUserFollowed = async (followingId, followerId) => {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned, user is not followed
      return { success: true, following: false };
    }
    
    if (error) throw error;
    return { success: true, following: !!data };
  } catch (error) {
    console.error('Error checking user follow status:', error);
    return { success: false, error };
  }
};

/**
 * Collection Items Management
 */

/**
 * Collection Items Management
 */

// Get items from a collection
export const getCollectionItems = async (collectionId) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Collection items loaded:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting collection items:', error);
    return { success: false, error, data: [] };
  }
};
