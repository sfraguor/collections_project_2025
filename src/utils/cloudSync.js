// src/utils/cloudSync.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Alert } from 'react-native';

// Storage key with user ID to separate data by user
const getStorageKey = (userId) => `collections_${userId || 'guest'}`;

// Helper function to get item storage key with user ID
const getItemStorageKey = (userId, collectionId) => `${userId || 'guest'}_${collectionId}`;

// Helper function to extract cover image URI from description
const extractCoverFromDescription = (description) => {
  if (!description) return null;
  
  // Check if description contains a cover URI
  const match = description.match(/cover:(.*?)($|;)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
};

// Helper function to extract userId from description
const extractUserIdFromDescription = (description) => {
  if (!description) return null;
  
  // Check if description contains a userId
  const match = description.match(/userId:(.*?)($|;)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
};

/**
 * Initialize cloud sync by creating necessary tables if they don't exist
 * This should be called when the app starts
 */
export const initializeCloudSync = async () => {
  try {
    // Skip the connection test for now and go straight to the RPC calls
    // If there's a connection issue, it will be caught in the RPC calls
    
    // Try to call the RPC functions, but handle the case where they don't exist yet
    try {
      // Check if tables exist and create them if they don't
      const { error: collectionsError } = await supabase.rpc('initialize_collections_table');
      if (collectionsError) throw collectionsError;

      const { error: itemsError } = await supabase.rpc('initialize_items_table');
      if (itemsError) throw itemsError;

      const { error: syncStateError } = await supabase.rpc('initialize_sync_state_table');
      if (syncStateError) throw syncStateError;

      return { success: true };
    } catch (rpcError) {
      // If the error is about the function not existing, provide a helpful message
      if (rpcError.message && rpcError.message.includes('Could not find the function')) {
        console.warn('Supabase functions not found. SQL migrations need to be run.');
        return { 
          success: false, 
          error: rpcError,
          message: 'Cloud sync is not fully set up. Please run the SQL migrations in the Supabase dashboard as described in the readme.',
          needsMigration: true
        };
      }
      throw rpcError; // Re-throw if it's a different error
    }
  } catch (error) {
    console.error('Error initializing cloud sync:', error.message);
    return { success: false, error };
  }
};

/**
 * Get the last sync timestamp for a user
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - ISO timestamp of last sync
 */
export const getLastSyncTimestamp = async (userId) => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('sync_state')
      .select('last_synced')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return data?.last_synced || null;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error.message);
    return null;
  }
};

/**
 * Update the last sync timestamp for a user
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 */
export const updateLastSyncTimestamp = async (userId) => {
  try {
    if (!userId) return false;

    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('sync_state')
      .upsert({ 
        user_id: userId, 
        last_synced: timestamp 
      });

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating last sync timestamp:', error.message);
    return false;
  }
};

/**
 * Sync collections from local storage to cloud
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync results
 */
export const syncCollectionsToCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get local collections
    const storageKey = getStorageKey(userId);
    const collectionsJson = await AsyncStorage.getItem(storageKey);
    const collections = collectionsJson ? JSON.parse(collectionsJson) : [];

    if (collections.length === 0) {
      return { success: true, message: 'No collections to sync' };
    }

    // Prepare collections for Supabase (add user_id and convert dates)
    const collectionsForCloud = collections.map(collection => {
      // Create a new object without the cover field
      const { cover, createdAt, updatedAt, userId, ...rest } = collection;
      
      // Store both cover and userId in the description field
      let enhancedDescription = collection.description || '';
      if (cover) {
        enhancedDescription = `cover:${cover};${enhancedDescription}`;
      }
      if (userId) {
        enhancedDescription = `userId:${userId};${enhancedDescription}`;
      }
      
      return {
        ...rest,
        description: enhancedDescription,
        user_id: userId || 'guest',
        created_at: createdAt || new Date().toISOString(),
        updated_at: updatedAt || new Date().toISOString(),
        synced_at: new Date().toISOString()
      };
    });

    // Upsert collections to Supabase
    const { error } = await supabase
      .from('collections')
      .upsert(collectionsForCloud, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;

    return { 
      success: true, 
      message: `Synced ${collections.length} collections to cloud` 
    };
  } catch (error) {
    console.error('Error syncing collections to cloud:', error.message);
    return { success: false, error };
  }
};

/**
 * Sync items from local storage to cloud
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync results
 */
export const syncItemsToCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get local collections to get their IDs
    const storageKey = getStorageKey(userId);
    const collectionsJson = await AsyncStorage.getItem(storageKey);
    const collections = collectionsJson ? JSON.parse(collectionsJson) : [];

    if (collections.length === 0) {
      return { success: true, message: 'No collections to sync items from' };
    }

    let totalItems = 0;
    
    // For each collection, sync its items
    for (const collection of collections) {
      const itemStorageKey = getItemStorageKey(userId, collection.id);
      const itemsJson = await AsyncStorage.getItem(itemStorageKey);
      const items = itemsJson ? JSON.parse(itemsJson) : [];
      
      if (items.length === 0) continue;
      
      totalItems += items.length;
      
      // Prepare items for Supabase (add user_id and collection_id)
      const itemsForCloud = items.map(item => {
        const { createdAt, updatedAt, userId: itemUserId, ...rest } = item;
        
        // Store userId in notes field if it exists
        let enhancedNotes = item.notes || '';
        if (itemUserId) {
          enhancedNotes = `userId:${itemUserId};${enhancedNotes}`;
        }
        
        return {
          ...rest,
          notes: enhancedNotes,
          user_id: userId,
          collection_id: collection.id,
          created_at: createdAt || new Date().toISOString(),
          updated_at: updatedAt || new Date().toISOString(),
          synced_at: new Date().toISOString()
        };
      });

      // Upsert items to Supabase
      const { error } = await supabase
        .from('items')
        .upsert(itemsForCloud, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    }

    return { 
      success: true, 
      message: `Synced ${totalItems} items to cloud` 
    };
  } catch (error) {
    console.error('Error syncing items to cloud:', error.message);
    return { success: false, error };
  }
};

/**
 * Sync collections from cloud to local storage
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync results
 */
export const syncCollectionsFromCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get last sync timestamp
    const lastSync = await getLastSyncTimestamp(userId);
    
    // Query for collections updated since last sync
    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);
      
    if (lastSync) {
      query = query.gt('updated_at', lastSync);
    }
    
    const { data: cloudCollections, error } = await query;

    if (error) throw error;

    if (!cloudCollections || cloudCollections.length === 0) {
      return { success: true, message: 'No new collections to sync from cloud' };
    }

    // Get local collections
    const storageKey = getStorageKey(userId);
    const collectionsJson = await AsyncStorage.getItem(storageKey);
    const localCollections = collectionsJson ? JSON.parse(collectionsJson) : [];
    
    // Create a map of local collections by ID
    const localCollectionsMap = {};
    localCollections.forEach(collection => {
      localCollectionsMap[collection.id] = collection;
    });
    
    // Merge cloud collections with local collections
    const mergedCollections = [...localCollections];
    
    cloudCollections.forEach(cloudCollection => {
      // Convert cloud format to local format
      const localFormat = {
        ...cloudCollection,
        createdAt: cloudCollection.created_at,
        updatedAt: cloudCollection.updated_at,
        userId: extractUserIdFromDescription(cloudCollection.description) || cloudCollection.user_id || userId, // Restore the original userId
        // Extract cover from description if it was stored there
        cover: extractCoverFromDescription(cloudCollection.description),
        // Remove cloud-specific fields
        created_at: undefined,
        updated_at: undefined,
        synced_at: undefined,
        user_id: undefined
      };
      
      const existingIndex = mergedCollections.findIndex(c => c.id === cloudCollection.id);
      
      if (existingIndex >= 0) {
        // Update existing collection
        mergedCollections[existingIndex] = localFormat;
      } else {
        // Add new collection
        mergedCollections.push(localFormat);
      }
    });
    
    // Save merged collections to local storage
    await AsyncStorage.setItem(storageKey, JSON.stringify(mergedCollections));

    return { 
      success: true, 
      message: `Synced ${cloudCollections.length} collections from cloud` 
    };
  } catch (error) {
    console.error('Error syncing collections from cloud:', error.message);
    return { success: false, error };
  }
};

/**
 * Sync items from cloud to local storage
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync results
 */
export const syncItemsFromCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get last sync timestamp
    const lastSync = await getLastSyncTimestamp(userId);
    
    // Get local collections to know which collections to sync items for
    const storageKey = getStorageKey(userId);
    const collectionsJson = await AsyncStorage.getItem(storageKey);
    const collections = collectionsJson ? JSON.parse(collectionsJson) : [];
    
    if (collections.length === 0) {
      return { success: true, message: 'No collections to sync items for' };
    }
    
    let totalSyncedItems = 0;
    
    // For each collection, sync its items
    for (const collection of collections) {
      // Query for items updated since last sync
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .eq('collection_id', collection.id);
        
      if (lastSync) {
        query = query.gt('updated_at', lastSync);
      }
      
      const { data: cloudItems, error } = await query;
  
      if (error) throw error;
  
      if (!cloudItems || cloudItems.length === 0) {
        continue; // No items to sync for this collection
      }
      
      totalSyncedItems += cloudItems.length;
  
      // Get local items
      const itemStorageKey = getItemStorageKey(userId, collection.id);
      const itemsJson = await AsyncStorage.getItem(itemStorageKey);
      const localItems = itemsJson ? JSON.parse(itemsJson) : [];
      
      // Merge cloud items with local items
      const mergedItems = [...localItems];
      
      cloudItems.forEach(cloudItem => {
        // Convert cloud format to local format
        const localFormat = {
          ...cloudItem,
          createdAt: cloudItem.created_at,
          updatedAt: cloudItem.updated_at,
          userId: extractUserIdFromDescription(cloudItem.notes) || cloudItem.user_id || userId, // Restore the original userId
          // Remove cloud-specific fields
          created_at: undefined,
          updated_at: undefined,
          synced_at: undefined,
          user_id: undefined,
          collection_id: undefined
        };
        
        const existingIndex = mergedItems.findIndex(item => item.id === cloudItem.id);
        
        if (existingIndex >= 0) {
          // Update existing item
          mergedItems[existingIndex] = localFormat;
        } else {
          // Add new item
          mergedItems.push(localFormat);
        }
      });
      
      // Save merged items to local storage
      await AsyncStorage.setItem(itemStorageKey, JSON.stringify(mergedItems));
    }

    return { 
      success: true, 
      message: `Synced ${totalSyncedItems} items from cloud` 
    };
  } catch (error) {
    console.error('Error syncing items from cloud:', error.message);
    return { success: false, error };
  }
};

/**
 * Perform a full sync (both directions)
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync results
 */
export const performFullSync = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // First sync from cloud to local
    const fromCloudCollections = await syncCollectionsFromCloud(userId);
    const fromCloudItems = await syncItemsFromCloud(userId);
    
    // Then sync from local to cloud
    const toCloudCollections = await syncCollectionsToCloud(userId);
    const toCloudItems = await syncItemsToCloud(userId);
    
    // Update last sync timestamp
    await updateLastSyncTimestamp(userId);
    
    // Check if any operation failed
    if (!fromCloudCollections.success || !fromCloudItems.success || 
        !toCloudCollections.success || !toCloudItems.success) {
      return { 
        success: false, 
        error: 'Some sync operations failed',
        details: {
          fromCloudCollections,
          fromCloudItems,
          toCloudCollections,
          toCloudItems
        }
      };
    }
    
    return { 
      success: true, 
      message: 'Full sync completed successfully',
      details: {
        fromCloudCollections,
        fromCloudItems,
        toCloudCollections,
        toCloudItems
      }
    };
  } catch (error) {
    console.error('Error performing full sync:', error.message);
    return { success: false, error };
  }
};

/**
 * Check if cloud sync is enabled for a user
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Whether cloud sync is enabled
 */
export const isCloudSyncEnabled = async (userId) => {
  try {
    if (!userId) return false;
    
    const syncEnabledJson = await AsyncStorage.getItem(`${userId}_cloud_sync_enabled`);
    return syncEnabledJson ? JSON.parse(syncEnabledJson) : false;
  } catch (error) {
    console.error('Error checking if cloud sync is enabled:', error.message);
    return false;
  }
};

/**
 * Enable or disable cloud sync for a user
 * @param {string} userId - The user ID
 * @param {boolean} enabled - Whether to enable or disable cloud sync
 * @returns {Promise<boolean>} - Success status
 */
export const setCloudSyncEnabled = async (userId, enabled) => {
  try {
    if (!userId) return false;
    
    await AsyncStorage.setItem(`${userId}_cloud_sync_enabled`, JSON.stringify(enabled));
    return true;
  } catch (error) {
    console.error('Error setting cloud sync enabled:', error.message);
    return false;
  }
};

/**
 * Get cloud sync settings for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Sync settings
 */
export const getCloudSyncSettings = async (userId) => {
  try {
    if (!userId) {
      return {
        enabled: false,
        autoSync: false,
        syncOnWifi: true,
        syncInterval: 'daily',
        lastSynced: null
      };
    }
    
    const settingsJson = await AsyncStorage.getItem(`${userId}_cloud_sync_settings`);
    const defaultSettings = {
      enabled: false,
      autoSync: false,
      syncOnWifi: true,
      syncInterval: 'daily',
      lastSynced: null
    };
    
    return settingsJson ? JSON.parse(settingsJson) : defaultSettings;
  } catch (error) {
    console.error('Error getting cloud sync settings:', error.message);
    return {
      enabled: false,
      autoSync: false,
      syncOnWifi: true,
      syncInterval: 'daily',
      lastSynced: null
    };
  }
};

/**
 * Update cloud sync settings for a user
 * @param {string} userId - The user ID
 * @param {Object} settings - The new settings
 * @returns {Promise<boolean>} - Success status
 */
export const updateCloudSyncSettings = async (userId, settings) => {
  try {
    if (!userId) return false;
    
    const currentSettings = await getCloudSyncSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(`${userId}_cloud_sync_settings`, JSON.stringify(updatedSettings));
    
    // If sync was disabled and is now enabled, perform an initial sync
    if (!currentSettings.enabled && updatedSettings.enabled) {
      performFullSync(userId).catch(error => {
        console.error('Error performing initial sync:', error);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating cloud sync settings:', error.message);
    return false;
  }
};
