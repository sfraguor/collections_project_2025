// src/components/ShareCollectionModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../theme/theme';

/**
 * A modal component for sharing collections with others
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {Object} collection - The collection to share
 */
const ShareCollectionModal = ({ visible, onClose, collection }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [shareOption, setShareOption] = useState('link'); // 'link' or 'file'
  const [includeItems, setIncludeItems] = useState(true);
  const [message, setMessage] = useState('');

  // Generate a shareable link (this would typically connect to a backend)
  const generateShareableLink = async () => {
    setLoading(true);
    try {
      // In a real app, this would call a backend API to create a shareable link
      // For now, we'll create a JSON representation that could be shared
      
      // Get collection items if needed
      let items = [];
      if (includeItems) {
        const itemsJson = await AsyncStorage.getItem(collection.id);
        items = itemsJson ? JSON.parse(itemsJson) : [];
      }
      
      // Create shareable data
      const shareData = {
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          image: collection.image,
          createdAt: collection.createdAt,
        },
        items: includeItems ? items : [],
        sharedBy: 'User', // In a real app, this would be the current user's name
        sharedAt: new Date().toISOString(),
        message: message,
      };
      
      // In a real app with a backend, we would post this data and get a link back
      // For now, we'll just create a JSON string that could be shared
      const shareText = `Check out my collection "${collection.name}"!\n\n${
        message ? message + '\n\n' : ''
      }Items: ${items.length}\n\nOpen in Colecciones App to view.`;
      
      // Use the Share API to share the text
      const result = await Share.share({
        message: shareText,
        title: `Collection: ${collection.name}`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(`Shared with ${result.activityType}`);
        } else {
          // shared
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing collection:', error);
      Alert.alert('Error', 'Failed to share collection');
    } finally {
      setLoading(false);
    }
  };

  // Share collection as a file
  const shareAsFile = async () => {
    setLoading(true);
    try {
      // Get collection items if needed
      let items = [];
      if (includeItems) {
        const itemsJson = await AsyncStorage.getItem(collection.id);
        items = itemsJson ? JSON.parse(itemsJson) : [];
      }
      
      // Create shareable data
      const shareData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          image: collection.image,
          createdAt: collection.createdAt,
        },
        items: includeItems ? items : [],
        sharedBy: 'User', // In a real app, this would be the current user's name
        message: message,
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(shareData, null, 2);
      
      // Create a temporary file
      const safeCollectionName = collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDate = new Date().toISOString().split('T')[0];
      const fileName = `coleccion_compartida_${safeCollectionName}_${fileDate}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write data to file
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share the file
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: `Share Collection: ${collection.name}`,
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing collection as file:', error);
      Alert.alert('Error', 'Failed to share collection');
    } finally {
      setLoading(false);
    }
  };

  // Handle share button press
  const handleShare = () => {
    if (shareOption === 'link') {
      generateShareableLink();
    } else {
      shareAsFile();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Share Collection
          </Text>
          
          <Text style={[styles.collectionName, { color: colors.text }]}>
            {collection?.name || ''}
          </Text>
          
          <ScrollView style={styles.optionsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Share Options
            </Text>
            
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  shareOption === 'link' && { 
                    backgroundColor: colors.primary,
                    borderColor: colors.primary 
                  },
                  shareOption !== 'link' && { 
                    backgroundColor: 'transparent',
                    borderColor: colors.border 
                  },
                ]}
                onPress={() => setShareOption('link')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    { color: shareOption === 'link' ? '#fff' : colors.text },
                  ]}
                >
                  Share Link
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  shareOption === 'file' && { 
                    backgroundColor: colors.primary,
                    borderColor: colors.primary 
                  },
                  shareOption !== 'file' && { 
                    backgroundColor: 'transparent',
                    borderColor: colors.border 
                  },
                ]}
                onPress={() => setShareOption('file')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    { color: shareOption === 'file' ? '#fff' : colors.text },
                  ]}
                >
                  Export File
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIncludeItems(!includeItems)}
              >
                <View
                  style={[
                    styles.checkboxInner,
                    {
                      borderColor: colors.primary,
                      backgroundColor: includeItems
                        ? colors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  {includeItems && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Include items in collection
              </Text>
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Add a message (optional):
            </Text>
            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Write a message..."
              placeholderTextColor={colors.placeholder}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.shareButtonText}>
                  {shareOption === 'link' ? 'Share Collection' : 'Export Collection'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  optionButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  messageInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    marginTop: 8,
  },
  shareButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ShareCollectionModal;
