// src/screens/DiscoveryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import {
  getPublicCollections,
  getTrendingCollections,
  toggleCollectionLike,
  checkCollectionLiked,
  cloneCollection,
  incrementCollectionViews,
  searchUsers,
  ensureUserProfile,
} from '../utils/communityApi';

const DiscoveryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'trending', 'users'
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedCollections, setLikedCollections] = useState(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load collections based on active tab
  const loadCollections = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(0);
        setHasMore(true);
      }

      const currentPage = isRefresh ? 0 : page;
      let result;

      if (activeTab === 'recent') {
        result = await getPublicCollections(20, currentPage * 20);
      } else if (activeTab === 'trending') {
        result = await getTrendingCollections(20);
      }

      if (result.success) {
        const newCollections = result.data || [];
        
        if (isRefresh) {
          setCollections(newCollections);
        } else {
          setCollections(prev => [...prev, ...newCollections]);
        }

        setHasMore(newCollections.length === 20);
        
        // Check liked status for new collections
        if (user && newCollections.length > 0) {
          const likedStatus = new Set(likedCollections);
          for (const collection of newCollections) {
            const likedResult = await checkCollectionLiked(collection.id, user.id);
            if (likedResult.success && likedResult.liked) {
              likedStatus.add(collection.id);
            }
          }
          setLikedCollections(likedStatus);
        }

        if (!isRefresh) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    }
  }, [activeTab, page, user, likedCollections]);

  // Search users
  const searchForUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const result = await searchUsers(query.trim());
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Ensure user profile exists
      if (user?.id) {
        await ensureUserProfile(user.id, 'sfrag', 'S Frag');
      }
      
      if (activeTab === 'users') {
        setUsers([]);
      } else {
        await loadCollections(true);
      }
      setLoading(false);
    };

    loadData();
  }, [activeTab]);

  // Search users when query changes
  useEffect(() => {
    if (activeTab === 'users') {
      const timeoutId = setTimeout(() => {
        searchForUsers(searchQuery);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab, searchForUsers]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'users') {
      await searchForUsers(searchQuery);
    } else {
      await loadCollections(true);
    }
    setRefreshing(false);
  }, [activeTab, searchQuery, loadCollections, searchForUsers]);

  // Handle like toggle
  const handleLikeToggle = async (collectionId) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like collections');
      return;
    }

    try {
      const result = await toggleCollectionLike(collectionId, user.id);
      if (result.success) {
        const newLikedCollections = new Set(likedCollections);
        if (result.liked) {
          newLikedCollections.add(collectionId);
        } else {
          newLikedCollections.delete(collectionId);
        }
        setLikedCollections(newLikedCollections);

        // Update the collection's like count in the list
        setCollections(prev => prev.map(collection => 
          collection.id === collectionId 
            ? { 
                ...collection, 
                likes_count: collection.likes_count + (result.liked ? 1 : -1) 
              }
            : collection
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  // Handle collection clone
  const handleCloneCollection = async (collection) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to clone collections');
      return;
    }

    Alert.alert(
      'Clone Collection',
      `Do you want to clone "${collection.name}" to your collections?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clone',
          onPress: async () => {
            try {
              const result = await cloneCollection(collection.id, user.id);
              if (result.success) {
                Alert.alert('Success', 'Collection cloned successfully!');
              } else {
                Alert.alert('Error', 'Failed to clone collection');
              }
            } catch (error) {
              console.error('Error cloning collection:', error);
              Alert.alert('Error', 'Failed to clone collection');
            }
          }
        }
      ]
    );
  };

  // Handle collection press
  const handleCollectionPress = async (collection) => {
    // Increment view count
    if (collection.user_id !== user?.id) {
      await incrementCollectionViews(collection.id);
    }

    navigation.navigate('PublicCollectionView', { 
      collection,
      isOwner: collection.user_id === user?.id
    });
  };

  // Handle user press
  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id });
  };

  // Función para asignar íconos inteligentes basados en el nombre de la colección
  const getSmartIcon = (name) => {
    if (!name) return '📂';
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('peonza') || lowerName.includes('trompo')) return '🌀';
    if (lowerName.includes('libro') || lowerName.includes('magazine')) return '📚';
    if (lowerName.includes('coin') || lowerName.includes('moneda')) return '🪙';
    if (lowerName.includes('card') || lowerName.includes('carta')) return '🃏';
    if (lowerName.includes('music') || lowerName.includes('música')) return '🎵';
    if (lowerName.includes('photo') || lowerName.includes('foto')) return '📸';
    if (lowerName.includes('game') || lowerName.includes('juego')) return '🎮';
    if (lowerName.includes('toy') || lowerName.includes('juguete')) return '🧸';
    if (lowerName.includes('art') || lowerName.includes('arte')) return '🎨';
    if (lowerName.includes('watch') || lowerName.includes('reloj')) return '⌚';
    
    return '📂'; // Ícono genérico por defecto
  };

  // Render collection item with robust validation and description cleaning
  const renderCollectionItem = ({ item: collection }) => {
    // Validación básica - si no hay datos esenciales, no renderizar
    if (!collection || !collection.id) {
      console.warn('⚠️ Skipping collection without required data:', collection);
      return null;
    }

    // LIMPIAR LA DESCRIPCIÓN - eliminar datos extraños que no deberían estar ahí
    let cleanDescription = null;
    if (collection.description && typeof collection.description === 'string') {
      // Si la descripción contiene "userId:" o "cover:", la consideramos corrupta
      if (collection.description.includes('userId:') || collection.description.includes('cover:')) {
        console.warn('🧹 Cleaning corrupted description for collection:', collection.id);
        cleanDescription = null; // No mostrar descripción corrupta
      } else {
        cleanDescription = collection.description;
      }
    }

    // Asegurar que todos los valores sean del tipo correcto - incluir TODOS los campos necesarios
    const safeCollection = {
      id: collection.id,
      name: String(collection.name || 'Untitled Collection'),
      description: cleanDescription, // Usar la descripción limpia, no la corrupta
      username: String(collection.username || 'Anonymous'),
      likes_count: Number(collection.likes_count) || 0,
      views_count: Number(collection.views_count) || 0,
      icon: collection.icon || getSmartIcon(collection.name), // Ícono inteligente basado en el nombre
      user_id: collection.user_id,
      color: collection.color,
      image: collection.image, // Imagen real si existe
      is_public: collection.is_public,
      created_at: collection.created_at,
      updated_at: collection.updated_at,
      display_name: collection.display_name ? String(collection.display_name) : null,
      avatar_url: collection.avatar_url
    };

    return (
      <View style={[styles.collectionCard, { 
        backgroundColor: colors.card,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }]}>
        {/* Image Container - mostrar imagen real o ícono */}
        <View style={[styles.collectionImageContainer, { backgroundColor: safeCollection.color || colors.primary }]}>
          {safeCollection.image ? (
            <Image 
              source={{ uri: safeCollection.image }} 
              style={styles.collectionImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.collectionImagePlaceholder}>
              {safeCollection.icon}
            </Text>
          )}
        </View>
      
        <View style={styles.collectionContent}>
          {/* Collection Name */}
          <Text style={[styles.collectionName, { color: colors.text }]}>
            {safeCollection.name}
          </Text>
          
          {/* Description (si existe y está limpia) */}
          {safeCollection.description && (
            <Text style={[styles.collectionDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {safeCollection.description}
            </Text>
          )}
          
          {/* User info y Stats */}
          <View style={[styles.collectionMeta, { marginBottom: 16 }]}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={16} color={colors.textSecondary} />
              <Text style={[styles.username, { color: colors.textSecondary }]}>
                @{safeCollection.username}
              </Text>
            </View>
            
            <View style={styles.stats}>
              <TouchableOpacity
                style={[styles.statItem, { minHeight: 24 }]}
                onPress={() => handleLikeToggle(safeCollection.id)}
              >
                <Ionicons
                  name={likedCollections.has(safeCollection.id) ? "heart" : "heart-outline"}
                  size={18}
                  color={likedCollections.has(safeCollection.id) ? "#ff4757" : colors.textSecondary}
                />
                <Text style={[styles.statText, { color: colors.textSecondary, marginLeft: 4 }]}>
                  {safeCollection.likes_count}
                </Text>
              </TouchableOpacity>
              
              <View style={[styles.statItem, { minHeight: 24 }]}>
                <Ionicons name="eye-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary, marginLeft: 4 }]}>
                  {safeCollection.views_count}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={[styles.actions, { 
            flexDirection: 'row',
            gap: 12,
            justifyContent: 'space-between'
          }]}>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: colors.primary,
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center'
              }]}
              onPress={() => handleCollectionPress(safeCollection)}
            >
              <Text style={[styles.actionButtonText, { color: 'white', fontWeight: '600' }]}>
                View
              </Text>
            </TouchableOpacity>
            
            {safeCollection.user_id !== user?.id && (
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: colors.border,
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center'
                }]}
                onPress={() => handleCloneCollection(safeCollection)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text, fontWeight: '600' }]}>
                  Clone
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render user item
  const renderUserItem = ({ item: user }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card }]}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userAvatar}>
        <Ionicons name="person-circle" size={40} color={colors.textSecondary} />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userDisplayName, { color: colors.text }]}>
          {user.display_name || user.username}
        </Text>
        <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
          @{user.username}
        </Text>
        
        <View style={styles.userStats}>
          <Text style={[styles.userStat, { color: colors.textSecondary }]}>
            {user.followers_count || 0} followers
          </Text>
          <Text style={[styles.userStat, { color: colors.textSecondary }]}>
            {user.collections_count || 0} collections
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  // Load more collections
  const loadMore = () => {
    if (!loading && hasMore && activeTab !== 'users') {
      loadCollections(false);
    }
  };

  // Render tab button
  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && { backgroundColor: colors.primary },
        activeTab !== tab && { backgroundColor: colors.border }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? '#fff' : colors.text}
      />
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === tab ? '#fff' : colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Discover
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('recent', 'Recent', 'time-outline')}
        {renderTabButton('trending', 'Trending', 'trending-up-outline')}
        {renderTabButton('users', 'Users', 'people-outline')}
      </View>

      {/* Search bar for users */}
      {activeTab === 'users' && (
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'users' ? users : collections}
          renderItem={activeTab === 'users' ? renderUserItem : renderCollectionItem}
          keyExtractor={(item) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === 'users' 
                    ? 'people-outline' 
                    : 'library-outline'
                }
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {activeTab === 'users' 
                  ? searchQuery 
                    ? 'No users found'
                    : 'Search for users to follow'
                  : 'No collections found'
                }
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && activeTab !== 'users' ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  collectionCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  collectionImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionImagePlaceholder: {
    fontSize: 32,
  },
  collectionContent: {
    padding: 16,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  collectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  userStat: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default DiscoveryScreen;
