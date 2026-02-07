// src/components/CollectionStats.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { getCollectionPriceStats, batchUpdatePrices } from '../utils/priceHistoryService';
import { formatCurrency, formatPercentChange, testEbayAPI } from '../utils/ebayPriceService';
import { getUserStats, getCollections, getItems } from '../utils/database';

/**
 * A component that displays statistics about the user's collections
 * 
 * @param {boolean} visible - Whether the component is visible
 */
export default function CollectionStats({ visible = true }) {
  const { colors, styles: themeStyles } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalItems: 0,
    averageItemsPerCollection: 0,
    mostItemsCollection: { name: '', count: 0 },
    recentlyAdded: { name: '', date: null },
    totalValue: 0,
    // New price tracking stats
    totalPurchaseValue: 0,
    totalMarketValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    trackingItemCount: 0,
    bestPerformer: null,
    worstPerformer: null,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [testingAPI, setTestingAPI] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setStats({
          totalCollections: 0,
          totalItems: 0,
          averageItemsPerCollection: 0,
          mostItemsCollection: { name: '', count: 0 },
          recentlyAdded: { name: '', date: null },
          totalValue: 0,
        });
        setLoading(false);
        return;
      }

      // Cargar colecciones desde Supabase
      const collections = await getCollections(user.id);
      
      if (collections.length === 0) {
        setStats({
          totalCollections: 0,
          totalItems: 0,
          averageItemsPerCollection: 0,
          mostItemsCollection: { name: '', count: 0 },
          recentlyAdded: { name: '', date: null },
          totalValue: 0,
        });
        setLoading(false);
        return;
      }

      // Calculate statistics
      let totalItems = 0;
      let mostItems = { name: '', count: 0 };
      let recentlyAdded = { name: '', date: null };
      let totalValue = 0;
      let allItems = []; // Collect all items for price tracking analysis

      // Process each collection
      for (const collection of collections) {
        // Get items in this collection desde Supabase
        const items = await getItems(collection.id, user.id);
        
        // Add items to global list for price tracking
        allItems.push(...items);
        
        // Update total items
        totalItems += items.length;
        
        // Check if this collection has the most items
        if (items.length > mostItems.count) {
          mostItems = { name: collection.name, count: items.length };
        }
        
        // Check if this is the most recently added collection
        const collectionDate = collection.created_at 
          ? new Date(collection.created_at) 
          : null;
          
        if (collectionDate && (!recentlyAdded.date || collectionDate > recentlyAdded.date)) {
          recentlyAdded = { name: collection.name, date: collectionDate };
        }
        
        // Calculate total value of items
        for (const item of items) {
          if (item.price) {
            // Handle European decimal format (comma as decimal separator)
            let priceStr = item.price.toString();
            
            // Remove currency symbols and whitespace
            priceStr = priceStr.replace(/[€$£¥₹]/g, '').trim();
            
            // Convert European comma decimal to dot decimal
            // If there's a comma, assume it's the decimal separator
            if (priceStr.includes(',')) {
              priceStr = priceStr.replace(',', '.');
            }
            
            // Remove any remaining non-numeric characters except dots and hyphens
            priceStr = priceStr.replace(/[^0-9.-]/g, '');
            
            const price = parseFloat(priceStr);
            if (!isNaN(price)) {
              totalValue += price;
            }
          }
        }
      }

      // Calculate average items per collection
      const averageItemsPerCollection = collections.length > 0 
        ? (totalItems / collections.length).toFixed(1) 
        : 0;

      // Get price tracking statistics
      const priceStats = getCollectionPriceStats(allItems);

      // Update state with calculated statistics
      setStats({
        totalCollections: collections.length,
        totalItems,
        averageItemsPerCollection,
        mostItemsCollection: mostItems,
        recentlyAdded,
        totalValue: totalValue.toFixed(2),
        // Price tracking stats
        totalPurchaseValue: priceStats.totalPurchaseValue,
        totalMarketValue: priceStats.totalMarketValue,
        totalGainLoss: priceStats.totalGainLoss,
        totalGainLossPercent: priceStats.totalGainLossPercent,
        trackingItemCount: priceStats.trackingItemCount,
        bestPerformer: priceStats.bestPerformer,
        worstPerformer: priceStats.worstPerformer,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAllPrices = async () => {
    setUpdating(true);
    try {
      if (!user?.id) {
        return;
      }

      // Load all collections desde Supabase
      const collections = await getCollections(user.id);
      
      for (const collection of collections) {
        const items = await getItems(collection.id, user.id);
        
        // Update prices for items that have eBay search terms
        await batchUpdatePrices(user.id, collection.id, items, (progress) => {
          console.log(`Updating ${progress.currentItem}: ${progress.completed}/${progress.total}`);
        });
      }
      
      // Reload stats after updating
      await loadStats();
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setUpdating(false);
    }
  };

  const testAPI = async () => {
    setTestingAPI(true);
    try {
      const result = await testEbayAPI('iPhone 13');
      alert(result.message);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    } finally {
      setTestingAPI(false);
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Collection Statistics</Text>
        <View style={styles.buttonContainer}>
          {/* API Test Button - Temporary */}
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.info, opacity: testingAPI ? 0.7 : 1 }]}
            onPress={testAPI}
            disabled={testingAPI}
          >
            <Text style={styles.testButtonText}>
              {testingAPI ? '🧪 Testing...' : '🧪 Test API'}
            </Text>
          </TouchableOpacity>
          
          {stats.trackingItemCount > 0 && (
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.primary, opacity: updating ? 0.7 : 1 }]}
              onPress={updateAllPrices}
              disabled={updating}
            >
              <Text style={styles.updateButtonText}>
                {updating ? '🔄 Updating...' : '📊 Update Prices'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.statValue}>{stats.totalCollections}</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.info }]}>
          <Text style={styles.statValue}>{stats.averageItemsPerCollection}</Text>
          <Text style={styles.statLabel}>Avg Items/Collection</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.success }]}>
          <Text style={styles.statValue}>{stats.totalValue}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Price Tracking Section */}
      {stats.trackingItemCount > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💹 Investment Tracking ({stats.trackingItemCount} items)
          </Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.statValue}>{formatCurrency(stats.totalPurchaseValue)}</Text>
              <Text style={styles.statLabel}>Purchase Value</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: stats.totalGainLoss >= 0 ? colors.success : colors.danger }]}>
              <Text style={styles.statValue}>{formatCurrency(stats.totalMarketValue)}</Text>
              <Text style={styles.statLabel}>Market Value</Text>
            </View>
          </View>
          
          <View style={[styles.performanceCard, { 
            borderColor: stats.totalGainLoss >= 0 ? colors.success : colors.danger,
            backgroundColor: colors.background 
          }]}>
            <Text style={[styles.performanceValue, { 
              color: stats.totalGainLoss >= 0 ? colors.success : colors.danger 
            }]}>
              {formatCurrency(stats.totalGainLoss)} {formatPercentChange(stats.totalGainLossPercent)}
            </Text>
            <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>
              Total {stats.totalGainLoss >= 0 ? 'Gain' : 'Loss'}
            </Text>
          </View>
          
          {stats.bestPerformer && (
            <View style={[styles.infoCard, { borderColor: colors.success }]}>
              <Text style={[styles.infoLabel, { color: colors.success }]}>
                🚀 Best Performer:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {stats.bestPerformer.name} {formatPercentChange(stats.bestPerformer.gainLossPercent)}
              </Text>
            </View>
          )}
          
          {stats.worstPerformer && (
            <View style={[styles.infoCard, { borderColor: colors.danger }]}>
              <Text style={[styles.infoLabel, { color: colors.danger }]}>
                📉 Needs Attention:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {stats.worstPerformer.name} {formatPercentChange(stats.worstPerformer.gainLossPercent)}
              </Text>
            </View>
          )}
        </>
      )}
      
      {stats.mostItemsCollection.name ? (
        <View style={[styles.infoCard, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            📚 Most Items:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {stats.mostItemsCollection.name} ({stats.mostItemsCollection.count} items)
          </Text>
        </View>
      ) : null}
      
      {stats.recentlyAdded.name ? (
        <View style={[styles.infoCard, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            ⏰ Recently Added:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {stats.recentlyAdded.name}
            {stats.recentlyAdded.date ? 
              ` (${stats.recentlyAdded.date.toLocaleDateString()})` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  updateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  testButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  performanceCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
