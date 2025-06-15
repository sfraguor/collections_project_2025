// src/components/CollectionItem.js
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.card}>
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
            ]}
          >
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{collection.name}</Text>
          <Text style={styles.itemCount}>{itemCount} items</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
