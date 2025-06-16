// src/components/CollectionItem.js
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/theme';
import { EditIcon, DeleteIcon } from './AppIcons';

/**
 * A reusable component for displaying a collection in a list
 * 
 * @param {Object} collection - The collection object to display
 * @param {string} collection.name - The name of the collection
 * @param {string} collection.cover - The URI of the collection's cover image
 * @param {string} collection.id - The unique ID of the collection
 * @param {number} itemCount - The number of items in the collection
 * @param {Function} onPress - Function to call when the collection is pressed
 * @param {Function} onEdit - Function to call when the edit button is pressed
 * @param {Function} onDelete - Function to call when the delete button is pressed
 */
export default function CollectionItem({ 
  collection, 
  itemCount = 0, 
  onPress, 
  onEdit, 
  onDelete 
}) {
  const { colors } = useTheme();
  
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
        {collection.cover ? (
          <Image source={{ uri: collection.cover }} style={styles.coverImage} />
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
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{collection.name}</Text>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{itemCount} items</Text>
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
  cardTextContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 12 
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
