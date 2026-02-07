import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView, Switch, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';
import { getCategoryById } from '../utils/categories';
import { createCollection } from '../utils/database';
import { uploadImage } from '../utils/imageUpload';

const AddCollectionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other'); // Categoría por defecto
  const [imageUri, setImageUri] = useState(null); // URI local de la imagen de la colección
  const [isPublic, setIsPublic] = useState(true); // Por defecto público para facilitar descubrimiento
  const [uploading, setUploading] = useState(false); // Estado de carga

  // pedir permisos para cámara y galería
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a cámara y galería.');
        return false;
      }
      return true;
    }
    return true;
  };

  // abrir cámara para tomar foto
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
      setImageUri(result.assets[0].uri);
    }
  };

  // abrir galería para seleccionar imagen
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
      setImageUri(result.assets[0].uri);
    }
  };

  const saveCollection = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a collection name');
      return;
    }
    
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to create collections');
      return;
    }

    try {
      setUploading(true);
      
      // Si hay imagen local, subirla a Supabase Storage
      let cloudImageUrl = null;
      if (imageUri && imageUri.startsWith('file://')) {
        console.log('Uploading image to Supabase Storage...');
        cloudImageUrl = await uploadImage(imageUri, user.id, 'collection');
        
        if (!cloudImageUrl) {
          Alert.alert('Warning', 'Failed to upload image, but collection will be created without it.');
        }
      }

      const collectionId = uuid.v4();
      const newCollection = {
        id: collectionId,
        name: name.trim(),
        category: category,
        image: cloudImageUrl || imageUri || null, // Usar URL de cloud si existe, sino URI local
        is_public: isPublic,
      };

      // Crear en Supabase
      await createCollection(user.id, newCollection);
      
      Alert.alert(
        'Success!', 
        `Collection "${name.trim()}" created ${isPublic ? 'as public' : 'as private'}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error('Error saving collection:', e);
      Alert.alert('Error', 'Failed to save collection: ' + e.message);
    } finally {
      setUploading(false);
    }
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add New Collection</Text>
        <TextInput
          placeholder="Collection Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Categoría</Text>
          <CategorySelector
            selectedCategory={category}
            onCategorySelect={setCategory}
            placeholder="Seleccionar categoría"
            style={styles.categorySelector}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
          <Button title="Take Photo" onPress={takePhoto} />
          <Button title="Pick Image" onPress={pickImage} />
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 20 }} />
        )}

        {/* Public/Private Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>
              {isPublic ? '🌍 Public Collection' : '🔒 Private Collection'}
            </Text>
            <Text style={styles.toggleDescription}>
              {isPublic 
                ? "✅ Will be discoverable by other users in the community" 
                : "❌ Only visible to you"
              }
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPublic ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        ) : (
          <Button title="Save Collection" onPress={saveCollection} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#222', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
});

export default AddCollectionScreen;
