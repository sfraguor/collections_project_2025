import React, { useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import TagSelector from '../components/TagSelector';
import ConditionSelector from '../components/ConditionSelector';
import ImageGallery from '../components/ImageGallery';
import FullscreenImageViewer from '../components/FullscreenImageViewer';
import { uploadImage } from '../utils/imageUpload';
import PriceInput from '../components/PriceInput';
import { useTheme } from '../theme/theme';
import { getConditionById } from '../utils/conditionStates';
import { useAuth } from '../context/AuthContext';
import { CameraIcon, GalleryIcon, DeleteIcon, AddIcon } from '../components/AppIcons';
import { DEFAULT_CURRENCY } from '../utils/currencyUtils';
import { createItem, getCollectionById } from '../utils/database';

const AddItemScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { collectionId } = route.params;

  const [collection, setCollection] = useState(null);
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState(''); // Número o código de la carta
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [highValue, setHighValue] = useState(false); // Item de alto valor
  const [ebaySearchTerms, setEbaySearchTerms] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [showConditionSelector, setShowConditionSelector] = useState(false);
  
  // Custom fields for specific categories
  const [kokeshiAuthor, setKokeshiAuthor] = useState('');
  const [kokeshiStyle, setKokeshiStyle] = useState('');
  const [itemHeight, setItemHeight] = useState('');

  // Kokeshi styles options
  const kokeshiStyles = [
    'Naruko', 'Tsuchiyu', 'Tōgatta', 'Yajirō', 'Sakunami', 
    'Hijiori', 'Zaō', 'Nambu', 'Kijiyama', 'Tsugaru', 
    'Nakanosawa', 'Tokyo', 'Desconocido'
  ];

  // Load collection to check category
  React.useEffect(() => {
    console.log('🔍 AddItemScreen mounted. User:', user?.id, 'CollectionId:', collectionId);
    const loadCollection = async () => {
      if (user?.id && collectionId) {
        console.log('📥 Loading collection...');
        const col = await getCollectionById(collectionId, user.id);
        console.log('📦 Collection loaded:', col);
        setCollection(col);
      } else {
        console.log('⚠️ Missing user or collectionId');
      }
    };
    loadCollection();
  }, [user?.id, collectionId]);

  // Check if collection is a trading card collection
  const isCardCollection = collection?.category === 'trading-cards' || collection?.category === 'cartas-coleccionables';
  
  // Check if collection is kokeshi or mingei (both need size field)
  const isKokeshiCollection = collection?.category === 'kokeshi';
  const isMingeiCollection = collection?.category === 'mingei';
  const needsHeightField = isKokeshiCollection || isMingeiCollection;
  
  console.log('🎎 Render - Is Kokeshi Collection?', isKokeshiCollection, 'Category:', collection?.category);
  
  // Debug: Log collection info
  React.useEffect(() => {
    if (collection) {
      console.log('📦 Collection loaded:', collection.name, 'Category:', collection.category);
      console.log('🎎 Is Kokeshi Collection?', isKokeshiCollection);
    }
  }, [collection, isKokeshiCollection]);

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
    
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to add items');
      return;
    }
    
    // Upload images to Supabase Storage
    console.log('📤 Uploading item images to Supabase Storage...');
    const uploadedImages = [];
    for (const imageUri of images) {
      try {
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
          console.log('📤 Uploading local image:', imageUri);
          const publicUrl = await uploadImage(imageUri, user.id, 'item');
          uploadedImages.push(publicUrl);
          console.log('✅ Image uploaded successfully:', publicUrl);
        } else {
          // Already a cloud URL
          uploadedImages.push(imageUri);
        }
      } catch (error) {
        console.error('❌ Error uploading image:', error);
        Alert.alert('Error', `Failed to upload image: ${error.message}`);
        return;
      }
    }
    
    // Build custom_fields based on collection category
    const customFields = {};
    if (isKokeshiCollection) {
      if (kokeshiAuthor) customFields.author = kokeshiAuthor;
      if (kokeshiStyle) customFields.style = kokeshiStyle;
    }
    if (needsHeightField && itemHeight) {
      customFields.height = itemHeight;
    }
    
    const newItem = {
      id: uuid.v4(),
      collection_id: collectionId,
      name,
      card_number: cardNumber?.trim() || null,
      description,
      images: uploadedImages,
      price: price || '',
      purchase_price: price || '',
      currency: currency,
      purchase_currency: currency,
      current_market_price: null,
      current_market_currency: null,
      ebay_search_terms: ebaySearchTerms || '',
      price_history: [],
      last_price_update: null,
      high_value: highValue,
      purchase_date: purchaseDate || '',
      condition: condition || '',
      notes: notes || '',
      tags: tags || [],
      custom_fields: customFields,
    };

    // Debug log to verify eBay search terms are being saved
    console.log('💾 Saving item:', newItem.name, 'Card#:', newItem.card_number, 'eBay terms:', newItem.ebay_search_terms);

    try {
      await createItem(user.id, newItem);
      Alert.alert('Success', 'Item added successfully');
      navigation.goBack();
    } catch (e) {
      console.error('❌ Error saving item:', e);
      console.error('❌ Error message:', e.message);
      console.error('❌ Error details:', JSON.stringify(e, null, 2));
      Alert.alert('Error', `Failed to save item: ${e.message || 'Unknown error'}`);
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

      {/* Card Number field - only for card collections */}
      {isCardCollection && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Card Number / Code</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text
            }]}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="e.g., UGM1-014, PSA-123"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
          />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            🔍 Para cartas: introduce el numero o codigo unico
          </Text>
        </>
      )}

      {/* High Value Toggle */}
      <View style={styles.highValueContainer}>
        <View style={styles.highValueLabel}>
          <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>💎 Item de Alto Valor</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary, marginTop: 4 }]}>
            Marca items que han aumentado significativamente de valor
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { 
              backgroundColor: highValue ? colors.gold : colors.border,
              borderColor: highValue ? colors.goldDark : colors.border,
            }
          ]}
          onPress={() => setHighValue(!highValue)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.toggleButtonText,
            { color: highValue ? '#000' : colors.textSecondary }
          ]}>
            {highValue ? '✓ SÍ' : 'NO'}
          </Text>
        </TouchableOpacity>
      </View>

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

      {/* Kokeshi-specific fields */}
      {isKokeshiCollection && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Autor</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text
            }]}
            value={kokeshiAuthor}
            onChangeText={setKokeshiAuthor}
            placeholder="Nombre del artista"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={[styles.label, { color: colors.text }]}>Estilo</Text>
          <View style={[styles.pickerContainer, { 
            borderColor: colors.border,
            backgroundColor: colors.card,
          }]}>
            <Picker
              selectedValue={kokeshiStyle}
              onValueChange={setKokeshiStyle}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="Seleccionar estilo..." value="" />
              {kokeshiStyles.map(style => (
                <Picker.Item key={style} label={style} value={style} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Height field for kokeshi and mingei */}
      {needsHeightField && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Altura (cm)</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text
            }]}
            value={itemHeight}
            onChangeText={setItemHeight}
            placeholder="Ej: 15.5"
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>📏 Altura del item en centímetros</Text>
        </>
      )}

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

      <PriceInput
        label="Purchase Price"
        value={price}
        onValueChange={setPrice}
        currency={currency}
        onCurrencyChange={setCurrency}
        placeholder="Enter purchase price"
        required={false}
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
      <TouchableOpacity
        style={[styles.selectorButton, { 
          borderColor: colors.border,
          backgroundColor: colors.card,
        }]}
        onPress={() => setShowConditionSelector(true)}
      >
        {condition ? (
          <View style={styles.selectedConditionContainer}>
            {(() => {
              const conditionData = getConditionById(condition);
              return conditionData ? (
                <>
                  <View style={[styles.conditionColorDot, { backgroundColor: conditionData.color }]} />
                  <Text style={[styles.selectedConditionText, { color: colors.text }]}>
                    {conditionData.label}
                  </Text>
                </>
              ) : (
                <Text style={[styles.placeholderText, { color: colors.placeholder }]}>
                  {condition}
                </Text>
              );
            })()}
          </View>
        ) : (
          <Text style={[styles.placeholderText, { color: colors.placeholder }]}>
            Seleccionar condición...
          </Text>
        )}
        <Text style={[styles.selectorArrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

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
        <Text style={styles.saveButtonText}>Save Item</Text>
      </TouchableOpacity>

      {/* Condition Selector Modal */}
      <ConditionSelector
        visible={showConditionSelector}
        onClose={() => setShowConditionSelector(false)}
        onSelect={setCondition}
        selectedCondition={condition}
      />
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
    marginBottom: 12,
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
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  highValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  highValueLabel: {
    flex: 1,
    marginRight: 12,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  selectorButton: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedConditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  selectedConditionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
  },
  selectorArrow: {
    fontSize: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});

export default AddItemScreen;
