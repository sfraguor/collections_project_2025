// src/utils/dataExport.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

/**
 * Utility functions for exporting and importing app data
 */

/**
 * Export all app data to a JSON file
 * @returns {Promise<string>} The URI of the exported file
 */
export const exportAllData = async () => {
  try {
    // Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter out any system keys if needed
    const dataKeys = keys.filter(key => 
      !key.startsWith('expo') && 
      !key.startsWith('persist:') &&
      key !== 'app_tags'
    );
    
    // Get all collections data
    const collectionsKey = 'collections';
    const collectionsData = await AsyncStorage.getItem(collectionsKey);
    const collections = collectionsData ? JSON.parse(collectionsData) : [];
    
    // Get all items data for each collection
    const itemsData = {};
    for (const collection of collections) {
      const collectionId = collection.id;
      const itemsJson = await AsyncStorage.getItem(collectionId);
      itemsData[collectionId] = itemsJson ? JSON.parse(itemsJson) : [];
    }
    
    // Get tags data
    const tagsKey = 'app_tags';
    const tagsData = await AsyncStorage.getItem(tagsKey);
    const tags = tagsData ? JSON.parse(tagsData) : [];
    
    // Create export object
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collections,
      items: itemsData,
      tags,
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create a temporary file
    const fileDate = new Date().toISOString().split('T')[0];
    const fileName = `colecciones_backup_${fileDate}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write data to file
    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return fileUri;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Share the exported data file
 * @param {string} fileUri - The URI of the file to share
 */
export const shareExportedFile = async (fileUri) => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert(
        'Sharing not available',
        'Sharing is not available on this device'
      );
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};

/**
 * Export a single collection to a JSON file
 * @param {string} collectionId - The ID of the collection to export
 * @param {string} collectionName - The name of the collection
 * @returns {Promise<string>} The URI of the exported file
 */
export const exportCollection = async (collectionId, collectionName) => {
  try {
    // Get collection data
    const itemsJson = await AsyncStorage.getItem(collectionId);
    const items = itemsJson ? JSON.parse(itemsJson) : [];
    
    // Create export object
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collection: {
        id: collectionId,
        name: collectionName,
      },
      items,
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create a temporary file
    const safeCollectionName = collectionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileDate = new Date().toISOString().split('T')[0];
    const fileName = `coleccion_${safeCollectionName}_${fileDate}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write data to file
    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return fileUri;
  } catch (error) {
    console.error('Error exporting collection:', error);
    throw error;
  }
};

/**
 * Import data from a JSON file
 * @param {boolean} mergeData - Whether to merge with existing data or replace it
 * @returns {Promise<Object>} Import results
 */
export const importData = async (mergeData = false) => {
  try {
    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return { success: false, message: 'Import canceled' };
    }
    
    // Read the file
    const fileUri = result.assets[0].uri;
    const jsonData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Parse the data
    const importData = JSON.parse(jsonData);
    
    // Validate the data
    if (!importData.version || !importData.timestamp) {
      return { 
        success: false, 
        message: 'Invalid backup file format' 
      };
    }
    
    // Check if it's a full backup or a single collection
    if (importData.collections && importData.items) {
      // Full backup
      return await importFullBackup(importData, mergeData);
    } else if (importData.collection && importData.items) {
      // Single collection
      return await importSingleCollection(importData, mergeData);
    } else {
      return { 
        success: false, 
        message: 'Unknown backup format' 
      };
    }
  } catch (error) {
    console.error('Error importing data:', error);
    return { 
      success: false, 
      message: `Error importing data: ${error.message}` 
    };
  }
};

/**
 * Import a full backup
 * @param {Object} importData - The data to import
 * @param {boolean} mergeData - Whether to merge with existing data
 * @returns {Promise<Object>} Import results
 */
const importFullBackup = async (importData, mergeData) => {
  try {
    if (mergeData) {
      // Merge with existing data
      
      // Get existing collections
      const collectionsJson = await AsyncStorage.getItem('collections');
      const existingCollections = collectionsJson ? JSON.parse(collectionsJson) : [];
      
      // Create a map of existing collections by ID
      const existingCollectionsMap = {};
      existingCollections.forEach(collection => {
        existingCollectionsMap[collection.id] = collection;
      });
      
      // Merge collections
      const newCollections = [...existingCollections];
      importData.collections.forEach(importedCollection => {
        if (!existingCollectionsMap[importedCollection.id]) {
          // Add new collection
          newCollections.push(importedCollection);
        }
      });
      
      // Save merged collections
      await AsyncStorage.setItem('collections', JSON.stringify(newCollections));
      
      // Merge items for each collection
      for (const collectionId in importData.items) {
        const importedItems = importData.items[collectionId];
        
        // Get existing items
        const existingItemsJson = await AsyncStorage.getItem(collectionId);
        const existingItems = existingItemsJson ? JSON.parse(existingItemsJson) : [];
        
        // Create a map of existing items by ID
        const existingItemsMap = {};
        existingItems.forEach(item => {
          existingItemsMap[item.id] = item;
        });
        
        // Merge items
        const newItems = [...existingItems];
        importedItems.forEach(importedItem => {
          if (!existingItemsMap[importedItem.id]) {
            // Add new item
            newItems.push(importedItem);
          }
        });
        
        // Save merged items
        await AsyncStorage.setItem(collectionId, JSON.stringify(newItems));
      }
      
      // Merge tags
      if (importData.tags) {
        const existingTagsJson = await AsyncStorage.getItem('app_tags');
        const existingTags = existingTagsJson ? JSON.parse(existingTagsJson) : [];
        
        // Create a set of existing tags
        const existingTagsSet = new Set(existingTags);
        
        // Add new tags
        importData.tags.forEach(tag => {
          existingTagsSet.add(tag);
        });
        
        // Save merged tags
        await AsyncStorage.setItem('app_tags', JSON.stringify(Array.from(existingTagsSet)));
      }
      
      return { 
        success: true, 
        message: 'Data imported and merged successfully',
        stats: {
          collections: importData.collections.length,
          items: Object.values(importData.items).flat().length,
          tags: importData.tags ? importData.tags.length : 0
        }
      };
    } else {
      // Replace existing data
      
      // Save collections
      await AsyncStorage.setItem('collections', JSON.stringify(importData.collections));
      
      // Save items for each collection
      for (const collectionId in importData.items) {
        await AsyncStorage.setItem(collectionId, JSON.stringify(importData.items[collectionId]));
      }
      
      // Save tags
      if (importData.tags) {
        await AsyncStorage.setItem('app_tags', JSON.stringify(importData.tags));
      }
      
      return { 
        success: true, 
        message: 'Data imported successfully (replaced existing data)',
        stats: {
          collections: importData.collections.length,
          items: Object.values(importData.items).flat().length,
          tags: importData.tags ? importData.tags.length : 0
        }
      };
    }
  } catch (error) {
    console.error('Error importing full backup:', error);
    return { 
      success: false, 
      message: `Error importing data: ${error.message}` 
    };
  }
};

/**
 * Import a single collection
 * @param {Object} importData - The data to import
 * @param {boolean} mergeData - Whether to merge with existing data
 * @returns {Promise<Object>} Import results
 */
const importSingleCollection = async (importData, mergeData) => {
  try {
    const { collection, items } = importData;
    
    // Get existing collections
    const collectionsJson = await AsyncStorage.getItem('collections');
    const existingCollections = collectionsJson ? JSON.parse(collectionsJson) : [];
    
    // Check if collection already exists
    const existingCollectionIndex = existingCollections.findIndex(c => c.id === collection.id);
    
    if (existingCollectionIndex >= 0) {
      // Collection exists
      if (!mergeData) {
        // Replace items
        await AsyncStorage.setItem(collection.id, JSON.stringify(items));
        
        return { 
          success: true, 
          message: `Collection "${collection.name}" imported successfully (replaced existing items)`,
          stats: {
            items: items.length
          }
        };
      } else {
        // Merge items
        const existingItemsJson = await AsyncStorage.getItem(collection.id);
        const existingItems = existingItemsJson ? JSON.parse(existingItemsJson) : [];
        
        // Create a map of existing items by ID
        const existingItemsMap = {};
        existingItems.forEach(item => {
          existingItemsMap[item.id] = item;
        });
        
        // Merge items
        const newItems = [...existingItems];
        items.forEach(importedItem => {
          if (!existingItemsMap[importedItem.id]) {
            // Add new item
            newItems.push(importedItem);
          }
        });
        
        // Save merged items
        await AsyncStorage.setItem(collection.id, JSON.stringify(newItems));
        
        return { 
          success: true, 
          message: `Collection "${collection.name}" imported and merged successfully`,
          stats: {
            items: items.length,
            newItems: items.filter(item => !existingItemsMap[item.id]).length
          }
        };
      }
    } else {
      // Collection doesn't exist, add it
      existingCollections.push(collection);
      await AsyncStorage.setItem('collections', JSON.stringify(existingCollections));
      
      // Save items
      await AsyncStorage.setItem(collection.id, JSON.stringify(items));
      
      return { 
        success: true, 
        message: `New collection "${collection.name}" imported successfully`,
        stats: {
          items: items.length
        }
      };
    }
  } catch (error) {
    console.error('Error importing single collection:', error);
    return { 
      success: false, 
      message: `Error importing collection: ${error.message}` 
    };
  }
};
