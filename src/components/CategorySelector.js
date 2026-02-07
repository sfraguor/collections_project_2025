import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { CATEGORY_LIST, getCategoryById } from '../utils/categories';

const CategorySelector = ({ 
  selectedCategory, 
  onSelect,
  onCategorySelect, // Deprecated, use onSelect
  placeholder = "Seleccionar categoría",
  style 
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support both prop names for backwards compatibility
  const handleSelection = onSelect || onCategorySelect;
  
  // Filtrar categorías por búsqueda
  const filteredCategories = CATEGORY_LIST.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedCategoryData = selectedCategory ? getCategoryById(selectedCategory) : null;
  
  const handleCategorySelect = (category) => {
    if (handleSelection) {
      handleSelection(category.id);
    }
    setModalVisible(false);
    setSearchQuery('');
  };
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { 
          backgroundColor: colors.card,
          borderColor: selectedCategory === item.id ? item.color : colors.border,
          borderWidth: selectedCategory === item.id ? 2 : 1,
        }
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={styles.categoryItemLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="white" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
      {selectedCategory === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={item.color} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          style
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedCategoryData ? (
            <View style={styles.selectedCategory}>
              <View style={[styles.selectedIcon, { backgroundColor: selectedCategoryData.color }]}>
                <Ionicons name={selectedCategoryData.icon} size={20} color="white" />
              </View>
              <Text style={[styles.selectedText, { color: colors.text }]}>
                {selectedCategoryData.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {placeholder}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Seleccionar Categoría
            </Text>
            <View style={styles.cancelButton} />
          </View>
          
          <View style={styles.searchContainer}>
            <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchText, { color: colors.text }]}
                placeholder="Buscar categorías..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            style={styles.categoriesList}
            contentContainerStyle={styles.categoriesContent}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  selectorContent: {
    flex: 1,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    width: 60,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default CategorySelector;