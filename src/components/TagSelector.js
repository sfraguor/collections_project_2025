// src/components/TagSelector.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ScrollView,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/theme';

const TAGS_STORAGE_KEY = 'app_tags';

/**
 * A component for selecting and managing tags for items
 * 
 * @param {Array} selectedTags - Array of currently selected tags
 * @param {Function} onTagsChange - Function to call when tags are changed
 */
export default function TagSelector({ selectedTags = [], onTagsChange }) {
  const { colors } = useTheme();
  const [allTags, setAllTags] = useState([]);
  const [newTagText, setNewTagText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Load all available tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tagsJson = await AsyncStorage.getItem(TAGS_STORAGE_KEY);
      if (tagsJson) {
        setAllTags(JSON.parse(tagsJson));
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // Save tags to AsyncStorage
  const saveTags = async (tags) => {
    try {
      await AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  // Add a new tag
  const addTag = async () => {
    if (!newTagText.trim()) return;
    
    const tagText = newTagText.trim();
    const tagExists = allTags.some(tag => 
      tag.toLowerCase() === tagText.toLowerCase()
    );
    
    if (!tagExists) {
      const updatedTags = [...allTags, tagText];
      setAllTags(updatedTags);
      saveTags(updatedTags);
    }
    
    // Add to selected tags if not already selected
    if (!selectedTags.some(tag => tag.toLowerCase() === tagText.toLowerCase())) {
      const updatedSelectedTags = [...selectedTags, tagText];
      onTagsChange(updatedSelectedTags);
    }
    
    setNewTagText('');
  };

  // Toggle a tag selection
  const toggleTag = (tag) => {
    const isSelected = selectedTags.some(t => t === tag);
    
    if (isSelected) {
      // Remove tag
      const updatedTags = selectedTags.filter(t => t !== tag);
      onTagsChange(updatedTags);
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };

  // Delete a tag from all tags
  const deleteTag = async (tagToDelete) => {
    // Remove from all tags
    const updatedAllTags = allTags.filter(tag => tag !== tagToDelete);
    setAllTags(updatedAllTags);
    saveTags(updatedAllTags);
    
    // Remove from selected tags if present
    if (selectedTags.includes(tagToDelete)) {
      const updatedSelectedTags = selectedTags.filter(tag => tag !== tagToDelete);
      onTagsChange(updatedSelectedTags);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectedTagsContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Tags:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedTagsScroll}
        >
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, { backgroundColor: colors.primary }]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={styles.tagChipText}>{tag}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noTagsText, { color: colors.textSecondary }]}>
              No tags selected
            </Text>
          )}
        </ScrollView>
      </View>
      
      <TouchableOpacity
        style={[styles.manageButton, { backgroundColor: colors.secondary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.manageButtonText}>Manage Tags</Text>
      </TouchableOpacity>
      
      {/* Tags Management Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Manage Tags</Text>
            
            <View style={styles.addTagContainer}>
              <TextInput
                style={[
                  styles.tagInput, 
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                placeholder="Add new tag..."
                placeholderTextColor={colors.placeholder}
                value={newTagText}
                onChangeText={setNewTagText}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={addTag}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Tags</Text>
            
            <ScrollView style={styles.tagsList}>
              {allTags.length > 0 ? (
                allTags.map(tag => (
                  <View key={tag} style={styles.tagRow}>
                    <TouchableOpacity
                      style={[
                        styles.tagChip,
                        { 
                          backgroundColor: selectedTags.includes(tag) 
                            ? colors.primary 
                            : colors.border 
                        }
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text 
                        style={[
                          styles.tagChipText,
                          { color: selectedTags.includes(tag) ? '#fff' : colors.text }
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                      onPress={() => deleteTag(tag)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.noTagsText, { color: colors.textSecondary }]}>
                  No tags available
                </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectedTagsContainer: {
    marginBottom: 8,
  },
  selectedTagsScroll: {
    paddingBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagChipText: {
    color: '#fff',
    fontWeight: '500',
  },
  noTagsText: {
    fontStyle: 'italic',
  },
  manageButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  addTagContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '600',
  },
});
