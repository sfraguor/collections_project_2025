// src/components/CollectionItem.js
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { EditIcon, DeleteIcon } from './AppIcons';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/currencyUtils';

/**
 * A reusable component for displaying a collection in a list
 * 
 * @param {Object} collection - The collection object to display
 * @param {string} collection.name - The name of the collection
 * @param {string} collection.cover - The URI of the collection's cover image
 * @param {string} collection.id - The unique ID of the collection
 * @param {string} collection.category - The category ID of the collection
 * @param {number} itemCount - The number of items in the collection
 * @param {number} totalInvested - The total amount invested in the collection
 * @param {Function} onPress - Function to call when the collection is pressed
 * @param {Function} onEdit - Function to call when the edit button is pressed
 * @param {Function} onDelete - Function to call when the delete button is pressed
 */
export default function CollectionItem({ 
  collection, 
  itemCount = 0,
  totalInvested = 0,
  onPress, 
  onEdit, 
  onDelete 
}) {
  const { colors } = useTheme();
  const categoryData = getCategoryById(collection.category || 'other');
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.card,
        shadowColor: colors.text,
      }
    ]}>
      <LinearGradient
        colors={[colors.cardGradientStart, colors.cardGradientEnd]}
        style={styles.cardGradient}
      >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {(collection.cover || collection.image) ? (
          <Image source={{ uri: collection.cover || collection.image }} style={styles.coverImage} />
        ) : (
          <View
            style={[
              styles.coverImage,
              styles.noImageContainer,
              { backgroundColor: colors.border }
            ]}
          >
            <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Image</Text>
          </View>
        )}
        
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryData.color }]}>
          <Ionicons name={categoryData.icon} size={12} color="white" />
          <Text style={styles.categoryBadgeText}>{categoryData.name}</Text>
        </View>
        
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{collection.name}</Text>
          <View style={styles.metaContainer}>
            <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{itemCount} items</Text>
            <View style={styles.categoryChip}>
              <Ionicons name={categoryData.icon} size={14} color={categoryData.color} />
              <Text style={[styles.categoryChipText, { color: categoryData.color }]}>
                {categoryData.name}
              </Text>
            </View>
          </View>
          {totalInvested > 0 && (
            <View style={styles.investmentContainer}>
              <Ionicons name="cash-outline" size={16} color={colors.success} style={styles.investmentIcon} />
              <Text style={[styles.investmentText, { color: colors.success }]}>
                Invertido: {formatCurrency(totalInvested)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      </LinearGradient>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={onEdit}
        >
          <EditIcon color="#FFFFFF" size={16} style={styles.buttonIcon} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={onDelete}
        >
          <DeleteIcon color="#FFFFFF" size={16} style={styles.buttonIcon} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    paddingBottom: 12,
  },
  cardGradient: {
    flex: 1,
    width: '100%',
  },
  coverImage: { 
    width: '100%', 
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTextContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardTitle: { 
    fontSize: 22, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  itemCount: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  investmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  investmentIcon: {
    marginRight: 4,
  },
  investmentText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 4,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
