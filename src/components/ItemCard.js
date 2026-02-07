// src/components/ItemCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/theme';
import { EditIcon, DeleteIcon } from './AppIcons';
import { formatCurrency } from '../utils/currencyUtils';

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
        <View style={styles.cardContent}>
          {/* Image on the left */}
          {item.images && item.images.length > 0 ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.images[0] }} style={styles.coverImage} resizeMode="cover" />
              {item.highValue && (
                <View style={[styles.highValueBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.highValueBadgeText}>💎</Text>
                </View>
              )}
            </View>
          ) : item.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.coverImage} resizeMode="cover" />
              {item.highValue && (
                <View style={[styles.highValueBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.highValueBadgeText}>💎</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[
              styles.coverImage, 
              styles.noImageContainer,
              { backgroundColor: colors.border }
            ]}>
              <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Image</Text>
            </View>
          )}

          {/* Content on the right */}
          <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
        
        {item.cardNumber ? (
          <View style={styles.cardNumberContainer}>
            <Text style={[styles.cardNumberBadge, { backgroundColor: colors.accent }]}>
              #{item.cardNumber}
            </Text>
          </View>
        ) : null}
        
        {item.description ? (
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        {item.price ? (
          <Text style={[styles.cardPrice, { color: colors.text }]}>
            Price: {formatCurrency(item.price, item.currency || item.purchase_currency)}
          </Text>
        ) : null}
        {item.condition ? (
          <Text style={[styles.cardCondition, { color: colors.textSecondary }]}>
            Condition: {item.condition}
          </Text>
        ) : null}
        
        {/* Custom fields for specific categories */}
        {item.custom_fields?.author && (
          <Text style={[styles.cardCustomField, { color: colors.textSecondary }]}>
            Autor: {item.custom_fields.author}
          </Text>
        )}
        {item.custom_fields?.style && (
          <Text style={[styles.cardCustomField, { color: colors.textSecondary }]}>
            Estilo: {item.custom_fields.style}
          </Text>
        )}
        {item.custom_fields?.height && (
          <Text style={[styles.cardCustomField, { color: colors.textSecondary }]}>
            📏 Altura: {item.custom_fields.height} cm
          </Text>
        )}
        
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
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  coverImage: {
    width: 110,
    height: 140,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  highValueBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  highValueBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
  },
  cardNumberBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  cardCondition: {
    fontSize: 13,
    marginTop: 2,
  },
  cardCustomField: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
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
    marginTop: 4,
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
