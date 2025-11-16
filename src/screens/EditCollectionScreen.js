import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { updateCollectionVisibility } from '../utils/communityApi';
import { supabase } from '../utils/supabase';

// Storage key with user ID to separate data by user
const getStorageKey = (userId) => `collections_${userId || 'guest'}`;

const EditCollectionScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { collectionId } = route.params;
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Cargar la colección para editar
    const loadCollection = async () => {
      setInitialLoading(true);
      try {
        // Intentar cargar desde Supabase primero
        if (user?.id) {
          const { data: supabaseCollection, error } = await supabase
            .from('collections')
            .select('id, name, is_public, image')
            .eq('id', collectionId)
            .eq('user_id', user.id)
            .single();

          if (!error && supabaseCollection) {
            console.log('✅ Collection loaded from Supabase:', supabaseCollection);
            setName(supabaseCollection.name || '');
            setImageUri(supabaseCollection.image || null);
            setIsPublic(supabaseCollection.is_public || false);
            setInitialLoading(false);
            return;
          } else {
            console.log('⚠️ Collection not found in Supabase, trying AsyncStorage');
          }
        }

        // Fallback a AsyncStorage si no está en Supabase
        const storageKey = getStorageKey(user?.id);
        const json = await AsyncStorage.getItem(storageKey);
        if (json) {
          const collections = JSON.parse(json);
          const collection = collections.find(c => c.id === collectionId);
          if (collection) {
            setName(collection.name || '');
            setImageUri(collection.image || collection.cover || null); // Compatibilidad con datos viejos
            setIsPublic(collection.is_public || false);
          }
        }
      } catch (e) {
        console.error('Error loading collection:', e);
        Alert.alert('Error', 'Failed to load collection');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId, user?.id]);

  // Reutilizamos funciones para permisos y selección de imagen (como en AddCollectionScreen)
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

    setLoading(true);
    try {
      // Actualizar en Supabase si existe el usuario
      if (user?.id) {
        const { data, error } = await supabase
          .from('collections')
          .update({
            name: name.trim(),
            image: imageUri || null, // Solo usar 'image'
            is_public: isPublic,
            updated_at: new Date().toISOString()
          })
          .eq('id', collectionId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          // Continuar con AsyncStorage como fallback
        } else {
          console.log('✅ Collection updated in Supabase:', data);
        }
      }

      // También actualizar AsyncStorage para compatibilidad
      const storageKey = getStorageKey(user?.id);
      const json = await AsyncStorage.getItem(storageKey);
      let collections = json ? JSON.parse(json) : [];

      // Validar que no haya otro con el mismo nombre (excluyendo el que editamos)
      if (collections.some(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== collectionId)) {
        Alert.alert('Validation', 'A collection with this name already exists.');
        return;
      }

      // Actualizar la colección editada
      collections = collections.map(c => {
        if (c.id === collectionId) {
          return { 
            ...c, 
            name: name.trim(), 
            image: imageUri || null, // Solo image
            is_public: isPublic,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });

      await AsyncStorage.setItem(storageKey, JSON.stringify(collections));
      
      Alert.alert(
        'Success', 
        'Collection updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error('Error saving collection:', e);
      Alert.alert('Error', 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Collection</Text>
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
                ? "✅ Visible in Discovery • Others can like, comment & clone" 
                : "❌ Only visible to you • Not shown in community"
              }
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic} // Simplificado - se guarda al hacer "Save Changes"
            disabled={loading}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPublic ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <Button title="Save Changes" onPress={saveCollection} disabled={loading} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default EditCollectionScreen;
