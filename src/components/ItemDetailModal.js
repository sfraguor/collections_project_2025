// src/components/ItemDetailModal.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';

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
  if (!item) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>{item.name}</Text>
          
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.modalImage} />
          ) : (
            <View style={[styles.modalImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          
          <View style={styles.modalDetails}>
            {item.description ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{item.description}</Text>
              </View>
            ) : null}
            
            {item.price ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price:</Text>
                <Text style={styles.detailValue}>{item.price}</Text>
              </View>
            ) : null}
            
            {item.purchaseDate ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchase Date:</Text>
                <Text style={styles.detailValue}>{item.purchaseDate}</Text>
              </View>
            ) : null}
            
            {item.condition ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>{item.condition}</Text>
              </View>
            ) : null}
            
            {item.notes ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailValue}>{item.notes}</Text>
              </View>
            ) : null}
            
            {item.createdAt ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
            
            {item.updatedAt ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
          
          <View style={styles.modalActions}>
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
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
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
  modalDetails: {
    marginBottom: 16,
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
  },
  editButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#f33',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
