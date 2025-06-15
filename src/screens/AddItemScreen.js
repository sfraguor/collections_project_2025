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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const AddItemScreen = ({ route, navigation }) => {
  const { collectionId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');

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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Open gallery to select image
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      name,
      description,
      image,
      price: price || '',
      purchaseDate: purchaseDate || '',
      condition: condition || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem(collectionId);
      const items = existing ? JSON.parse(existing) : [];
      items.push(newItem);
      await AsyncStorage.setItem(collectionId, JSON.stringify(items));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name*</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Item Name"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />

      <Text style={styles.label}>Image</Text>
      <View style={styles.imageButtons}>
        <Button title="Take Photo" onPress={takePhoto} />
        <Button title="Pick Image" onPress={pickImage} />
      </View>
      {image ? (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No Image Selected</Text>
        </View>
      )}

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Purchase Date</Text>
      <TextInput
        style={styles.input}
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Condition</Text>
      <TextInput
        style={styles.input}
        value={condition}
        onChangeText={setCondition}
        placeholder="New, Used, Mint, etc."
      />

      <Text style={styles.label}>Additional Notes</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional notes"
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
        <Text style={styles.saveButtonText}>Save Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
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
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  },
  saveButton: {
    backgroundColor: '#222',
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
});

export default AddItemScreen;
