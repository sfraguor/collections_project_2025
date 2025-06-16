// src/components/ItemCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/theme';
import { EditIcon, DeleteIcon } from './AppIcons';

/**
 * A reusable component for displaying an item in a collection
 * 
 * @param {Object} item - The item object to display
 * @param {string} item.name - The name of the item
 * @param {string} item.description - The description of the item
 * @param {string} item.image - The URI of the item's image
 * @param {string} item.price - The price of the item
 * @param {string} item.condition - The condition of the item
 * @param {Function} onPress - Function to call when the item is pressed
 * @param {Function} onEdit - Function to call when the edit button is pressed
 * @param {Function} onDelete - Function to call when the delete button is pressed
 */
export default function ItemCard({ 
  item, 
  onPress, 
  onEdit, 
  onDelete 
}) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          shadowColor: colors.text
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.cardGradientStart, colors.cardGradientEnd]}
        style={styles.cardGradient}
      >
  {item.images && item.images.length > 0 ? (
    <Image source={{ uri: item.images[0] }} style={styles.coverImage} />
  ) : item.image ? (
    // For backward compatibility with old items that have a single image
    <Image source={{ uri: item.image }} style={styles.coverImage} />
  ) : (
    <View style={[
      styles.coverImage, 
      styles.noImageContainer,
      { backgroundColor: colors.border }
    ]}>
      <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Image</Text>
    </View>
  )}
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
        {item.description ? (
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        {item.price ? (
          <Text style={[styles.cardPrice, { color: colors.text }]}>
            Price: {item.price}
          </Text>
        ) : null}
        {item.condition ? (
          <Text style={[styles.cardCondition, { color: colors.textSecondary }]}>
            Condition: {item.condition}
          </Text>
        ) : null}
        
        {item.tags && item.tags.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScrollView}
            contentContainerStyle={styles.tagsContainer}
          >
            {item.tags.map(tag => (
              <View 
                key={tag} 
                style={[styles.tagChip, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
      </LinearGradient>
      <View style={styles.cardActions}>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    paddingBottom: 12,
    overflow: 'hidden',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
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
  cardTextContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  cardCondition: {
    fontSize: 15,
    marginTop: 2,
  },
  cardActions: {
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
  tagsScrollView: {
    marginTop: 6,
  },
  tagsContainer: {
    paddingRight: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 4,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
