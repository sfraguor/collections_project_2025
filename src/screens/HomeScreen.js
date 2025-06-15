import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CollectionItem from '../components/CollectionItem';
import SortModal from '../components/SortModal';

const STORAGE_KEY = 'collections';

const HomeScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [totalItems, setTotalItems] = useState({});

  useEffect(() => {
    const loadCollections = async () => {
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
    <View style={styles.container}>
      <Text style={styles.header}>My Collections</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={sortedCollections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No collections match your search' : 'No collections yet.'}
          </Text>
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCollection')}
      >
        <Text style={styles.addButtonText}>+ Add New Collection</Text>
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
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 16, 
    paddingTop: 24 
  },
  header: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 20, 
    color: '#222', 
    textAlign: 'center' 
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
    justifyContent: 'center',
  },
  sortButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingBottom: 12,
  },
  coverImage: { 
    width: '100%', 
    height: 160 
  },
  cardTextContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#222' 
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f33',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default HomeScreen;
