import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import TagSelector from '../components/TagSelector';
import ImageGallery from '../components/ImageGallery';
import FullscreenImageViewer from '../components/FullscreenImageViewer';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { CameraIcon, GalleryIcon, DeleteIcon, AddIcon } from '../components/AppIcons';

// Helper function to get item storage key with user ID
const getItemStorageKey = (userId, collectionId) => `${userId || 'guest'}_${collectionId}`;

const EditItemScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { collectionId, item } = route.params;

  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || '');
  const [images, setImages] = useState(item.images || (item.image ? [item.image] : []));
  const [price, setPrice] = useState(item.price || item.purchase_price || '');
  const [ebaySearchTerms, setEbaySearchTerms] = useState(item.ebay_search_terms || '');
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate || '');
  const [condition, setCondition] = useState(item.condition || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [tags, setTags] = useState(item.tags || []);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // Request permissions for camera and gallery
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permissions Required', 'We need camera and gallery permissions to add images.');
        return false;
      }
      return true;
    }
    return true;
  };

  // Open camera to take photo
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      exif: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Open gallery to select image
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      exif: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  // Remove an image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Open fullscreen image viewer
  const openFullscreen = (image, index) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    try {
      const itemStorageKey = getItemStorageKey(user?.id, collectionId);
      const existing = await AsyncStorage.getItem(itemStorageKey);
      const items = existing ? JSON.parse(existing) : [];
      const updatedItems = items.map((i) =>
        i.id === item.id ? { 
          ...i, 
          name, 
          description, 
          images,
          // Keep image field for backward compatibility
          image: images.length > 0 ? images[0] : '',
          price,
          purchase_price: price, // Update purchase price
          ebay_search_terms: ebaySearchTerms, // Update eBay search terms
          // Preserve existing price tracking data
          current_market_price: i.current_market_price || null,
          price_history: i.price_history || [],
          last_price_update: i.last_price_update || null,
          purchaseDate,
          condition,
          notes,
          tags,
          userId: user?.id || 'guest',
          updatedAt: new Date().toISOString()
        } : i
      );
      await AsyncStorage.setItem(itemStorageKey, JSON.stringify(updatedItems));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>Name*</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        value={name}
        onChangeText={setName}
        placeholder="Item Name"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={[styles.label, { color: colors.text }]}>Description</Text>
      <TextInput
        style={[styles.input, { 
          height: 100,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={[styles.label, { color: colors.text }]}>Images</Text>
      <View style={styles.imageButtons}>
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.primary }]} 
          onPress={takePhoto}
        >
          <CameraIcon color="#FFFFFF" size={18} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.secondary }]} 
          onPress={pickImage}
        >
          <GalleryIcon color="#FFFFFF" size={18} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
      </View>
      
      {images.length > 0 ? (
        <View style={styles.imagesContainer}>
          <ImageGallery 
            images={images} 
            height={200} 
            showThumbnails={true}
            allowFullscreen={true}
            onImagePress={openFullscreen}
          />
          
          <View style={styles.imagesListContainer}>
            <Text style={[styles.imagesListTitle, { color: colors.text }]}>
              All Images ({images.length})
            </Text>
            {/* Grid of images without using FlatList to avoid nesting VirtualizedLists */}
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageListItem}>
                  <Image source={{ uri: image }} style={styles.imageListThumb} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: colors.danger }]}
                    onPress={() => removeImage(index)}
                  >
                    <DeleteIcon color="#FFFFFF" size={12} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            No Images Selected
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
            Add multiple images from different perspectives
          </Text>
        </View>
      )}
      
      <FullscreenImageViewer
        images={images}
        initialIndex={fullscreenIndex}
        visible={fullscreenVisible}
        onClose={() => setFullscreenVisible(false)}
      />
      
      <TagSelector selectedTags={tags} onTagsChange={setTags} />

      <Text style={[styles.label, { color: colors.text }]}>Price</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter purchase price"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: colors.text }]}>eBay Search Terms (Optional)</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        value={ebaySearchTerms}
        onChangeText={setEbaySearchTerms}
        placeholder="Keywords to find this item on eBay for market price tracking"
        placeholderTextColor={colors.placeholder}
        multiline
      />
      {item.current_market_price && (
        <Text style={[styles.marketPriceInfo, { color: colors.success }]}>
          📈 Current market price: ${item.current_market_price}
          {item.last_price_update && ` (updated ${new Date(item.last_price_update).toLocaleDateString()})`}
        </Text>
      )}
      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        💡 Example: "iPhone 14 Pro 256GB Space Black" - helps track current market value
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>Purchase Date</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={[styles.label, { color: colors.text }]}>Condition</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        value={condition}
        onChangeText={setCondition}
        placeholder="New, Used, Mint, etc."
        placeholderTextColor={colors.placeholder}
      />

      <Text style={[styles.label, { color: colors.text }]}>Additional Notes</Text>
      <TextInput
        style={[styles.input, { 
          height: 100,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text
        }]}
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional notes"
        placeholderTextColor={colors.placeholder}
      />

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]} 
        onPress={saveItem}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 16,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  imagesContainer: {
    marginVertical: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  imagesListContainer: {
    marginTop: 16,
  },
  imagesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  imageListItem: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  imageListThumb: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  marketPriceInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
});

export default EditItemScreen;
