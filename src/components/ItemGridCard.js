// src/components/ItemGridCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * A compact grid card component for displaying items in a grid layout
 */
export default function ItemGridCard({ item, onPress }) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image */}
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage, { backgroundColor: colors.border }]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
      )}
      
      {/* High Value Badge */}
      {item.highValue && (
        <View style={[styles.highValueBadge, { backgroundColor: colors.gold }]}>
          <Text style={styles.highValueText}>💎</Text>
        </View>
      )}
      
      {/* Card Number Badge */}
      {item.cardNumber && (
        <View style={[styles.cardNumberBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.cardNumberText}>#{item.cardNumber}</Text>
        </View>
      )}
      
      {/* Name overlay */}
      <View style={styles.nameOverlay}>
        <Text style={styles.nameText} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  highValueBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  highValueText: {
    fontSize: 16,
  },
  cardNumberBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  cardNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  nameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
