// src/screens/PublicCollectionViewScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import {
  toggleCollectionLike,
  checkCollectionLiked,
  cloneCollection,
  incrementCollectionViews,
  addCollectionComment,
  getCollectionComments,
  getCollectionItems,
} from '../utils/communityApi';

const PublicCollectionViewScreen = ({ route, navigation }) => {
  const { collection: initialCollection, isOwner = false } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [collection, setCollection] = useState(initialCollection);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [items, setItems] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Increment view count if not owner
      if (!isOwner && user?.id !== collection.user_id) {
        await incrementCollectionViews(collection.id);
      }

      // Check if user has liked this collection
      if (user) {
        const likedResult = await checkCollectionLiked(collection.id, user.id);
        if (likedResult.success) {
          setIsLiked(likedResult.liked);
        }
      }

      // Load comments
      const commentsResult = await getCollectionComments(collection.id);
      if (commentsResult.success) {
        setComments(commentsResult.data || []);
      }

      // Load collection items
      const itemsResult = await getCollectionItems(collection.id);
      if (itemsResult.success) {
        setItems(itemsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading collection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like collections');
      return;
    }

    try {
      const result = await toggleCollectionLike(collection.id, user.id);
      if (result.success) {
        setIsLiked(result.liked);
        setCollection(prev => ({
          ...prev,
          likes_count: prev.likes_count + (result.liked ? 1 : -1)
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleClone = async () => {
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
                Alert.alert('Success', 'Collection cloned successfully!', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
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

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await addCollectionComment(collection.id, user.id, newComment.trim());
      if (result.success) {
        setNewComment('');
        // Reload comments
        const commentsResult = await getCollectionComments(collection.id);
        if (commentsResult.success) {
          setComments(commentsResult.data || []);
        }
      } else {
        Alert.alert('Error', 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
      {/* Image */}
      {item.image_url && (
        <ImageGallery 
          images={[{ uri: item.image_url }]}
          style={styles.itemImage}
        />
      )}
      
      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.name || 'Unnamed Item'}
        </Text>
        
        {item.description && (
          <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.itemMeta}>
          {item.category && (
            <Text style={[styles.itemCategory, { color: colors.primary }]}>
              {item.category}
            </Text>
          )}
          
          {item.rarity && (
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
              <Text style={styles.rarityText}>
                {item.rarity}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return '#95a5a6';
      case 'uncommon': return '#27ae60';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return colors.textSecondary;
    }
  };

  const renderCommentModal = () => (
    <Modal
      visible={showComments}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Comments ({comments.length})
          </Text>
          <TouchableOpacity onPress={() => setShowComments(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsContainer}>
          {comments.map((comment) => (
            <View key={comment.id} style={[styles.commentItem, { borderBottomColor: colors.border }]}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>
                  @{comment.username || 'Anonymous'}
                </Text>
                <Text style={[styles.commentDate, { color: colors.textSecondary }]}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.commentContent, { color: colors.text }]}>
                {comment.content}
              </Text>
            </View>
          ))}
          
          {comments.length === 0 && (
            <View style={styles.emptyComments}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          )}
        </ScrollView>

        {user && (
          <View style={[styles.addCommentContainer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitButton, { 
                backgroundColor: newComment.trim() ? colors.primary : colors.border
              }]}
              onPress={handleAddComment}
              disabled={!newComment.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading collection...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.collectionName, { color: colors.text }]}>
              {collection.name}
            </Text>
            <Text style={[styles.ownerInfo, { color: colors.textSecondary }]}>
              by @{collection.username || 'Anonymous'}
            </Text>
          </View>
        </View>

        {/* Collection Info */}
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          {collection.description && (
            <Text style={[styles.description, { color: colors.text }]}>
              {collection.description}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color={isLiked ? "#ff4757" : colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {collection.likes_count || 0} likes
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {collection.views_count || 0} views
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {comments.length} comments
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isOwner && user?.id !== collection.user_id && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: isLiked ? "#ff4757" : colors.border
              }]}
              onPress={handleLikeToggle}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#fff" : colors.text} 
              />
              <Text style={[styles.actionButtonText, { 
                color: isLiked ? "#fff" : colors.text 
              }]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleClone}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Clone</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comments Button */}
        <TouchableOpacity
          style={[styles.commentsButton, { backgroundColor: colors.card }]}
          onPress={() => setShowComments(true)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          <Text style={[styles.commentsButtonText, { color: colors.text }]}>
            View Comments ({comments.length})
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Collection Items */}
        <View style={styles.itemsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: 16, marginBottom: 12 }]}>
            Collection Items ({items.length})
          </Text>
          
          {items.length > 0 ? (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.itemRow}
              contentContainerStyle={styles.itemsList}
              scrollEnabled={false}
            />
          ) : (
            <View style={[styles.emptyItemsContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyItemsText, { color: colors.textSecondary }]}>
                This collection is empty
              </Text>
              <Text style={[styles.emptyItemsSubtext, { color: colors.textSecondary }]}>
                No items have been added yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderCommentModal()}
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
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 20,
    fontWeight: '700',
  },
  ownerInfo: {
    fontSize: 14,
    marginTop: 2,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  commentsButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  itemsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemsPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsContainer: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addCommentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Items styles
  itemsSection: {
    marginBottom: 20,
  },
  itemsList: {
    paddingHorizontal: 16,
  },
  itemRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  itemCard: {
    width: (Dimensions.get('window').width - 48) / 2, // 2 columns with margins
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  emptyItemsContainer: {
    marginHorizontal: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PublicCollectionViewScreen;