// src/screens/UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import CollectionItem from '../components/CollectionItem';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  checkUserFollowed,
  getUserCollections,
} from '../utils/communityApi';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
    loadUserCollections();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const result = await getUserProfile(userId);
      if (result.success) {
        setProfile(result.data);
        
        // Check if current user follows this user
        if (currentUser && !isOwnProfile) {
          const followResult = await checkUserFollowed(userId, currentUser.id);
          if (followResult.success) {
            setIsFollowing(followResult.following);
          }
        }
      } else {
        Alert.alert('Error', 'User not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadUserCollections = async () => {
    try {
      const result = await getUserCollections(userId);
      if (result.success) {
        setCollections(result.data || []);
      }
    } catch (error) {
      console.error('Error loading user collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    if (isOwnProfile) {
      return;
    }

    setFollowLoading(true);
    try {
      let result;
      if (isFollowing) {
        result = await unfollowUser(userId, currentUser.id);
      } else {
        result = await followUser(userId, currentUser.id);
      }

      if (result.success) {
        setIsFollowing(!isFollowing);
        // Update follower count in profile
        setProfile(prev => ({
          ...prev,
          followers_count: prev.followers_count + (isFollowing ? -1 : 1)
        }));
      } else {
        Alert.alert('Error', 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('PublicCollectionView', { 
      collection,
      isOwner: collection.user_id === currentUser?.id
    });
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.collectionCard, { backgroundColor: colors.card }]}
      onPress={() => handleCollectionPress(item)}
    >
      <View style={styles.collectionHeader}>
        <View style={[styles.collectionIcon, { backgroundColor: item.color || colors.primary }]}>
          <Text style={styles.collectionIconText}>
            {item.icon || '📦'}
          </Text>
        </View>
        <View style={styles.collectionInfo}>
          <Text style={[styles.collectionName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={[styles.collectionDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.collectionStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {item.likes_count || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {item.views_count || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="person-circle" size={80} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          User not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: colors.text }]}>
                {profile.display_name || profile.username || 'Anonymous User'}
              </Text>
              
              {profile.username && (
                <Text style={[styles.username, { color: colors.textSecondary }]}>
                  @{profile.username}
                </Text>
              )}
              
              {profile.bio && (
                <Text style={[styles.bio, { color: colors.text }]}>
                  {profile.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profile.collections_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Collections
              </Text>
            </View>
            
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profile.followers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Followers
              </Text>
            </View>
            
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profile.following_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Following
              </Text>
            </View>
          </View>

          {/* Follow Button */}
          {currentUser && !isOwnProfile && (
            <TouchableOpacity
              style={[styles.followButton, {
                backgroundColor: isFollowing ? colors.border : colors.primary
              }]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? colors.text : "#fff"} />
              ) : (
                <>
                  <Ionicons 
                    name={isFollowing ? "person-remove" : "person-add"} 
                    size={20} 
                    color={isFollowing ? colors.text : "#fff"} 
                  />
                  <Text style={[styles.followButtonText, {
                    color: isFollowing ? colors.text : "#fff"
                  }]}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Edit Profile Button for own profile */}
          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.border }]}
              onPress={() => {
                // TODO: Navigate to edit profile screen
                Alert.alert('Coming Soon', 'Profile editing will be available soon');
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Collections Section */}
        <View style={styles.collectionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Public Collections
            </Text>
            <Text style={[styles.collectionsCount, { color: colors.textSecondary }]}>
              {collections.length}
            </Text>
          </View>

          {collectionsLoading ? (
            <View style={styles.collectionsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading collections...
              </Text>
            </View>
          ) : collections.length > 0 ? (
            <FlatList
              data={collections}
              renderItem={renderCollectionItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyCollections}>
              <Ionicons name="albums-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isOwnProfile ? "You haven't made any collections public yet" : "No public collections yet"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  collectionsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  collectionsCount: {
    fontSize: 14,
  },
  collectionsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyCollections: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  collectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionIconText: {
    fontSize: 20,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  collectionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});

export default UserProfileScreen;