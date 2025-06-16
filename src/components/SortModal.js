// src/components/SortModal.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

/**
 * A modal component for selecting sorting options
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {string} sortBy - The current sort field
 * @param {string} sortOrder - The current sort order ('asc' or 'desc')
 * @param {Array} options - Array of sorting options
 * @param {string} options[].value - The value to use for sorting
 * @param {string} options[].label - The label to display
 * @param {Function} onSelect - Function to call when an option is selected
 */
export default function SortModal({ 
  visible, 
  onClose, 
  sortBy, 
  sortOrder, 
  options,
  onSelect 
}) {
  const { colors } = useTheme();
  
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
          <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
          
          {options.map((option) => (
            <TouchableOpacity 
              key={option.value}
              style={[
                styles.sortOption, 
                { borderBottomColor: colors.border },
                sortBy === option.value && [
                  styles.selectedSortOption, 
                  { backgroundColor: colors.border }
                ]
              ]} 
              onPress={() => {
                onSelect(
                  option.value, 
                  sortBy === option.value && sortOrder === 'asc' ? 'desc' : 'asc'
                );
              }}
            >
              <Text style={[styles.sortOptionText, { color: colors.text }]}>
                {option.label} {sortBy === option.value ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.border }]} 
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
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
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedSortOption: {
    borderRadius: 8,
  },
  sortOptionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
