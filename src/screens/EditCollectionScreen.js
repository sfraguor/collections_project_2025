import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const STORAGE_KEY = 'collections';

const EditCollectionScreen = ({ route, navigation }) => {
  const { collectionId } = route.params;
  const [name, setName] = useState('');
  const [cover, setCover] = useState(null);

  useEffect(() => {
    // Cargar la colección para editar
    const loadCollection = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const collections = JSON.parse(json);
          const collection = collections.find(c => c.id === collectionId);
          if (collection) {
            setName(collection.name);
            setCover(collection.cover);
          }
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load collection');
      }
    };
    loadCollection();
  }, [collectionId]);

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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCover(result.assets[0].uri);
    }
  };

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
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      let collections = json ? JSON.parse(json) : [];

      // Validar que no haya otro con el mismo nombre (excluyendo el que editamos)
      if (collections.some(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== collectionId)) {
        Alert.alert('Validation', 'A collection with this name already exists.');
        return;
      }

      // Actualizar la colección editada
      collections = collections.map(c => {
        if (c.id === collectionId) {
          return { ...c, name: name.trim(), cover: cover || null };
        }
        return c;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save collection');
    }
  };

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

        {cover && (
          <Image source={{ uri: cover }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 20 }} />
        )}

        <Button title="Save Changes" onPress={saveCollection} />
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

export default EditCollectionScreen;
