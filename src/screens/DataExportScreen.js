// src/screens/DataExportScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/theme';
import {
  exportAllData,
  exportCollection,
  shareExportedFile,
  importData,
} from '../utils/dataExport';

const DataExportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [mergeData, setMergeData] = useState(true);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalItems: 0,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      // Load collections
      const collectionsJson = await AsyncStorage.getItem('collections');
      const collectionsData = collectionsJson ? JSON.parse(collectionsJson) : [];
      setCollections(collectionsData);

      // Calculate stats
      let totalItems = 0;
      for (const collection of collectionsData) {
        const itemsJson = await AsyncStorage.getItem(collection.id);
        const items = itemsJson ? JSON.parse(itemsJson) : [];
        totalItems += items.length;
      }

      setStats({
        totalCollections: collectionsData.length,
        totalItems,
      });
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const fileUri = await exportAllData();
      await shareExportedFile(fileUri);
    } catch (error) {
      console.error('Error exporting all data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCollection = async (collectionId, collectionName) => {
    setExporting(true);
    try {
      const fileUri = await exportCollection(collectionId, collectionName);
      await shareExportedFile(fileUri);
    } catch (error) {
      console.error('Error exporting collection:', error);
      Alert.alert('Error', 'Failed to export collection');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importData(mergeData);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        // Reload collections after import
        await loadCollections();
      } else {
        Alert.alert('Import Failed', result.message);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Data Export & Import
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              {stats.totalCollections} collections, {stats.totalItems} items
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Export Options
            </Text>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleExportAll}
              disabled={exporting || collections.length === 0}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Export All Data</Text>
              )}
            </TouchableOpacity>
            
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Export Individual Collections:
            </Text>
            
            {collections.length > 0 ? (
              collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[styles.collectionButton, { backgroundColor: colors.secondary }]}
                  onPress={() => handleExportCollection(collection.id, collection.name)}
                  disabled={exporting}
                >
                  <Text style={styles.buttonText}>{collection.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No collections to export
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Import Options
            </Text>
            
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Merge with existing data
              </Text>
              <Switch
                value={mergeData}
                onValueChange={setMergeData}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={mergeData ? colors.card : colors.card}
              />
            </View>
            
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              {mergeData
                ? 'New collections and items will be added to your existing data.'
                : 'Warning: This will replace all your existing data!'}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: mergeData ? colors.primary : colors.danger,
                },
              ]}
              onPress={handleImport}
              disabled={importing}
            >
              {importing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Import Data</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
});

export default DataExportScreen;
