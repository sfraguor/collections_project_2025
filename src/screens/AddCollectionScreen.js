import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { useAuth } from '../context/AuthContext';

// Storage key with user ID to separate data by user
const getStorageKey = (userId) => `collections_${userId || 'guest'}`;

const AddCollectionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null); // aquí guardaremos la URI local de la imagen

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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCover(result.assets[0].uri);
    }
  };

  // abrir galería para seleccionar imagen
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCover(result.assets[0].uri);
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

      const newCollection = {
        id: uuid.v4(),
        name: name.trim(),
        cover: cover || null,
        userId: user?.id || 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      collections.push(newCollection);

      await AsyncStorage.setItem(storageKey, JSON.stringify(collections));
      navigation.goBack();
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

        {cover && (
          <Image source={{ uri: cover }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 20 }} />
        )}

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
});

export default AddCollectionScreen;
