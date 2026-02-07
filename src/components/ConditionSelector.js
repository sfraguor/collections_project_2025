// src/components/ConditionSelector.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { CONDITION_STATES, getConditionById } from '../utils/conditionStates';

/**
 * ConditionSelector component - Modal selector for item condition
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when closing the modal
 * @param {Function} onSelect - Function to call when a condition is selected
 * @param {string} selectedCondition - Currently selected condition ID
 */
export default function ConditionSelector({ visible, onClose, onSelect, selectedCondition }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConditions = CONDITION_STATES.filter(condition =>
    condition.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    condition.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (conditionId) => {
    onSelect(conditionId);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Seleccionar Condición
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar condición..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.conditionsList} showsVerticalScrollIndicator={false}>
            {/* Clear/None option */}
            <TouchableOpacity
              style={[
                styles.conditionItem,
                { 
                  borderColor: colors.border,
                  backgroundColor: !selectedCondition ? colors.primary + '20' : 'transparent',
                }
              ]}
              onPress={() => handleSelect('')}
            >
              <View style={[styles.conditionIcon, { backgroundColor: colors.border }]}>
                <Ionicons name="remove" size={24} color={colors.textSecondary} />
              </View>
              <View style={styles.conditionInfo}>
                <Text style={[styles.conditionLabel, { color: colors.text }]}>
                  Sin especificar
                </Text>
                <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                  No establecer condición
                </Text>
              </View>
              {!selectedCondition && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            {filteredConditions.map((condition) => {
              const isSelected = selectedCondition === condition.id;
              return (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionItem,
                    { 
                      borderColor: colors.border,
                      backgroundColor: isSelected ? condition.color + '20' : 'transparent',
                    }
                  ]}
                  onPress={() => handleSelect(condition.id)}
                >
                  <View style={[styles.conditionIcon, { backgroundColor: condition.color }]}>
                    <Ionicons name={condition.icon} size={24} color="white" />
                  </View>
                  <View style={styles.conditionInfo}>
                    <Text style={[styles.conditionLabel, { color: colors.text }]}>
                      {condition.label}
                    </Text>
                    <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                      {condition.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={condition.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  conditionsList: {
    paddingHorizontal: 20,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  conditionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  conditionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
