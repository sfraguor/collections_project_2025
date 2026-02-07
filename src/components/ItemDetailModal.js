// src/components/ItemDetailModal.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/theme';
import ImageGallery from './ImageGallery';
import FullscreenImageViewer from './FullscreenImageViewer';
import { EditIcon, DeleteIcon } from './AppIcons';
import { formatCurrency } from '../utils/currencyUtils';

/**
 * A modal component for displaying detailed information about an item
 * 
 * @param {Object} item - The item object to display
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {Function} onEdit - Function to call when the edit button is pressed
 * @param {Function} onDelete - Function to call when the delete button is pressed
 */
export default function ItemDetailModal({ 
  item, 
  visible, 
  onClose, 
  onEdit, 
  onDelete 
}) {
  const { colors } = useTheme();
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  
  if (!item) return null;
  
  // Handle image press to open fullscreen viewer
  const handleImagePress = (image, index) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          style={[styles.modalContent, { backgroundColor: colors.card }]} 
          onStartShouldSetResponder={() => true}
        >
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{item.name}</Text>
          
          {/* Display images using ImageGallery component */}
          {item.images && item.images.length > 0 ? (
            <ImageGallery 
              images={item.images} 
              height={220}
              showThumbnails={true}
              allowFullscreen={true}
              onImagePress={handleImagePress}
            />
          ) : item.image ? (
            // For backward compatibility with old items that have a single image
            <Image source={{ uri: item.image }} style={styles.modalImage} />
          ) : (
            <View style={[
              styles.modalImage, 
              styles.noImageContainer,
              { backgroundColor: colors.border }
            ]}>
              <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Images</Text>
            </View>
          )}
          
          {/* Fullscreen image viewer */}
          <FullscreenImageViewer
            images={item.images || (item.image ? [item.image] : [])}
            initialIndex={fullscreenIndex}
            visible={fullscreenVisible}
            onClose={() => setFullscreenVisible(false)}
          />
          
          <View style={styles.modalDetails}>
            {item.description ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Description:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            ) : null}
            
            {item.price ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Purchase Price:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {formatCurrency(item.price, item.currency || item.purchase_currency)}
                </Text>
              </View>
            ) : null}
            
            {item.current_market_price ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Market Price:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {formatCurrency(item.current_market_price, item.current_market_currency)}
                </Text>
                {item.last_price_update && (
                  <Text style={[styles.detailValue, { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }]}>
                    Updated: {new Date(item.last_price_update).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ) : null}
            
            {item.purchaseDate ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Purchase Date:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{item.purchaseDate}</Text>
              </View>
            ) : null}
            
            {item.condition ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Condition:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{item.condition}</Text>
              </View>
            ) : null}
            
            {item.notes ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Notes:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{item.notes}</Text>
              </View>
            ) : null}
            
            {item.createdAt ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Added:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
            
            {item.updatedAt ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Last Updated:</Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
            
            {item.tags && item.tags.length > 0 ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {item.tags.map(tag => (
                    <View 
                      key={tag} 
                      style={[styles.tagChip, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={onEdit}
            >
              <EditIcon color="#FFFFFF" size={18} style={styles.buttonIcon} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: colors.danger }]}
              onPress={onDelete}
            >
              <DeleteIcon color="#FFFFFF" size={18} style={styles.buttonIcon} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalScrollView: {
    width: '100%',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    zIndex: 1,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalDetails: {
    marginTop: 16,
    marginBottom: 16,
    zIndex: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 2,
  },
  editButton: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
