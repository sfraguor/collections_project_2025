// src/components/CollectionStats.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/theme';

/**
 * A component that displays statistics about the user's collections
 * 
 * @param {boolean} visible - Whether the component is visible
 */
export default function CollectionStats({ visible = true }) {
  const { colors, styles: themeStyles } = useTheme();
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalItems: 0,
    averageItemsPerCollection: 0,
    mostItemsCollection: { name: '', count: 0 },
    recentlyAdded: { name: '', date: null },
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load all collections
      const collectionsJson = await AsyncStorage.getItem('collections');
      const collections = collectionsJson ? JSON.parse(collectionsJson) : [];
      
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

      // Process each collection
      for (const collection of collections) {
        // Get items in this collection
        const itemsJson = await AsyncStorage.getItem(collection.id);
        const items = itemsJson ? JSON.parse(itemsJson) : [];
        
        // Update total items
        totalItems += items.length;
        
        // Check if this collection has the most items
        if (items.length > mostItems.count) {
          mostItems = { name: collection.name, count: items.length };
        }
        
        // Check if this is the most recently added collection
        const collectionDate = collection.createdAt 
          ? new Date(collection.createdAt) 
          : null;
          
        if (collectionDate && (!recentlyAdded.date || collectionDate > recentlyAdded.date)) {
          recentlyAdded = { name: collection.name, date: collectionDate };
        }
        
        // Calculate total value of items
        for (const item of items) {
          if (item.price) {
            // Remove currency symbols and convert to number
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
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

      // Update state with calculated statistics
      setStats({
        totalCollections: collections.length,
        totalItems,
        averageItemsPerCollection,
        mostItemsCollection: mostItems,
        recentlyAdded,
        totalValue: totalValue.toFixed(2),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <Text style={[styles.title, { color: colors.text }]}>Collection Statistics</Text>
      
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
      
      {stats.mostItemsCollection.name ? (
        <View style={[styles.infoCard, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Most Items:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {stats.mostItemsCollection.name} ({stats.mostItemsCollection.count} items)
          </Text>
        </View>
      ) : null}
      
      {stats.recentlyAdded.name ? (
        <View style={[styles.infoCard, { borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Recently Added:
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
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
