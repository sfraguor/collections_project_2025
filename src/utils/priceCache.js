/**
 * eBay API Cache System
 * 
 * Caches eBay API responses to minimize API calls and avoid rate limiting
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'ebay_cache_';

/**
 * Generate cache key for search terms and currency
 * @param {string} searchTerms - Search terms
 * @param {string} currency - Currency
 * @returns {string} Cache key
 */
const generateCacheKey = (searchTerms, currency) => {
  const normalizedTerms = searchTerms.toLowerCase().trim().replace(/\s+/g, '_');
  return `${CACHE_KEY_PREFIX}${normalizedTerms}_${currency}`;
};

/**
 * Get cached price data
 * @param {string} searchTerms - Search terms
 * @param {string} currency - Currency
 * @returns {Object|null} Cached data or null if not found/expired
 */
export const getCachedPrice = async (searchTerms, currency) => {
  try {
    const cacheKey = generateCacheKey(searchTerms, currency);
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const parsed = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - parsed.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    console.log(`📦 Using cached price data for: ${searchTerms} (${currency})`);
    return parsed.data;
    
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Cache price data
 * @param {string} searchTerms - Search terms
 * @param {string} currency - Currency
 * @param {Object} data - Price data to cache
 */
export const cachePrice = async (searchTerms, currency, data) => {
  try {
    const cacheKey = generateCacheKey(searchTerms, currency);
    const cacheData = {
      timestamp: Date.now(),
      data: data,
      searchTerms,
      currency
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`💾 Cached price data for: ${searchTerms} (${currency})`);
    
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

/**
 * Clear old cache entries
 */
export const clearExpiredCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    const now = Date.now();
    
    for (const key of cacheKeys) {
      try {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (now - parsed.timestamp > CACHE_DURATION) {
            await AsyncStorage.removeItem(key);
            console.log(`🗑️ Removed expired cache: ${key}`);
          }
        }
      } catch (error) {
        // Remove corrupted cache entries
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    let totalEntries = 0;
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();
    
    for (const key of cacheKeys) {
      try {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          totalEntries++;
          const parsed = JSON.parse(cachedData);
          if (now - parsed.timestamp > CACHE_DURATION) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        }
      } catch (error) {
        expiredEntries++;
      }
    }
    
    return {
      total: totalEntries,
      valid: validEntries,
      expired: expiredEntries
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { total: 0, valid: 0, expired: 0 };
  }
};

/**
 * Clear cache for specific search terms and currency
 */
export const clearSpecificCache = async (searchTerms, currency) => {
  try {
    const cacheKey = generateCacheKey(searchTerms, currency);
    await AsyncStorage.removeItem(cacheKey);
    console.log(`🗑️ Cleared cache for: ${searchTerms} (${currency})`);
    return true;
  } catch (error) {
    console.error('Error clearing specific cache:', error);
    return false;
  }
};

/**
 * Clear all price cache
 */
export const clearAllCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`🗑️ Cleared all price cache (${cacheKeys.length} entries)`);
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

export default {
  getCachedPrice,
  cachePrice,
  clearExpiredCache,
  clearSpecificCache,
  clearAllCache,
  getCacheStats
};