/**
 * Price History Management Service
 * 
 * Handles storing, retrieving and managing price history data
 * for collection items with market price tracking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateItemMarketPrice } from './ebayPriceService';

/**
 * Update price history for an item and save to storage
 * @param {string} userId - User ID
 * @param {string} collectionId - Collection ID  
 * @param {Object} item - Item to update
 * @returns {Promise<Object>} Updated item with new price history
 */
export const updateItemPriceHistory = async (userId, collectionId, item) => {
  try {
    // Get updated market price from eBay
    const updatedItem = await updateItemMarketPrice(item);
    
    // Save updated item to storage
    await saveUpdatedItemToStorage(userId, collectionId, updatedItem);
    
    return updatedItem;
  } catch (error) {
    console.error('Error updating price history:', error);
    throw error;
  }
};

/**
 * Save updated item with price history to AsyncStorage
 * @param {string} userId - User ID
 * @param {string} collectionId - Collection ID
 * @param {Object} updatedItem - Item with updated price data
 */
const saveUpdatedItemToStorage = async (userId, collectionId, updatedItem) => {
  try {
    const storageKey = `${userId || 'guest'}_${collectionId}`;
    const existing = await AsyncStorage.getItem(storageKey);
    const items = existing ? JSON.parse(existing) : [];
    
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error saving updated item:', error);
    throw error;
  }
};

/**
 * Get price history for a specific item
 * @param {Object} item - Item object
 * @param {number} limit - Maximum number of history entries to return
 * @returns {Array} Array of price history entries
 */
export const getItemPriceHistory = (item, limit = 20) => {
  const history = item.price_history || [];
  return history
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
    .slice(0, limit);
};

/**
 * Get price trend analysis for an item
 * @param {Object} item - Item object
 * @returns {Object} Price trend analysis
 */
export const getPriceTrend = (item) => {
  const history = getItemPriceHistory(item, 10);
  
  if (history.length < 2) {
    return {
      trend: 'insufficient-data',
      direction: null,
      changePercent: 0,
      recentPrices: history
    };
  }

  const recent = history[0].price; // Most recent price
  const previous = history[1].price; // Previous price
  const oldest = history[history.length - 1].price; // Oldest available price
  
  // Calculate short-term trend (last 2 data points)
  const shortTermChange = ((recent - previous) / previous) * 100;
  
  // Calculate long-term trend (recent vs oldest)
  const longTermChange = ((recent - oldest) / oldest) * 100;
  
  let trend = 'stable';
  if (Math.abs(shortTermChange) > 5) { // More than 5% change
    trend = shortTermChange > 0 ? 'increasing' : 'decreasing';
  }
  
  return {
    trend,
    direction: shortTermChange > 0 ? 'up' : shortTermChange < 0 ? 'down' : 'stable',
    shortTermChangePercent: shortTermChange,
    longTermChangePercent: longTermChange,
    recentPrices: history.slice(0, 5),
    dataPoints: history.length
  };
};

/**
 * Check if item price update is needed
 * @param {Object} item - Item object
 * @param {number} hoursThreshold - Hours since last update to trigger refresh
 * @returns {boolean} Whether price update is needed
 */
export const isPriceUpdateNeeded = (item, hoursThreshold = 24) => {
  if (!item.last_price_update) return true;
  
  const lastUpdate = new Date(item.last_price_update);
  const now = new Date();
  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  
  return hoursSinceUpdate >= hoursThreshold;
};

/**
 * Batch update prices for multiple items
 * @param {string} userId - User ID
 * @param {string} collectionId - Collection ID
 * @param {Array} items - Array of items to update
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Array>} Array of updated items
 */
export const batchUpdatePrices = async (userId, collectionId, items, onProgress) => {
  const itemsToUpdate = items.filter(item => 
    item.ebay_search_terms && item.ebay_search_terms.trim() && isPriceUpdateNeeded(item)
  );
  
  if (itemsToUpdate.length === 0) {
    return items; // No items need updating
  }
  
  const updatedItems = [];
  let completed = 0;
  
  for (const item of itemsToUpdate) {
    try {
      const updatedItem = await updateItemPriceHistory(userId, collectionId, item);
      updatedItems.push(updatedItem);
      completed++;
      
      if (onProgress) {
        onProgress({
          completed,
          total: itemsToUpdate.length,
          currentItem: item.name
        });
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to update price for ${item.name}:`, error);
      // Continue with other items even if one fails
      updatedItems.push(item); // Keep original item
    }
  }
  
  // Return all items with updates applied
  return items.map(item => {
    const updated = updatedItems.find(updated => updated.id === item.id);
    return updated || item;
  });
};

/**
 * Get collection-wide price statistics
 * @param {Array} items - Array of items in collection
 * @returns {Object} Collection price statistics
 */
export const getCollectionPriceStats = (items) => {
  const itemsWithPrices = items.filter(item => 
    item.purchase_price && item.current_market_price && 
    !isNaN(parseFloat(item.purchase_price)) && !isNaN(parseFloat(item.current_market_price))
  );
  
  if (itemsWithPrices.length === 0) {
    return {
      totalPurchaseValue: 0,
      totalMarketValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      itemCount: 0,
      trackingItemCount: 0,
      bestPerformer: null,
      worstPerformer: null
    };
  }
  
  let totalPurchaseValue = 0;
  let totalMarketValue = 0;
  let bestPerformancePercent = -Infinity;
  let worstPerformancePercent = Infinity;
  let bestPerformer = null;
  let worstPerformer = null;
  
  itemsWithPrices.forEach(item => {
    const purchasePrice = parseFloat(item.purchase_price);
    const marketPrice = parseFloat(item.current_market_price);
    
    totalPurchaseValue += purchasePrice;
    totalMarketValue += marketPrice;
    
    const performancePercent = ((marketPrice - purchasePrice) / purchasePrice) * 100;
    
    if (performancePercent > bestPerformancePercent) {
      bestPerformancePercent = performancePercent;
      bestPerformer = {
        name: item.name,
        purchasePrice,
        marketPrice,
        gainLossPercent: performancePercent
      };
    }
    
    if (performancePercent < worstPerformancePercent) {
      worstPerformancePercent = performancePercent;
      worstPerformer = {
        name: item.name,
        purchasePrice,
        marketPrice,
        gainLossPercent: performancePercent
      };
    }
  });
  
  const totalGainLoss = totalMarketValue - totalPurchaseValue;
  const totalGainLossPercent = totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;
  
  return {
    totalPurchaseValue,
    totalMarketValue,
    totalGainLoss,
    totalGainLossPercent,
    itemCount: items.length,
    trackingItemCount: itemsWithPrices.length,
    bestPerformer,
    worstPerformer
  };
};

/**
 * Export price history data for external analysis
 * @param {Array} items - Array of items
 * @returns {string} CSV formatted price history data
 */
export const exportPriceHistoryCSV = (items) => {
  const headers = ['Item Name', 'Purchase Price', 'Current Market Price', 'Gain/Loss $', 'Gain/Loss %', 'Last Updated', 'eBay Search Terms'];
  const rows = [headers.join(',')];
  
  items.forEach(item => {
    if (item.purchase_price && item.current_market_price) {
      const purchasePrice = parseFloat(item.purchase_price);
      const marketPrice = parseFloat(item.current_market_price);
      const gainLoss = marketPrice - purchasePrice;
      const gainLossPercent = (gainLoss / purchasePrice) * 100;
      
      const row = [
        `"${item.name}"`,
        purchasePrice.toFixed(2),
        marketPrice.toFixed(2),
        gainLoss.toFixed(2),
        gainLossPercent.toFixed(2),
        item.last_price_update || 'N/A',
        `"${item.ebay_search_terms || 'N/A'}"`
      ];
      
      rows.push(row.join(','));
    }
  });
  
  return rows.join('\n');
};