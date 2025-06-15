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
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';
import SortModal from '../components/SortModal';

const CollectionScreen = ({ route, navigation }) => {
  const { collectionId } = route.params;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const data = await AsyncStorage.getItem(collectionId);
      setItems(data ? JSON.parse(data) : []);
    });
    return unsubscribe;
  }, [navigation, collectionId]);

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.condition && item.condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort items based on sortBy and sortOrder
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    // Handle numeric sorting for price
    if (sortBy === 'price') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    // Handle date sorting
    if (sortBy === 'purchaseDate' || sortBy === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const deleteItem = async (id) => {
    const filtered = items.filter((i) => i.id !== id);
    setItems(filtered);
    await AsyncStorage.setItem(collectionId, JSON.stringify(filtered));
  };

  const confirmDelete = (id) => {
    Alert.alert('Delete item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const viewItemDetails = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const renderItem = ({ item }) => (
    <ItemCard
      item={item}
      onPress={() => viewItemDetails(item)}
      onEdit={() => navigation.navigate('EditItem', { collectionId, item })}
      onDelete={() => confirmDelete(item.id)}
    />
  );

  // Sort options for the SortModal component
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'purchaseDate', label: 'Purchase Date' },
    { value: 'condition', label: 'Condition' },
    { value: 'createdAt', label: 'Date Added' },
  ];

  // Handle sort option selection
  const handleSortSelect = (value, order) => {
    setSortBy(value);
    setSortOrder(order);
    setShowSortModal(false);
  };

  // Handle item edit
  const handleItemEdit = () => {
    setShowItemModal(false);
    navigation.navigate('EditItem', {
      collectionId,
      item: selectedItem,
    });
  };

  // Handle item delete
  const handleItemDelete = () => {
    setShowItemModal(false);
    confirmDelete(selectedItem.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
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
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No items match your search' : 'No items yet'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('AddItem', {
            collectionId,
          })
        }
      >
        <Text style={styles.fabText}>+ Add Item</Text>
      </TouchableOpacity>
      
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        options={sortOptions}
        onSelect={handleSortSelect}
      />
      
      <ItemDetailModal
        item={selectedItem}
        visible={showItemModal}
        onClose={() => setShowItemModal(false)}
        onEdit={handleItemEdit}
        onDelete={handleItemDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 16,
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
    paddingBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: 160,
  },
  noImageContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  cardTextContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 4,
  },
  cardCondition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f33',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    backgroundColor: '#222',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CollectionScreen;
