import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// Storage key with user ID to separate data by user
const getStorageKey = (userId) => `collections_${userId || 'guest'}`;

const AddCollectionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null); // URI local de la imagen de la colección
  const [isPublic, setIsPublic] = useState(true); // Por defecto público para facilitar descubrimiento

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
    try {
      const storageKey = getStorageKey(user?.id);
      const json = await AsyncStorage.getItem(storageKey);
      let collections = json ? JSON.parse(json) : [];

      collections = collections.filter(c => typeof c.name === 'string');

      if (collections.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
        Alert.alert('Validation', 'A collection with this name already exists.');
        return;
      }

      const collectionId = uuid.v4();
      const newCollection = {
        id: collectionId,
        name: name.trim(),
        image: imageUri || null, // URI de la imagen seleccionada
        userId: user?.id || 'guest',
        is_public: isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar en Supabase si hay usuario
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('collections')
            .insert({
              id: collectionId,
              name: name.trim(),
              image: imageUri || null, // Solo usar 'image'
              user_id: user.id,
              is_public: isPublic,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            console.error('Supabase insert error:', error);
          } else {
            console.log('✅ Collection created in Supabase:', data);
          }
        } catch (supabaseError) {
          console.error('Supabase error:', supabaseError);
          // Continuar con AsyncStorage como fallback
        }
      }

      collections.push(newCollection);
      await AsyncStorage.setItem(storageKey, JSON.stringify(collections));
      
      Alert.alert(
        'Success!', 
        `Collection "${name.trim()}" created ${isPublic ? 'as public' : 'as private'}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error('Error saving collection:', e);
      Alert.alert('Error', 'Failed to save collection: ' + e.message);
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

        <Button title="Save Collection" onPress={saveCollection} />
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
});

export default AddCollectionScreen;
