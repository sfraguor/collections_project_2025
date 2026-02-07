import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Platform, ScrollView, KeyboardAvoidingView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { updateCollectionVisibility } from '../utils/communityApi';
import CategorySelector from '../components/CategorySelector';
import { getCollectionById, updateCollection } from '../utils/database';

const EditCollectionScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { collectionId } = route.params;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [imageUri, setImageUri] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Cargar la colección para editar
    const loadCollection = async () => {
      setInitialLoading(true);
      try {
        if (!user?.id) {
          Alert.alert('Error', 'Please sign in to edit collections');
          navigation.goBack();
          return;
        }

        // Cargar desde Supabase
        const collection = await getCollectionById(collectionId, user.id);
        
        if (collection) {
          console.log('✅ Collection loaded:', collection);
          console.log('📂 Category:', collection.category);
          setName(collection.name || '');
          setCategory(collection.category || 'other');
          setImageUri(collection.image || null);
          setIsPublic(collection.is_public || false);
        } else {
          Alert.alert('Error', 'Collection not found');
          navigation.goBack();
        }
      } catch (e) {
        console.error('Error loading collection:', e);
        Alert.alert('Error', 'Failed to load collection');
        navigation.goBack();
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

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to update collections');
      return;
    }

    setLoading(true);
    try {
      // Actualizar en Supabase
      const updateData = {
        name: name.trim(),
        category: category,
        image: imageUri || null,
        is_public: isPublic,
      };

      await updateCollection(collectionId, user.id, updateData);
      
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading collection...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Edit Collection</Text>
        <TextInput
          placeholder="Collection Name"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { 
            borderColor: colors.border, 
            backgroundColor: colors.card,
            color: colors.text 
          }]}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Category Selector */}
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <CategorySelector
          selectedCategory={category}
          onSelect={(categoryId) => {
            setCategory(categoryId);
          }}
          style={{ marginBottom: 20 }}
        />

        <Text style={[styles.label, { color: colors.text }]}>Images</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
          <Button title="Take Photo" onPress={takePhoto} color={colors.primary} />
          <Button title="Pick Image" onPress={pickImage} color={colors.primary} />
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 20 }} />
        )}

        {/* Public/Private Toggle */}
        <View style={[styles.toggleContainer, { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              {isPublic ? '🌍 Public Collection' : '🔒 Private Collection'}
            </Text>
            <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
              {isPublic 
                ? "✅ Visible in Discovery • Others can like, comment & clone" 
                : "❌ Only visible to you • Not shown in community"
              }
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            disabled={loading}
            trackColor={{ false: '#767577', true: colors.primary + '80' }}
            thumbColor={isPublic ? colors.primary : '#f4f3f4'}
          />
        </View>

        <Button title="Save Changes" onPress={saveCollection} disabled={loading} color={colors.primary} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 24, 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
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
  },
});

export default EditCollectionScreen;
