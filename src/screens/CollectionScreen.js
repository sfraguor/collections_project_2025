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
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';
import SortModal from '../components/SortModal';
import ShareCollectionModal from '../components/ShareCollectionModal';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { 
  AddIcon, 
  SortIcon, 
  SearchIcon, 
  ShareIcon, 
  FilterIcon,
  TagIcon,
  ClearIcon
} from '../components/AppIcons';

// Helper function to get item storage key with user ID
const getItemStorageKey = (userId, collectionId) => `${userId || 'guest'}_${collectionId}`;

const CollectionScreen = ({ route, navigation }) => {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const { collectionId } = route.params;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const itemStorageKey = getItemStorageKey(user?.id, collectionId);
        const data = await AsyncStorage.getItem(itemStorageKey);
        const itemsData = data ? JSON.parse(data) : [];
        setItems(itemsData);
        
        // Extract all unique tags from items
        const allTags = new Set();
        itemsData.forEach(item => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));
      } catch (error) {
        Alert.alert('Error', 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', loadItems);
    loadItems();
    return unsubscribe;
  }, [navigation, collectionId, user?.id]);

  // Filter items based on search query and selected tags
  const filteredItems = items.filter(item => {
    // Text search filter
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.condition && item.condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Tag filter
    const matchesTags = selectedTags.length === 0 || 
      (item.tags && selectedTags.every(tag => item.tags.includes(tag)));
    
    return matchesSearch && matchesTags;
  });

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
    const itemStorageKey = getItemStorageKey(user?.id, collectionId);
    await AsyncStorage.setItem(itemStorageKey, JSON.stringify(filtered));
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.headerActions}>
        <LinearGradient
          colors={[colors.secondary, colors.secondaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareButtonGradient}
        >
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShowShareModal(true)}
          >
            <ShareIcon color="#FFFFFF" size={18} style={styles.shareButtonIcon} />
            <Text style={styles.shareButtonText}>Share Collection</Text>
          </TouchableOpacity>
        </LinearGradient>
        
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
              placeholder="Search items..."
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
      </View>
      
      {availableTags.length > 0 && (
        <View style={styles.tagFilterContainer}>
          <TouchableOpacity
            style={[styles.tagFilterButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowTagFilter(!showTagFilter)}
          >
            <TagIcon color="#FFFFFF" size={18} style={styles.tagFilterIcon} />
            <Text style={styles.tagFilterButtonText}>
              {selectedTags.length > 0 
                ? `Filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` 
                : 'Filter by Tags'}
            </Text>
          </TouchableOpacity>
          
          {showTagFilter && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tagsScrollView}
              contentContainerStyle={styles.tagsContainer}
            >
              {availableTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    { 
                      backgroundColor: selectedTags.includes(tag) 
                        ? colors.primary 
                        : colors.border
                    }
                  ]}
                  onPress={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                >
                  <Text 
                    style={[
                      styles.tagChipText,
                      { color: selectedTags.includes(tag) ? '#fff' : colors.text }
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {selectedTags.length > 0 && (
                <TouchableOpacity
                  style={[styles.clearTagsButton, { backgroundColor: colors.danger }]}
                  onPress={() => setSelectedTags([])}
                >
                  <ClearIcon color="#FFFFFF" size={14} style={styles.clearTagsIcon} />
                  <Text style={styles.clearTagsButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No items match your search' : 'No items yet'}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() =>
          navigation.navigate('AddItem', {
            collectionId,
          })
        }
      >
        <AddIcon color="#FFFFFF" size={24} />
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
      
      <ShareCollectionModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        collection={route.params}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerActions: {
    marginBottom: 16,
  },
  shareButtonGradient: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  shareButton: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  shareButtonIcon: {
    marginRight: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
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
  tagFilterContainer: {
    marginBottom: 16,
  },
  tagFilterButton: {
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tagFilterIcon: {
    marginRight: 6,
  },
  tagFilterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  tagsScrollView: {
    maxHeight: 40,
  },
  tagsContainer: {
    paddingRight: 8,
    paddingBottom: 4,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tagChipText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  clearTagsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  clearTagsIcon: {
    marginRight: 4,
  },
  clearTagsButtonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
  },
});

export default CollectionScreen;
