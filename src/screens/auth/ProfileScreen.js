import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../utils/supabase';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, updateProfile, signOut, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while picking the image.');
      console.error(error);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      
      if (data) {
        setAvatarUrl(data.publicUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the image.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await updateProfile({
        name,
        avatar_url: avatarUrl,
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Your profile has been updated.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Your Profile</Text>
          
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.avatarPlaceholderText, { color: colors.text }]}
                  >
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
              
              <View
                style={[
                  styles.editAvatarButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.editAvatarButtonText}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={submitting || loading}
            >
              {submitting || loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.signOutButton, { borderColor: colors.border }]}
              onPress={handleSignOut}
            >
              <Text style={[styles.signOutButtonText, { color: colors.danger }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  profileContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  editAvatarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emailText: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
