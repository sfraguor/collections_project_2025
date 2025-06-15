// src/components/ItemCard.js
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

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
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverImage, styles.noImageContainer]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
        ) : null}
        {item.price ? (
          <Text style={styles.cardPrice}>Price: {item.price}</Text>
        ) : null}
        {item.condition ? (
          <Text style={styles.cardCondition}>Condition: {item.condition}</Text>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
