import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CollectionItem from '../components/CollectionItem';
import SortModal from '../components/SortModal';
import ThemeToggle from '../components/ThemeToggle';
import CollectionStats from '../components/CollectionStats';
import { useTheme } from '../theme/theme';
import { 
  AddIcon, 
  SortIcon, 
  SearchIcon, 
  BackupIcon, 
  StatsIcon 
} from '../components/AppIcons';

const STORAGE_KEY = 'collections';

const HomeScreen = ({ navigation }) => {
  const { theme, colors, styles: themeStyles } = useTheme();
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [totalItems, setTotalItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        setCollections(json ? JSON.parse(json) : []);
        
        // Load item counts for each collection
        const itemCounts = {};
        const collectionList = json ? JSON.parse(json) : [];
        
        for (const collection of collectionList) {
          const itemsJson = await AsyncStorage.getItem(collection.id);
          const items = itemsJson ? JSON.parse(itemsJson) : [];
          itemCounts[collection.id] = items.length;
        }
        
        setTotalItems(itemCounts);
      } catch (e) {
        Alert.alert('Error', 'Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadCollections);
    loadCollections();
    return unsubscribe;
  }, [navigation]);
  
  // Filter collections based on search query
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort collections based on sortBy and sortOrder
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    let aValue, bValue;
    
    if (sortBy === 'name') {
      aValue = a.name || '';
      bValue = b.name || '';
    } else if (sortBy === 'itemCount') {
      aValue = totalItems[a.id] || 0;
      bValue = totalItems[b.id] || 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const deleteCollection = (id) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? All items inside will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar colección de la lista
              const filtered = collections.filter((c) => c.id !== id);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              
              // También elimina los items guardados bajo la key con id de colección
              await AsyncStorage.removeItem(id);

              setCollections(filtered);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete collection');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Sort options for the SortModal component
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'itemCount', label: 'Item Count' },
  ];

  // Handle sort option selection
  const handleSortSelect = (value, order) => {
    setSortBy(value);
    setSortOrder(order);
    setShowSortModal(false);
  };

  const renderItem = ({ item }) => (
    <CollectionItem
      collection={item}
      itemCount={totalItems[item.id] || 0}
      onPress={() =>
        navigation.navigate('Collection', {
          collectionId: item.id,
          collectionName: item.name,
        })
      }
      onEdit={() =>
        navigation.navigate('EditCollection', {
          collectionId: item.id,
        })
      }
      onDelete={() => deleteCollection(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>My Collections</Text>
      </LinearGradient>
      
      <View style={styles.headerButtons}>
        <ThemeToggle />
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowStats(!showStats)}
          >
            <StatsIcon color="#FFFFFF" size={18} />
            <Text style={styles.headerButtonText}>
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('DataExport')}
          >
            <BackupIcon color="#FFFFFF" size={18} />
            <Text style={styles.headerButtonText}>Backup</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <CollectionStats visible={showStats} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <SearchIcon color={colors.placeholder} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { 
              color: colors.text
            }]}
            placeholder="Search collections..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.sortButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowSortModal(true)}
        >
          <SortIcon color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={sortedCollections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No collections match your search' : 'No collections yet.'}
            </Text>
          }
        />
      )}
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddCollection')}
      >
        <AddIcon color="#FFFFFF" size={24} style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>Add New Collection</Text>
      </TouchableOpacity>
      
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        options={sortOptions}
        onSelect={handleSortSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 0 
  },
  headerGradient: {
    paddingVertical: 30,
    paddingTop: 40,
    marginHorizontal: -16,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: { 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginLeft: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
  },
  sortButton: {
    borderRadius: 12,
    width: 48,
    height: 48,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
