import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { CATEGORY_LIST } from '../utils/categories';

const CategoryFilter = ({ 
  selectedCategories = [], 
  onCategoryToggle,
  style 
}) => {
  const { colors } = useTheme();
  const [showAll, setShowAll] = useState(false);
  
  const visibleCategories = showAll ? CATEGORY_LIST : CATEGORY_LIST.slice(0, 6);
  
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryToggle(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryToggle([...selectedCategories, categoryId]);
    }
  };
  
  const clearFilters = () => {
    onCategoryToggle([]);
  };
  
  const isSelected = (categoryId) => selectedCategories.includes(categoryId);
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Filtrar por categoria</Text>
        {selectedCategories.length > 0 && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {visibleCategories.map((category) => {
          const selected = isSelected(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selected ? category.color : colors.card,
                  borderColor: selected ? category.color : colors.border,
                }
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={[
                styles.categoryIcon,
                { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : category.color }
              ]}>
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color="white"
                />
              </View>
              <Text style={[
                styles.categoryText,
                { color: selected ? 'white' : colors.text }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {CATEGORY_LIST.length > 6 && (
          <TouchableOpacity
            style={[
              styles.expandButton,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setShowAll(!showAll)}
          >
            <Ionicons 
              name={showAll ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.expandText, { color: colors.textSecondary }]}>
              {showAll ? 'Menos' : 'Mas'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {selectedCategories.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedText, { color: colors.textSecondary }]}>
            {selectedCategories.length} {selectedCategories.length === 1 ? 'categoria' : 'categorias'} seleccionada{selectedCategories.length === 1 ? '' : 's'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    minHeight: 40,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 40,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  selectedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default CategoryFilter;
